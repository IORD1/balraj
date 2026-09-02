import { FONTS, HEX } from '../../config/theme'
import { ctx2d, makeCanvas, setLetterSpacing } from './canvas'

/** Building signage (hero tower). */
export function createSignCanvas(text: string): HTMLCanvasElement {
  const c = makeCanvas(512, 128)
  const ctx = ctx2d(c)
  ctx.fillStyle = HEX.bg
  ctx.fillRect(0, 0, 512, 128)
  ctx.fillStyle = HEX.warmWhite
  ctx.font = 'bold 62px ' + FONTS.serif
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  setLetterSpacing(ctx, '10px')
  ctx.fillText(text, 256, 68)
  return c
}
