import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { SCREEN_COUNT } from '../config/content'
import { ROOM } from '../config/layout'
import { COLORS, lc } from '../config/theme'
import { SCREEN_SETTLE } from '../config/timing'
import { ROOM_APOTHEM, ROOM_WALLS } from '../lib/roomGeometry'
import { makeTexture } from '../lib/textures/canvas'
import { createScreenCanvas, createStandbyCanvas } from '../lib/textures/screens'
import { useDisposable } from '../lib/useDisposable'
import { useExperience } from '../state/experience'

/** Dark frame around each screen so it reads as a mounted display, not a hole in the wall. */
const BEZEL = { rim: 0.12, depth: 0.08 }

const eachScreen = <T,>(make: (i: number) => T) => Array.from({ length: SCREEN_COUNT }, (_, i) => make(i))

/**
 * Five wall screens in the agent room. On standby they show a dim frame and the stage they
 * report on; the agent run swaps in the analysis one screen at a time, each flashing bright
 * and settling to a steady glow. One material per screen for its whole life — the textures
 * are swapped on it directly, so nothing depends on React re-creating materials mid-run.
 */
export function AgentScreens() {
  const standby = useDisposable(() => eachScreen((i) => makeTexture(createStandbyCanvas(i))), [])
  const content = useDisposable(() => eachScreen((i) => makeTexture(createScreenCanvas(i))), [])
  const materials = useDisposable(
    () =>
      standby.map(
        (tex) =>
          new THREE.MeshStandardMaterial({
            map: tex,
            emissive: lc(COLORS.warmWhite),
            emissiveMap: tex,
            emissiveIntensity: SCREEN_SETTLE.standby,
            roughness: 0.9,
          }),
      ),
    [standby],
  )
  const seen = useRef<number[]>(eachScreen(() => 0))
  const settleFrom = useRef<number[]>(eachScreen(() => -1))

  useFrame(({ clock }) => {
    const s = useExperience.getState()
    const t = clock.elapsedTime
    for (let i = 0; i < SCREEN_COUNT; i++) {
      const mat = materials[i]
      const count = s.screenActivations[i]
      if (count !== seen.current[i]) {
        seen.current[i] = count
        const tex = count > 0 ? content[i] : standby[i]
        mat.map = tex
        mat.emissiveMap = tex
        mat.needsUpdate = true
        if (count > 0) settleFrom.current[i] = t
        else {
          settleFrom.current[i] = -1
          mat.emissiveIntensity = SCREEN_SETTLE.standby
        }
      }
      if (settleFrom.current[i] < 0) continue
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
  const [w, h] = ROOM.screenSize
  return (
    <group>
      {ROOM_WALLS.slice(0, SCREEN_COUNT).map((wall, i) => (
        // the group's +z faces the room centre; the bezel sits just behind the screen, towards the wall
        <group
          key={wall.index}
          position={[Math.cos(wall.angle) * r, ROOM.screenHeight, ROOM.centerZ + Math.sin(wall.angle) * r]}
          rotation={[0, wall.rotationY, 0]}
        >
          <mesh>
            <planeGeometry args={ROOM.screenSize} />
            <primitive object={materials[i]} attach="material" />
          </mesh>
          <mesh position={[0, 0, -BEZEL.depth / 2 - 0.01]}>
            <boxGeometry args={[w + BEZEL.rim * 2, h + BEZEL.rim * 2, BEZEL.depth]} />
            <meshStandardMaterial color={lc(COLORS.structureMid)} roughness={0.45} metalness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
