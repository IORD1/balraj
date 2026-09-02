/** Spatial layout of the scene, in world units. Z runs negative into the building. */

export const ROOM_CENTER_Z = -82

export const ROOM = {
  radius: 14,
  height: 8,
  centerZ: ROOM_CENTER_Z,
  screenHeight: 3.4,
  screenInset: 0.15,
  screenSize: [4, 2.5] as [number, number],
} as const

export const CORRIDOR = {
  zStart: -22,
  length: 45,
  width: 8,
  height: 6,
} as const

export const DOOR = {
  closedX: 0.7,
  openX: 2.2,
  y: 2,
  z: -21.75,
  /** Height a door model is scaled to (the doorway cut in the building is 3.8 tall). */
  height: 3.9,
  /** Width of the door frame at that height (door.glb is 1.5 wide for 2.1 tall). */
  width: 2.8,
} as const

/**
 * Portal built around the door so it reads as part of the façade (the doorway cut in the
 * glazing is a raw edge), plus the wall that closes the corridor mouth behind the glazing.
 */
export const ENTRANCE = {
  /** Pilaster width either side of the door frame. */
  jamb: 0.35,
  /** Beam height above the door frame. */
  lintel: 0.5,
  /** Portal depth, and how far its face stands proud of the glazing plane (DOOR.z). */
  depth: 0.5,
  protrude: 0.35,
  /** Step under the door. */
  sill: 0.06,
  /** Wall just inside the glazing; the door frame overlaps its opening by `overlap` on each edge. */
  wall: { width: 8.2, height: 7, z: -21.97, overlap: 0.05 },
} as const

export const HERO_BUILDING = {
  width: 18,
  depth: 18,
  height: 55,
  z: -30,
} as const

/** "AVANTIA" plate near the top of the hero façade (world space). */
export const HERO_SIGN = {
  position: [0, 48, -20.3] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  size: [8, 2] as [number, number],
} as const

/** Framework panels hang alternately on the left/right corridor walls. */
export const PANELS = {
  firstZ: -27,
  spacing: 5,
  /** Just off the corridor wall surface (the corridor model’s inner walls are at x ≈ ±3.87). */
  wallX: 3.55,
  y: 2.5,
  size: [3.2, 2.0] as [number, number],
  baseEmissive: 0.35,
  /** Panel pulses (and its corridor label shows) once the camera passes zPos + this. */
  triggerOffset: 3,
  /** Re-armed once the camera backs out this far behind the trigger, so a scrubbed flight pulses it again. */
  rearmOffset: 2,
  pulseSeconds: 1.4,
} as const

export const AGENT_FORM = { y: 2.2 } as const
