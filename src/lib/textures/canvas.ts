import * as THREE from 'three'

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

export function ctx2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  return ctx
}

/** Wrap a drawn canvas as an sRGB texture. Every texture is drawn once and cached. */
export function makeTexture(canvas: HTMLCanvasElement, anisotropy = 8): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = anisotropy
  return tex
}

/** Canvas letter-spacing is Chromium-only; harmless elsewhere. */
export function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = value
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = String(text).split(' ')
  let line = ''
  let ly = y
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, ly)
      line = w
      ly += lineHeight
    } else line = test
  }
  if (line) ctx.fillText(line, x, ly)
  return ly
}

export function arrowDown(ctx: CanvasRenderingContext2D, x: number, yTop: number, yBot: number) {
  ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yBot); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - 7, yBot - 10); ctx.lineTo(x, yBot); ctx.lineTo(x + 7, yBot - 10); ctx.stroke()
}

export function arrowRight(ctx: CanvasRenderingContext2D, xL: number, xR: number, y: number) {
  ctx.beginPath(); ctx.moveTo(xL, y); ctx.lineTo(xR, y); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(xR - 10, y - 6); ctx.lineTo(xR, y); ctx.lineTo(xR - 10, y + 6); ctx.stroke()
}

export function hexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const px = cx + Math.cos(a) * r
    const py = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.stroke()
}
