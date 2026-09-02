import { useEffect } from 'react'
import { SCROLL } from '../config/timing'
import { useExperience } from '../state/experience'

const LINE_PX = 16
const PAGE_PX = 800
const KEY_STEPS: Record<string, number> = {
  ArrowDown: 1, PageDown: 1, ArrowRight: 1,
  ArrowUp: -1, PageUp: -1, ArrowLeft: -1,
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

/**
 * Wheel, touch-drag and arrow/page keys scrub the intro flight (seconds along the camera
 * path). The store decides whether the input applies — it is ignored during an agent run
 * and while the output modal is open.
 */
export function useFlightInput() {
  useEffect(() => {
    const scrub = (seconds: number) => useExperience.getState().scrubFlight(seconds)

    const onWheel = (e: WheelEvent) => {
      const px = e.deltaMode === 1 ? e.deltaY * LINE_PX : e.deltaMode === 2 ? e.deltaY * PAGE_PX : e.deltaY
      if (px) scrub(px * SCROLL.secondsPerPixel)
    }
    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY
      if (touchY === null || y === undefined) return
      scrub((touchY - y) * SCROLL.touchSecondsPerPixel)
      touchY = y
    }
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.altKey || e.ctrlKey || e.metaKey) return
      const step = KEY_STEPS[e.key]
      if (!step) return
      e.preventDefault()
      scrub(step * SCROLL.keyStep)
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [])
}
