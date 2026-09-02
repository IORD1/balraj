import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { SCREEN_COUNT } from '../config/content'
import { ROOM } from '../config/layout'
import { COLORS, lc } from '../config/theme'
import { SCREEN_SETTLE } from '../config/timing'
import { ROOM_APOTHEM, ROOM_WALLS } from '../lib/roomGeometry'
import { makeTexture } from '../lib/textures/canvas'
import { createScreenCanvas } from '../lib/textures/screens'
import { useDisposable } from '../lib/useDisposable'
import { useExperience } from '../state/experience'

/**
 * Five wall screens in the agent room. Dark until the agent run lights them
 * up one by one; each activation flashes bright and settles to a steady glow.
 */
export function AgentScreens() {
  const activations = useExperience((s) => s.screenActivations)
  const textures = useDisposable(() => Array.from({ length: SCREEN_COUNT }, (_, i) => makeTexture(createScreenCanvas(i))), [])
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const seen = useRef<number[]>(Array.from({ length: SCREEN_COUNT }, () => 0))
  const settleFrom = useRef<number[]>(Array.from({ length: SCREEN_COUNT }, () => -1))

  useFrame(({ clock }) => {
    const s = useExperience.getState()
    const t = clock.elapsedTime
    for (let i = 0; i < SCREEN_COUNT; i++) {
      const count = s.screenActivations[i]
      if (count !== seen.current[i]) {
        seen.current[i] = count
        settleFrom.current[i] = count > 0 ? t : -1
      }
      const mat = materials.current[i]
      if (!mat || settleFrom.current[i] < 0) continue
      const e = t - settleFrom.current[i]
      if (e < SCREEN_SETTLE.seconds) {
        mat.emissiveIntensity = SCREEN_SETTLE.from - (SCREEN_SETTLE.from - SCREEN_SETTLE.to) * (e / SCREEN_SETTLE.seconds)
      } else {
        mat.emissiveIntensity = SCREEN_SETTLE.to
        settleFrom.current[i] = -1
      }
    }
  })

  const r = ROOM_APOTHEM - ROOM.screenInset
  return (
    <group>
      {ROOM_WALLS.slice(0, SCREEN_COUNT).map((wall, i) => (
        <mesh
          key={wall.index}
          position={[Math.cos(wall.angle) * r, ROOM.screenHeight, ROOM.centerZ + Math.sin(wall.angle) * r]}
          rotation={[0, wall.rotationY, 0]}
        >
          <planeGeometry args={ROOM.screenSize} />
          {activations[i] > 0 ? (
            <meshStandardMaterial
              ref={(m) => {
                materials.current[i] = m
              }}
              map={textures[i]}
              emissive={lc(COLORS.warmWhite)}
              emissiveMap={textures[i]}
              emissiveIntensity={SCREEN_SETTLE.from}
              roughness={0.9}
            />
          ) : (
            <meshBasicMaterial color={lc(COLORS.bgDeep)} />
          )}
        </mesh>
      ))}
    </group>
  )
}
