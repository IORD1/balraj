import { CORRIDOR } from '../config/layout'

export const CORRIDOR_MID_Z = CORRIDOR.zStart - CORRIDOR.length / 2

/** Eight ceiling fixtures spaced evenly down the corridor. */
export const CORRIDOR_FIXTURE_Z: number[] = Array.from(
  { length: 8 },
  (_, i) => CORRIDOR.zStart - 2 - (i * (CORRIDOR.length - 4)) / 7,
)

/** Glowing archway at the corridor's end, just before the agent room. */
export const ARCH = {
  position: [0, 1.2, -67] as [number, number, number],
  glow: [0, 2.5, -69] as [number, number, number],
} as const
