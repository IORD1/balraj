import * as THREE from 'three'

/** Palette exactly as authored in the original page. */
export const COLORS = {
  bgDeep: 0x0a0a0f,
  structureDark: 0x1a1a22,
  structureMid: 0x2a2a35,
  amber: 0xe8804a,
  amberBright: 0xff9a5c,
  warmWhite: 0xf4ede4,
  teal: 0x5a8a8a,
  purpleDeep: 0x1a0f2e,
  windowLit: 0xffb070,
} as const

export const HEX = {
  amber: '#e8804a',
  amberBright: '#ff9a5c',
  warmWhite: '#f4ede4',
  teal: '#5a8a8a',
  bg: '#0a0a0f',
  dim: 'rgba(244,237,228,0.45)',
} as const

export const FONTS = {
  serif: '"Fraunces", serif',
  sans: '"Inter", sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const

/**
 * The original scene was authored on three r128, before colour management:
 * hex values went to the GPU as *linear* RGB. Modern three treats hex as sRGB
 * and darkens it on the way in, which would crush this dark palette to black.
 * `lc()` ("legacy colour") reproduces the r128 look under modern colour
 * management. Use it for every procedural material / light colour.
 * glTF assets need nothing special: their loader already tags colour spaces.
 */
const cache = new Map<number, THREE.Color>()
export function lc(hex: number): THREE.Color {
  let c = cache.get(hex)
  if (!c) {
    c = new THREE.Color().setHex(hex, THREE.LinearSRGBColorSpace)
    cache.set(hex, c)
  }
  return c
}
