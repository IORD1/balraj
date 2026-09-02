import { create } from 'zustand'
import { SCREEN_COUNT, type AgentOutput } from '../config/content'
import { AGENT_RUN } from '../config/timing'
import { sleep } from '../lib/easing'
import { requestAgentRun } from '../services/agent'

export type Phase = 'INTRO' | 'INTERACTIVE' | 'ORBIT'

export interface CorridorLabel {
  name: string
  subtitle: string
  key: number
}

export interface ExperienceState {
  /** Increments on every replay; per-frame components reset their timers when it changes. */
  runId: number
  phase: Phase
  sceneReady: boolean
  introCardVisible: boolean
  doorsOpen: boolean
  /** Doors jump straight to open (skip intro) instead of animating. */
  doorsSnap: boolean
  /** Increments each time the entry flash fires (keys the CSS animation). */
  flashKey: number
  corridorLabel: CorridorLabel | null
  agentRunning: boolean
  /** Increments each time an agent run starts, so the camera orbit restarts. */
  orbitRun: number
  /** Per-screen activation counter; > 0 means lit. Re-activation re-flashes the screen. */
  screenActivations: number[]
  agentResult: AgentOutput | null
  summaryVisible: boolean
  modalOpen: boolean

  setSceneReady: () => void
  hideIntroCard: () => void
  openDoors: () => void
  fireFlash: () => void
  showCorridorLabel: (name: string, subtitle: string) => void
  completeIntro: () => void
  endOrbit: () => void
  skipIntro: () => void
  replayIntro: () => void
  runAgent: (brief: string) => Promise<void>
  openModal: () => void
  closeModal: () => void
}

const freshScreens = () => Array.from({ length: SCREEN_COUNT }, () => 0)

export const useExperience = create<ExperienceState>()((set, get) => ({
  runId: 0,
  phase: 'INTRO',
  sceneReady: false,
  introCardVisible: true,
  doorsOpen: false,
  doorsSnap: false,
  flashKey: 0,
  corridorLabel: null,
  agentRunning: false,
  orbitRun: 0,
  screenActivations: freshScreens(),
  agentResult: null,
  summaryVisible: false,
  modalOpen: false,

  setSceneReady: () => set({ sceneReady: true }),
  hideIntroCard: () => set({ introCardVisible: false }),
  openDoors: () => set({ doorsOpen: true }),
  fireFlash: () => set((s) => ({ flashKey: s.flashKey + 1 })),
  showCorridorLabel: (name, subtitle) =>
    set((s) => ({ corridorLabel: { name, subtitle, key: (s.corridorLabel?.key ?? 0) + 1 } })),
  completeIntro: () => set((s) => (s.phase === 'INTRO' ? { phase: 'INTERACTIVE', corridorLabel: null } : {})),
  endOrbit: () => set((s) => (s.phase === 'ORBIT' ? { phase: 'INTERACTIVE' } : {})),

  skipIntro: () =>
    set({
      phase: 'INTERACTIVE',
      doorsOpen: true,
      doorsSnap: true,
      introCardVisible: false,
      corridorLabel: null,
    }),

  // full reset back to Act 1
  replayIntro: () =>
    set((s) => ({
      runId: s.runId + 1,
      phase: 'INTRO',
      agentRunning: false,
      doorsOpen: false,
      doorsSnap: false,
      introCardVisible: true,
      corridorLabel: null,
      screenActivations: freshScreens(),
      agentResult: null,
      summaryVisible: false,
      modalOpen: false,
    })),

  runAgent: async (brief) => {
    const { agentRunning, runId } = get()
    if (agentRunning) return
    set((s) => ({ agentRunning: true, summaryVisible: false, phase: 'ORBIT', orbitRun: s.orbitRun + 1 }))
    // a replay in the meantime cancels this run
    const live = () => get().runId === runId && get().agentRunning

    const result = await requestAgentRun(brief)
    if (!live()) return
    set({ agentResult: result.output })

    const count = Math.min(result.screenCount, SCREEN_COUNT)
    for (let i = 0; i < count; i++) {
      await sleep(AGENT_RUN.screenIntervalMs)
      if (!live()) return
      set((s) => {
        const screenActivations = s.screenActivations.slice()
        screenActivations[i] += 1
        return { screenActivations }
      })
    }

    await sleep(AGENT_RUN.summaryDelayMs)
    if (!live()) return
    set({ summaryVisible: true, agentRunning: false })
  },

  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
}))
