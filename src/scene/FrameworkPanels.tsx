import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { FRAMEWORK_PANELS } from '../config/content'
import { PANELS } from '../config/layout'
import { COLORS, lc } from '../config/theme'
import { makeTexture } from '../lib/textures/canvas'
import { createPanelCanvas } from '../lib/textures/panels'
import { useDisposable } from '../lib/useDisposable'
import { useExperience } from '../state/experience'

const panelZ = (i: number) => PANELS.firstZ - i * PANELS.spacing

/**
 * Eight framework panels along the corridor walls. Each pulses (and posts its
 * name to the HUD) when the intro camera passes it; backing out past a panel
 * re-arms it, so a scrubbed flight pulses it again on the next pass.
 */
export function FrameworkPanels() {
  const textures = useDisposable(() => FRAMEWORK_PANELS.map((fw) => makeTexture(createPanelCanvas(fw))), [])
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const runSeen = useRef(-1)
  const pulsed = useRef<boolean[]>([])
  const pulseAt = useRef<number[]>([])

  useFrame(({ camera, clock }) => {
    const s = useExperience.getState()
    let justReset = false
    if (s.runId !== runSeen.current) {
      runSeen.current = s.runId
      justReset = true
      pulsed.current = FRAMEWORK_PANELS.map(() => false)
      pulseAt.current = FRAMEWORK_PANELS.map(() => -1)
      materials.current.forEach((m) => m && (m.emissiveIntensity = PANELS.baseEmissive))
    }
    const t = clock.elapsedTime
    FRAMEWORK_PANELS.forEach((fw, i) => {
      const triggerZ = panelZ(i) + PANELS.triggerOffset
      if (s.phase === 'INTRO' && !justReset && !pulsed.current[i] && camera.position.z < triggerZ) {
        pulsed.current[i] = true
        pulseAt.current[i] = t
        s.showCorridorLabel(fw.name, fw.subtitle)
      } else if (pulsed.current[i] && camera.position.z > triggerZ + PANELS.rearmOffset) {
        pulsed.current[i] = false
      }
      const mat = materials.current[i]
      if (!mat || pulseAt.current[i] < 0) return
      // pulse decay
      const k = Math.max(0, 1 - (t - pulseAt.current[i]) / PANELS.pulseSeconds)
      mat.emissiveIntensity = PANELS.baseEmissive + 0.85 * k * k
      if (k <= 0) pulseAt.current[i] = -1
    })
  })

  return (
    <group>
      {FRAMEWORK_PANELS.map((fw, i) => {
        const onLeft = i % 2 === 0
        return (
          <mesh
            key={fw.name}
            position={[onLeft ? -PANELS.wallX : PANELS.wallX, PANELS.y, panelZ(i)]}
            rotation={[0, onLeft ? Math.PI / 2 : -Math.PI / 2, 0]}
          >
            <planeGeometry args={PANELS.size} />
            <meshStandardMaterial
              ref={(m) => {
                materials.current[i] = m
              }}
              map={textures[i]}
              emissive={lc(COLORS.warmWhite)}
              emissiveMap={textures[i]}
              emissiveIntensity={PANELS.baseEmissive}
              roughness={0.9}
              transparent
            />
          </mesh>
        )
      })}
    </group>
  )
}
