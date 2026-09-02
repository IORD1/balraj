import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { ROOM } from '../config/layout'
import { INTRO_EVENTS, ORBIT, SCROLL, TIMING } from '../config/timing'
import { FINAL_CAMERA_POSE, getCameraPoseAtTime } from '../lib/cameraPath'
import { clamp } from '../lib/easing'
import { flight } from '../lib/flight'
import { useExperience, type FlightMode, type Phase } from '../state/experience'

type Vec3 = [number, number, number]

/**
 * Debug camera: open the page with `?cam=x,y,z&look=x,y,z` to park the camera at a fixed
 * pose (the intro's timers, doors and flash still run on schedule). Handy for checking how a
 * model sits in the scene, e.g. ?cam=0,2,-30&look=0,2,-21.75 views the entrance from inside.
 */
const DEBUG_POSE: { pos: Vec3; look: Vec3 } | null = (() => {
  if (typeof location === 'undefined') return null
  const q = new URLSearchParams(location.search)
  const parse = (v: string | null): Vec3 | null => {
    const n = v?.split(',').map(Number)
    return n && n.length === 3 && n.every(Number.isFinite) ? (n as Vec3) : null
  }
  const pos = parse(q.get('cam'))
  return pos ? { pos, look: parse(q.get('look')) ?? [0, 2, ROOM.centerZ] } : null
})()

/** Re-arm the entry flash once the flight is scrubbed back this far before it. */
const FLASH_REARM = 1

/**
 * Drives the camera and the intro events.
 *   INTRO        flight along the keyframed path: title → city → building → corridor → room.
 *                Auto mode advances on the clock; scroll mode eases towards the scrub target,
 *                so the same path can be walked back and forth. Every event (title card,
 *                doors, flash, arrival) is derived from the position, hence reversible.
 *   ORBIT        slow circle around the agent form while a run is in progress
 *   INTERACTIVE  camera parked at the final intro pose (or wherever the orbit ended)
 * Timers derive from the R3F clock and reset whenever `runId` changes, so a replay never
 * races React's render/effect cycle. Runs before every other useFrame callback (negative
 * priority) so they always see this frame's camera.
 */
export function CameraRig() {
  const runSeen = useRef(-1)
  const modeSeen = useRef<FlightMode>('auto')
  /** Flight time and clock time at which auto-play (re)started. */
  const autoFrom = useRef({ time: 0, at: 0 })
  const flightTime = useRef(0)
  const flashArmed = useRef(true)
  const orbitSeen = useRef(-1)
  const orbitStart = useRef(0)
  const lastPhase = useRef<Phase>('INTRO')
  const progressShown = useRef(-1)

  useFrame(({ camera, clock }, rawDelta) => {
    const s = useExperience.getState()
    const now = clock.elapsedTime
    const dt = clamp(rawDelta, 0, 0.1)

    if (s.runId !== runSeen.current) {
      runSeen.current = s.runId
      flightTime.current = 0
      autoFrom.current = { time: 0, at: now }
      modeSeen.current = s.flightMode
      flashArmed.current = true
    }
    if (s.flightMode !== modeSeen.current) {
      modeSeen.current = s.flightMode
      // auto-play resumes from wherever the scrub left the camera
      if (s.flightMode === 'auto') autoFrom.current = { time: flightTime.current, at: now }
    }

    if (DEBUG_POSE) {
      camera.position.set(...DEBUG_POSE.pos)
      camera.lookAt(...DEBUG_POSE.look)
    }

    if (s.phase === 'INTRO') {
      let t = flightTime.current
      if (s.flightMode === 'auto') {
        t = autoFrom.current.time + (now - autoFrom.current.at)
      } else {
        const gap = s.flightTarget - t
        t = Math.abs(gap) < 0.002 ? s.flightTarget : t + gap * (1 - Math.exp(-SCROLL.ease * dt))
      }
      t = clamp(t, 0, TIMING.intro_total)
      flightTime.current = t
      flight.time = t

      if (!DEBUG_POSE) {
        const pose = getCameraPoseAtTime(t)
        camera.position.set(pose.pos[0], pose.pos[1], pose.pos[2])
        camera.lookAt(pose.look[0], pose.look[1], pose.look[2])
      }

      const cardVisible = t < TIMING.act1_total
      if (cardVisible !== s.introCardVisible) s.setIntroCardVisible(cardVisible)
      const doorsOpen = t >= INTRO_EVENTS.doorsOpenAt
      if (doorsOpen !== s.doorsOpen) s.setDoorsOpen(doorsOpen)
      if (t >= INTRO_EVENTS.entryFlashAt) {
        if (flashArmed.current) {
          flashArmed.current = false
          s.fireFlash()
        }
      } else if (t < INTRO_EVENTS.entryFlashAt - FLASH_REARM) {
        flashArmed.current = true
      }
      if (t >= TIMING.intro_total) s.completeIntro()
    } else if (DEBUG_POSE) {
      // parked by the debug pose above
    } else if (s.phase === 'ORBIT') {
      if (s.orbitRun !== orbitSeen.current) {
        orbitSeen.current = s.orbitRun
        orbitStart.current = now
      }
      const elapsed = now - orbitStart.current
      const angle = (elapsed / ORBIT.duration) * Math.PI * 2
      camera.position.set(Math.cos(angle) * ORBIT.radius, ORBIT.height, ROOM.centerZ + Math.sin(angle) * ORBIT.radius)
      camera.lookAt(0, ORBIT.lookY, ROOM.centerZ)
      if (elapsed > ORBIT.duration) s.endOrbit()
    } else if (lastPhase.current === 'INTRO') {
      // intro finished or was skipped: park at the final keyframe
      const { pos, look } = FINAL_CAMERA_POSE
      camera.position.set(pos[0], pos[1], pos[2])
      camera.lookAt(look[0], look[1], look[2])
      flightTime.current = TIMING.intro_total
      flight.time = TIMING.intro_total
    }

    // progress line in the HUD (a CSS variable, so no React render per frame)
    const progress = flight.time / TIMING.intro_total
    if (Math.abs(progress - progressShown.current) > 0.002) {
      progressShown.current = progress
      document.documentElement.style.setProperty('--flight', progress.toFixed(3))
    }

    lastPhase.current = s.phase
  }, -1)

  return null
}
