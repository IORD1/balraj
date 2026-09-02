import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { ROOM } from '../config/layout'
import { INTRO_EVENTS, ORBIT, TIMING } from '../config/timing'
import { FINAL_CAMERA_POSE, getCameraPoseAtTime } from '../lib/cameraPath'
import { useExperience, type Phase } from '../state/experience'

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

/**
 * Drives the camera and the time-based intro events.
 *   INTRO        keyframed flight: title → city → building → corridor → agent room
 *   ORBIT        slow circle around the agent form while a run is in progress
 *   INTERACTIVE  camera parked at the final intro pose
 * All timers are derived from the R3F clock and reset whenever `runId` changes,
 * so a replay never races React's render/effect cycle. Runs before every other
 * useFrame callback (negative priority) so they always see this frame's camera.
 */
export function CameraRig() {
  const runSeen = useRef(-1)
  const introStart = useRef(0)
  const flashFired = useRef(false)
  const orbitSeen = useRef(-1)
  const orbitStart = useRef(0)
  const lastPhase = useRef<Phase>('INTRO')

  useFrame(({ camera, clock }) => {
    const s = useExperience.getState()
    const now = clock.elapsedTime

    if (s.runId !== runSeen.current) {
      runSeen.current = s.runId
      introStart.current = now
      flashFired.current = false
    }

    if (DEBUG_POSE) {
      camera.position.set(...DEBUG_POSE.pos)
      camera.lookAt(...DEBUG_POSE.look)
    }

    if (s.phase === 'INTRO') {
      const t = now - introStart.current
      if (!DEBUG_POSE) {
        const pose = getCameraPoseAtTime(t)
        camera.position.set(pose.pos[0], pose.pos[1], pose.pos[2])
        camera.lookAt(pose.look[0], pose.look[1], pose.look[2])
      }

      if (t >= TIMING.act1_total && s.introCardVisible) s.hideIntroCard()
      if (t >= INTRO_EVENTS.doorsOpenAt && !s.doorsOpen) s.openDoors()
      if (t >= INTRO_EVENTS.entryFlashAt && !flashFired.current) {
        flashFired.current = true
        s.fireFlash()
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
    }

    lastPhase.current = s.phase
  }, -1)

  return null
}
