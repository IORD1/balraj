import { FONTS, HEX } from '../../config/theme'
import { ctx2d, makeCanvas, setLetterSpacing, wrapText } from './canvas'

function screenFrame(ctx: CanvasRenderingContext2D, title: string) {
  ctx.fillStyle = HEX.bg
  ctx.fillRect(0, 0, 1024, 640)
  ctx.strokeStyle = 'rgba(232,128,74,0.7)'
  ctx.lineWidth = 3
  ctx.strokeRect(16, 16, 992, 608)
  ctx.fillStyle = HEX.amberBright
  ctx.font = '400 26px ' + FONTS.mono
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  setLetterSpacing(ctx, '6px')
  ctx.fillText(title, 52, 52)
  setLetterSpacing(ctx, '0px')
  ctx.strokeStyle = 'rgba(232,128,74,0.35)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(52, 104); ctx.lineTo(972, 104); ctx.stroke()
}

/**
 * Agent-room wall screen `i` (Act 5).
 * TODO: replace this canvas mock with the server-rendered analysis payload for screen i
 * (see src/services/agent.ts).
 */
export function createScreenCanvas(i: number): HTMLCanvasElement {
  const c = makeCanvas(1024, 640)
  const ctx = ctx2d(c)

  if (i === 0) {
    screenFrame(ctx, 'DISCOVER · E5 FRAMEWORK')
    const rows: [string, string][] = [
      ['EXPAND', '12-day TAT is symptom, not problem'],
      ['EXAMINE', 'Legacy LOS · manual reconciliation · branch variance'],
      ['EMPATHIZE', 'RM burden · credit approver bottleneck'],
      ['ELEVATE', 'Ownership sits with IT, needs business joint ownership'],
      ['ENVISION', 'Control layer around core, not through it'],
    ]
    rows.forEach((r, k) => {
      const y = 150 + k * 92
      ctx.strokeStyle = 'rgba(232,128,74,0.45)'; ctx.lineWidth = 1
      ctx.strokeRect(52, y, 920, 76)
      ctx.fillStyle = 'rgba(232,128,74,0.14)'; ctx.fillRect(52, y, 250, 76)
      ctx.fillStyle = HEX.amberBright; ctx.font = '500 24px ' + FONTS.sans
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      ctx.fillText(r[0], 76, y + 38)
      ctx.fillStyle = HEX.warmWhite; ctx.font = '400 21px ' + FONTS.sans
      ctx.fillText(r[1], 326, y + 38)
    })
  }

  if (i === 1) {
    screenFrame(ctx, 'DIAGNOSE · McKINSEY 7S')
    const nodes: [string, boolean][] = [
      ['STRATEGY', true], ['STRUCTURE', true], ['SYSTEMS', false], ['SKILLS', true],
      ['STYLE', false], ['STAFF', false], ['SHARED VALUES', true],
    ]
    const cx = 512, cy = 390, orbitR = 190, nodeR = 62
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    nodes.forEach((_, k) => {
      const a = (k / 7) * Math.PI * 2 - Math.PI / 2
      ctx.strokeStyle = 'rgba(232,128,74,0.35)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * orbitR, cy + Math.sin(a) * orbitR); ctx.stroke()
    })
    nodes.forEach((n, k) => {
      const a = (k / 7) * Math.PI * 2 - Math.PI / 2
      const nx = cx + Math.cos(a) * orbitR, ny = cy + Math.sin(a) * orbitR
      ctx.fillStyle = HEX.bg
      ctx.beginPath(); ctx.arc(nx, ny, nodeR, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = n[1] ? HEX.teal : HEX.amberBright; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = HEX.warmWhite; ctx.font = '400 15px ' + FONTS.sans
      wrapText(ctx, n[0], nx, ny - 6, 104, 17)
      ctx.fillStyle = n[1] ? HEX.teal : HEX.amberBright
      ctx.beginPath(); ctx.arc(nx, ny + 34, 6, 0, Math.PI * 2); ctx.fill()
    })
    ctx.fillStyle = 'rgba(232,128,74,0.9)'
    ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = HEX.bg; ctx.font = 'bold 34px ' + FONTS.serif
    ctx.fillText('7S', cx, cy + 1)
    ctx.textAlign = 'left'; ctx.font = '400 17px ' + FONTS.mono
    ctx.fillStyle = HEX.teal; ctx.fillText('● ALIGNED  4', 60, 596)
    ctx.fillStyle = HEX.amberBright; ctx.fillText('● MISALIGNED  3', 240, 596)
  }

  if (i === 2) {
    screenFrame(ctx, 'DEFINE · REQUIREMENTS')
    const heads = ['BR ID', 'UR ID', 'FR ID', 'CAPABILITY']
    const xs = [72, 232, 392, 560]
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left'
    ctx.fillStyle = HEX.teal; ctx.font = '400 19px ' + FONTS.mono
    heads.forEach((h, k) => ctx.fillText(h, xs[k], 156))
    ctx.strokeStyle = 'rgba(232,128,74,0.4)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(52, 184); ctx.lineTo(972, 184); ctx.stroke()
    const rows = [
      ['BR-01', 'UR-04', 'FR-01', 'Single loan case record'],
      ['BR-02', 'UR-07', 'FR-02', 'Central credit rules'],
      ['BR-03', 'UR-09', 'FR-06', 'API partner exchange'],
      ['BR-04', 'UR-11', 'FR-07', 'Audit event capture'],
    ]
    rows.forEach((r, k) => {
      const y = 232 + k * 80
      ctx.fillStyle = k % 2 ? 'rgba(232,128,74,0.05)' : 'transparent'
      ctx.fillRect(52, y - 28, 920, 62)
      ctx.font = '400 22px ' + FONTS.mono
      ctx.fillStyle = HEX.amberBright
      ctx.fillText(r[0], xs[0], y); ctx.fillText(r[1], xs[1], y); ctx.fillText(r[2], xs[2], y)
      ctx.fillStyle = HEX.warmWhite; ctx.font = '400 22px ' + FONTS.sans
      ctx.fillText(r[3], xs[3], y)
      ctx.strokeStyle = 'rgba(232,128,74,0.18)'
      ctx.beginPath(); ctx.moveTo(52, y + 34); ctx.lineTo(972, y + 34); ctx.stroke()
    })
    ctx.fillStyle = HEX.teal; ctx.font = '400 17px ' + FONTS.mono
    ctx.fillText('4 OF 11 TRACED · FULL MATRIX IN APPENDIX', 72, 592)
  }

  if (i === 3) {
    screenFrame(ctx, 'DESIGN · ZACHMAN')
    const cols = ['WHAT', 'HOW', 'WHERE', 'WHO', 'WHEN', 'WHY']
    const rows = ['STRAT', 'EXEC', 'ARCH', 'ENGR', 'TECH', 'WORK']
    const cell = 66, gx = 330, gy = 190
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = HEX.teal; ctx.font = '400 17px ' + FONTS.mono
    cols.forEach((c, k) => ctx.fillText(c, gx + k * cell + cell / 2, gy - 22))
    ctx.textAlign = 'right'
    rows.forEach((r, k) => ctx.fillText(r, gx - 18, gy + k * cell + cell / 2))
    const filled = [0, 1, 3, 6, 7, 10, 12, 13, 15, 18, 19, 22, 24, 27, 31]
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const x = gx + c * cell, y = gy + r * cell, idx = r * 6 + c
        if (filled.indexOf(idx) !== -1) {
          ctx.fillStyle = 'rgba(232,128,74,0.8)'
          ctx.fillRect(x + 3, y + 3, cell - 6, cell - 6)
        }
        ctx.strokeStyle = 'rgba(232,128,74,0.55)'; ctx.lineWidth = 1
        ctx.strokeRect(x, y, cell, cell)
      }
    }
    ctx.textAlign = 'left'; ctx.fillStyle = HEX.teal; ctx.font = '400 17px ' + FONTS.mono
    ctx.fillText('15 / 36 CELLS POPULATED', 72, 592)
  }

  if (i === 4) {
    screenFrame(ctx, 'DELIVER · ADKAR + ROADMAP')
    const groups: [string, number[]][] = [
      ['RM', [90, 70, 60, 50, 40]],
      ['CREDIT', [80, 60, 70, 70, 60]],
    ]
    const keys = ['A', 'D', 'K', 'A', 'R']
    ctx.textBaseline = 'middle'
    groups.forEach((g, gi) => {
      const y = 156 + gi * 118
      ctx.textAlign = 'left'; ctx.fillStyle = HEX.teal; ctx.font = '400 20px ' + FONTS.mono
      ctx.fillText(g[0], 60, y + 40)
      g[1].forEach((v, k) => {
        const x = 180 + k * 160
        ctx.strokeStyle = 'rgba(232,128,74,0.5)'; ctx.lineWidth = 1
        ctx.strokeRect(x, y, 140, 80)
        ctx.fillStyle = 'rgba(232,128,74,0.7)'
        ctx.fillRect(x, y + 80 - (80 * v) / 100, 140, (80 * v) / 100)
        ctx.textAlign = 'center'
        ctx.fillStyle = HEX.warmWhite; ctx.font = '500 22px ' + FONTS.sans
        ctx.fillText(keys[k] + ' ' + v, x + 70, y + 40)
      })
    })
    ctx.strokeStyle = 'rgba(232,128,74,0.35)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(52, 420); ctx.lineTo(972, 420); ctx.stroke()
    const stages = ['M1 DIAGNOSE', 'M2–3 MVP', 'M4 PILOT', 'M5–9 SCALE', 'M10–12 STABILISE']
    const ty = 508
    ctx.strokeStyle = 'rgba(232,128,74,0.6)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(78, ty); ctx.lineTo(946, ty); ctx.stroke()
    stages.forEach((s, k) => {
      const x = 78 + k * 217
      ctx.fillStyle = HEX.amberBright
      ctx.beginPath(); ctx.arc(x, ty, 9, 0, Math.PI * 2); ctx.fill()
      ctx.textAlign = k === stages.length - 1 ? 'right' : 'left'
      ctx.fillStyle = HEX.warmWhite; ctx.font = '400 18px ' + FONTS.mono
      ctx.fillText(s, k === stages.length - 1 ? x + 8 : x - 4, ty + 42)
    })
  }

  return c
}
