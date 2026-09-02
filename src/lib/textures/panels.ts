import type { FrameworkPanel, SchematicType } from '../../config/content'
import { FONTS, HEX } from '../../config/theme'
import { arrowDown, arrowRight, ctx2d, hexagon, makeCanvas, wrapText } from './canvas'

/** Corridor framework panel: title, subtitle and a line-art schematic. */
export function createPanelCanvas(fw: FrameworkPanel): HTMLCanvasElement {
  const canvas = makeCanvas(1024, 640)
  const ctx = ctx2d(canvas)

  ctx.fillStyle = HEX.bg
  ctx.fillRect(0, 0, 1024, 640)
  ctx.strokeStyle = HEX.amber
  ctx.lineWidth = 3
  ctx.strokeRect(20, 20, 984, 600)

  ctx.fillStyle = HEX.warmWhite
  ctx.font = 'bold 72px ' + FONTS.serif
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(fw.name, 512, 80)

  ctx.fillStyle = HEX.teal
  ctx.font = '500 28px ' + FONTS.sans
  ctx.fillText(fw.subtitle, 512, 175)

  drawSchematic(ctx, fw.schematic)
  return canvas
}

function drawSchematic(ctx: CanvasRenderingContext2D, type: SchematicType) {
  ctx.strokeStyle = HEX.amber
  ctx.fillStyle = HEX.warmWhite
  ctx.lineWidth = 2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  switch (type) {
    case 'e5': {
      const labels = ['EXPAND', 'EXAMINE', 'EMPATHIZE', 'ELEVATE', 'ENVISION']
      const boxW = 160, boxH = 160, startX = 32, y = 300
      labels.forEach((label, i) => {
        const x = startX + i * 192
        ctx.strokeRect(x, y, boxW, boxH)
        ctx.font = '500 22px ' + FONTS.sans
        ctx.fillStyle = HEX.warmWhite
        ctx.fillText(label, x + boxW / 2, y + boxH / 2)
      })
      break
    }

    case 'questions': {
      const labels = ['INVESTIGATIVE', 'SUCCESSIVE', 'SPECULATIVE', 'PRODUCTIVE', 'INTERPRETIVE', 'SUBJECTIVE']
      const r = 55
      labels.forEach((label, i) => {
        const col = i % 3, row = Math.floor(i / 3)
        const cx = 236 + col * 276, cy = 300 + row * 150
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
        ctx.font = '400 16px ' + FONTS.sans
        ctx.fillStyle = HEX.warmWhite
        wrapText(ctx, label, cx, cy, 96, 18)
      })
      break
    }

    case '7s': {
      const cx = 512, cy = 420, hubR = 45, orbitR = 150, nodeR = 35
      const labels = ['STRATEGY', 'STRUCTURE', 'SYSTEMS', 'SKILLS', 'STYLE', 'STAFF', 'SHARED VALUES']
      // spokes first so nodes draw over them
      labels.forEach((_, i) => {
        const a = (i / 7) * Math.PI * 2 - Math.PI / 2
        ctx.strokeStyle = 'rgba(232,128,74,0.5)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * orbitR, cy + Math.sin(a) * orbitR); ctx.stroke()
      })
      ctx.lineWidth = 2; ctx.strokeStyle = HEX.amber
      labels.forEach((label, i) => {
        const a = (i / 7) * Math.PI * 2 - Math.PI / 2
        const nx = cx + Math.cos(a) * orbitR, ny = cy + Math.sin(a) * orbitR
        ctx.fillStyle = HEX.bg
        ctx.beginPath(); ctx.arc(nx, ny, nodeR, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
        ctx.fillStyle = HEX.warmWhite
        ctx.font = '400 13px ' + FONTS.sans
        wrapText(ctx, label, nx, ny, 62, 14)
      })
      ctx.fillStyle = HEX.amber
      ctx.beginPath(); ctx.arc(cx, cy, hubR, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = HEX.bg; ctx.font = 'bold 30px ' + FONTS.serif
      ctx.fillText('7S', cx, cy + 1)
      break
    }

    case 'tree': {
      const box = (x: number, y: number, w: number, h: number, label: string, fs: number) => {
        ctx.strokeStyle = HEX.amber; ctx.lineWidth = 2
        ctx.strokeRect(x, y, w, h)
        ctx.fillStyle = HEX.warmWhite; ctx.font = '500 ' + fs + 'px ' + FONTS.sans
        ctx.fillText(label, x + w / 2, y + h / 2)
      }
      const link = (x1: number, y1: number, x2: number, y2: number) => {
        ctx.strokeStyle = 'rgba(232,128,74,0.6)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, (y1 + y2) / 2)
        ctx.lineTo(x2, (y1 + y2) / 2); ctx.lineTo(x2, y2); ctx.stroke()
      }
      box(422, 250, 180, 48, 'PROBLEM', 20)
      const branchX = [172, 462, 752]
      branchX.forEach((bx) => {
        link(512, 298, bx + 75, 350)
        box(bx, 350, 150, 44, 'DRIVER', 17)
      })
      branchX.forEach((bx, i) => {
        ;[0, 1].forEach((j) => {
          const lx = bx - 18 + j * 108
          link(bx + 75, 394, lx + 45, 460)
          box(lx, 460, 90, 40, 'L' + (i * 2 + j + 1), 15)
        })
      })
      break
    }

    case 'reqs': {
      const bars = [
        { label: 'BUSINESS REQUIREMENT', w: 700 },
        { label: 'USER REQUIREMENT', w: 560 },
        { label: 'FUNCTIONAL REQUIREMENT', w: 420 },
      ]
      let y = 262
      bars.forEach((b, i) => {
        const x = 512 - b.w / 2
        ctx.strokeStyle = HEX.amber; ctx.lineWidth = 2
        ctx.strokeRect(x, y, b.w, 66)
        ctx.fillStyle = HEX.warmWhite; ctx.font = '500 24px ' + FONTS.sans
        ctx.fillText(b.label, 512, y + 33)
        if (i < bars.length - 1) arrowDown(ctx, 512, y + 66, y + 108)
        y += 108
      })
      break
    }

    case 'grid': {
      const cols = ['WHAT', 'HOW', 'WHERE', 'WHO', 'WHEN', 'WHY']
      const rows = ['STRATEGIST', 'EXECUTIVE', 'ARCHITECT', 'ENGINEER', 'TECHNOLOGIST', 'WORKER']
      const cell = 50, gx = 400, gy = 280
      ctx.font = '400 14px ' + FONTS.mono; ctx.fillStyle = HEX.teal
      cols.forEach((c, i) => ctx.fillText(c, gx + i * cell + cell / 2, gy - 16))
      ctx.textAlign = 'right'; ctx.font = '400 12px ' + FONTS.mono
      rows.forEach((r, i) => ctx.fillText(r, gx - 14, gy + i * cell + cell / 2))
      ctx.textAlign = 'center'
      // deterministic fill pattern so the "populated" cells never flicker between builds
      const filled = [0, 3, 4, 7, 9, 11, 12, 15, 16, 20, 22, 25, 27, 28, 31, 33]
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          const x = gx + c * cell, y = gy + r * cell, idx = r * 6 + c
          if (filled.indexOf(idx) !== -1) {
            ctx.fillStyle = 'rgba(232,128,74,0.75)'
            ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4)
          }
          ctx.strokeStyle = 'rgba(232,128,74,0.7)'; ctx.lineWidth = 1
          ctx.strokeRect(x, y, cell, cell)
        }
      }
      break
    }

    case 'dmadv': {
      const labels = ['DEFINE', 'MEASURE', 'ANALYZE', 'DESIGN', 'VERIFY']
      const r = 76, y = 400
      labels.forEach((label, i) => {
        const cx = 116 + i * 195
        ctx.strokeStyle = HEX.amber; ctx.lineWidth = 2
        hexagon(ctx, cx, y, r)
        ctx.fillStyle = HEX.warmWhite; ctx.font = '500 19px ' + FONTS.sans
        ctx.fillText(label, cx, y)
        if (i < labels.length - 1) arrowRight(ctx, cx + r + 4, cx + 195 - r - 4, y)
      })
      break
    }

    case 'change': {
      const adkar = ['A', 'D', 'K', 'A', 'R']
      const bw = 152, bh = 92, bx = 132, by = 268
      adkar.forEach((l, i) => {
        ctx.strokeStyle = HEX.amber; ctx.lineWidth = 2
        ctx.strokeRect(bx + i * bw, by, bw, bh)
        ctx.fillStyle = HEX.warmWhite; ctx.font = 'bold 40px ' + FONTS.serif
        ctx.fillText(l, bx + i * bw + bw / 2, by + bh / 2)
      })
      ctx.fillStyle = HEX.teal; ctx.font = '400 15px ' + FONTS.mono
      ctx.fillText('KOTTER · 8 STEPS', 512, 424)
      for (let i = 0; i < 8; i++) {
        const cx = 190 + i * 92, cy = 490
        ctx.strokeStyle = HEX.amber; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.stroke()
        ctx.fillStyle = HEX.warmWhite; ctx.font = '500 20px ' + FONTS.sans
        ctx.fillText(String(i + 1), cx, cy + 1)
      }
      break
    }
  }
}
