import { useEffect, useState } from 'react'

/**
 * Canvas textures are drawn with the web fonts, so the scene only mounts once
 * they have actually loaded. Falls back to system fonts if loading fails.
 */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await Promise.all([
          document.fonts.load('bold 72px Fraunces'),
          document.fonts.load('500 28px Inter'),
          document.fonts.load('400 20px "JetBrains Mono"'),
        ])
        await document.fonts.ready
      } catch {
        /* fall back to system fonts in canvas */
      }
      if (!cancelled) setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])
  return ready
}
