import { CAMERA_KEYFRAMES, type Vec3 } from '../config/timing'
import { easeInOutCubic } from './easing'

export interface CameraPose {
  pos: Vec3
  look: Vec3
}

const first = CAMERA_KEYFRAMES[0]
const last = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1]

export const FINAL_CAMERA_POSE: CameraPose = { pos: last.pos, look: last.look }

function lerp3(a: Vec3, b: Vec3, k: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]
}

/** Camera pose along the intro path at `time` seconds (eased per segment). */
export function getCameraPoseAtTime(time: number): CameraPose {
  if (time <= first.t) return { pos: first.pos, look: first.look }
  if (time >= last.t) return FINAL_CAMERA_POSE
  for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
    const a = CAMERA_KEYFRAMES[i]
    const b = CAMERA_KEYFRAMES[i + 1]
    if (b.t <= a.t) continue // guard against duplicate timestamps
    if (time >= a.t && time <= b.t) {
      const eased = easeInOutCubic((time - a.t) / (b.t - a.t))
      return { pos: lerp3(a.pos, b.pos, eased), look: lerp3(a.look, b.look, eased) }
    }
  }
  return FINAL_CAMERA_POSE
}
