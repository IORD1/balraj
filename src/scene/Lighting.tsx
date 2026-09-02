import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CORRIDOR, ROOM } from '../config/layout'
import { COLORS, lc } from '../config/theme'
import { ARCH, CORRIDOR_FIXTURE_Z } from '../lib/corridorGeometry'

/**
 * Light intensities.
 * The original page ran on three r128 "legacy" lighting: every light was implicitly ×π and
 * point/spot lights faded *linearly* to zero at `distance`. Modern three uses physical units
 * and inverse-distance falloff, which makes hot spots next to fixtures and darker floors.
 * Interior lights therefore use decay = 0 (flat, with three's smooth range window), which
 * tracks the old linear curve closely at mid/far range; intensities are matched at half
 * range. The façade uplights keep decay = 1 so the wash still fades with height.
 * Tune here if the look drifts once real assets are in.
 */
export const LIGHTS = {
  ambient: 1.25,          // 0.4 × π
  moon: 1.6,              // 0.5 × π
  uplight: 85,            // 2.0, decay 1, matched at 20 units
  corridorFixture: 1.1,   // 0.6 × π × 0.5 / 0.88
  archGlow: 2.9,          // 1.6 × π × 0.5 / 0.88
  roomSpot: 2.7,          // 1.5 × π × 0.5 / 0.88
  rim: 0.7,               // 0.4 × π × 0.5 / 0.88
} as const

interface SpotProps {
  color: THREE.Color
  intensity: number
  distance: number
  angle: number
  penumbra: number
  position: [number, number, number]
  target: [number, number, number]
  castShadow?: boolean
  decay?: number
}

function Spot({ target, ...light }: SpotProps) {
  const ref = useRef<THREE.SpotLight>(null)
  const targetObj = useMemo(() => new THREE.Object3D(), [])
  useLayoutEffect(() => {
    if (ref.current) ref.current.target = targetObj
  }, [targetObj])
  return (
    <>
      <spotLight ref={ref} decay={0} {...light} />
      <primitive object={targetObj} position={target} />
    </>
  )
}

export function Lighting() {
  const moon = useRef<THREE.DirectionalLight>(null)
  useLayoutEffect(() => {
    const l = moon.current
    if (!l) return
    l.shadow.mapSize.set(1024, 1024)
    const c = l.shadow.camera
    c.left = -120
    c.right = 120
    c.top = 120
    c.bottom = -120
    c.far = 320
    c.updateProjectionMatrix()
  }, [])

  const rims = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return [Math.cos(a) * 4, 1.5, ROOM.centerZ + Math.sin(a) * 4] as [number, number, number]
      }),
    [],
  )

  return (
    <>
      <ambientLight color={lc(0x1a1520)} intensity={LIGHTS.ambient} />
      <directionalLight ref={moon} color={lc(0x6570a0)} intensity={LIGHTS.moon} position={[50, 100, 50]} castShadow />

      {/* amber uplights washing the hero façade */}
      {[-1, 1].map((side) => (
        <Spot
          key={side}
          color={lc(COLORS.amber)}
          intensity={LIGHTS.uplight}
          distance={60}
          angle={Math.PI / 6}
          penumbra={0.4}
          decay={1}
          position={[side * 8, 1, -20]}
          target={[side * 6, 40, -30]}
        />
      ))}

      {/* corridor ceiling fixtures */}
      {CORRIDOR_FIXTURE_Z.map((z) => (
        <pointLight
          key={z}
          color={lc(COLORS.warmWhite)}
          intensity={LIGHTS.corridorFixture}
          distance={8}
          decay={0}
          position={[0, CORRIDOR.height - 0.3, z]}
        />
      ))}
      <pointLight color={lc(COLORS.amberBright)} intensity={LIGHTS.archGlow} distance={18} decay={0} position={ARCH.glow} />

      {/* agent room */}
      <Spot
        color={lc(COLORS.amber)}
        intensity={LIGHTS.roomSpot}
        distance={15}
        angle={Math.PI / 5}
        penumbra={0.5}
        position={[0, 7.5, ROOM.centerZ]}
        target={[0, 0, ROOM.centerZ]}
        castShadow
      />
      {rims.map((p, i) => (
        <pointLight key={i} color={lc(COLORS.amber)} intensity={LIGHTS.rim} distance={8} decay={0} position={p} />
      ))}
    </>
  )
}
