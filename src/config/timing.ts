/** Intro choreography, in seconds from the moment the scene is ready. */
export const TIMING = {
  act1_titleFadeIn: 0.8,
  act1_titleHold: 1.5,
  act1_titleFadeOut: 0.7,
  act1_total: 3.0,
  act2_cityReveal: 6.0,
  act3_buildingApproach: 4.0,
  act3_doorsOpen: 1.0,
  act3_entryFlash: 0.5,
  act4_corridorTraverse: 7.0,
  act5_arrival: 3.0,
  intro_total: 25.0,
} as const

export const INTRO_EVENTS = {
  /** The leaf takes act3_doorsOpen to swing, so it is fully open well before the camera arrives (t ≈ 14.5). */
  doorsOpenAt: 12.4,
  entryFlashAt: 14.9,
} as const

export const ORBIT = {
  duration: 15,
  radius: 6,
  height: 4.5,
  lookY: 2.5,
} as const

export const AGENT_RUN = {
  screenIntervalMs: 2500,
  summaryDelayMs: 2000,
} as const

export const CORRIDOR_LABEL_HOLD_MS = 1900
/** Wall-screen glow: flash on activation, settle to a steady glow; `standby` is the unlit look. */
export const SCREEN_SETTLE = { from: 1.2, to: 0.5, seconds: 0.9, standby: 0.3 } as const

/**
 * Scroll-driven flight. Wheel, touch and arrow keys move a target along the camera path and
 * the camera eases towards it, so the flight can be scrubbed back and forth by hand;
 * "auto mode" plays it on the clock instead.
 */
export const SCROLL = {
  /** Seconds of flight per pixel of wheel travel (one mouse notch ≈ 100 px ≈ 0.8 s). */
  secondsPerPixel: 0.008,
  /** A finger drag covers less distance than a wheel for the same intent. */
  touchSecondsPerPixel: 0.02,
  /** Arrow / page keys step this many seconds. */
  keyStep: 1.5,
  /** Easing rate of the camera towards the scrub target, per second (higher = snappier). */
  ease: 4.5,
} as const

export type Vec3 = [number, number, number]
export interface CameraKeyframe { t: number; pos: Vec3; look: Vec3 }

export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  { t: 0.0, pos: [0, 40, 120], look: [0, 20, 0] },
  { t: 3.0, pos: [0, 40, 120], look: [0, 20, 0] },
  { t: 6.0, pos: [0, 32, 80], look: [0, 20, -10] },
  { t: 9.0, pos: [0, 20, 30], look: [0, 15, -20] },
  { t: 11.0, pos: [0, 8, 0], look: [0, 4, -20] },
  // approach aimed at the middle of the doorway (door is DOOR.height tall, centred on x = 0)
  { t: 13.5, pos: [0, 3, -16], look: [0, 2, -22] },
  { t: 14.5, pos: [0, 2, -22.15], look: [0, 2, -30] }, // just past the corridor model's front plane (z = -22)
  { t: 15.0, pos: [0, 2, -24], look: [0, 2.2, -40] },
  { t: 15.5, pos: [0, 2.1, -26], look: [0, 2.5, -50] },
  { t: 18.5, pos: [0, 2.8, -42], look: [0, 3, -60] },
  { t: 22.0, pos: [0, 3, -65], look: [0, 3, -75] },
  { t: 24.0, pos: [0, 4, -75], look: [0, 2.5, -82] },
  { t: 25.0, pos: [4, 4.5, -74], look: [0, 2.5, -82] },
]
