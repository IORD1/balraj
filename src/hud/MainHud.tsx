import { useState } from 'react'
import { DEFAULT_BRIEF, ENGAGEMENT } from '../config/content'
import { useExperience } from '../state/experience'

/** Act 5 HUD: branding corners, the brief input, Run Agent and Replay. */
export function MainHud() {
  const phase = useExperience((s) => s.phase)
  const agentRunning = useExperience((s) => s.agentRunning)
  const runAgent = useExperience((s) => s.runAgent)
  const replayIntro = useExperience((s) => s.replayIntro)
  const [brief, setBrief] = useState(DEFAULT_BRIEF)

  const run = () => {
    void runAgent(brief)
  }

  return (
    <div id="hud-main" className={phase !== 'INTRO' ? 'show' : undefined}>
      <div className="hud-corner tl">
        <div className="logo-mark">{ENGAGEMENT.firm}</div>
        <div className="dept">{ENGAGEMENT.division}</div>
      </div>
      <div className="hud-corner tr">
        <div className="engagement-label">{ENGAGEMENT.project}</div>
        <div className="engagement-client">{ENGAGEMENT.client}</div>
      </div>
      <div className="hud-bottom">
        <input
          type="text"
          id="brief-input"
          placeholder="Brief the agent..."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') run()
          }}
        />
        <button type="button" id="run-agent" onClick={run} disabled={agentRunning}>
          Run Agent
        </button>
      </div>
      <div className="hud-bottom-right">
        <button type="button" id="replay" onClick={replayIntro}>
          ↺ Replay intro
        </button>
      </div>
    </div>
  )
}
