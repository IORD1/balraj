import { useMemo } from 'react'
import { HERO_BUILDING } from '../../config/layout'
import { COLORS, lc } from '../../config/theme'
import { Building } from './Building'

const HERO_SEED = 0xa7a1

/** The Avantia tower: plinth, storey grooves, glass entrance (signage lives in HeroSign). */
export function HeroBuilding() {
  const { width: W, depth: D, height: H, z } = HERO_BUILDING
  // floor grooves imply storeys without adding window geometry
  const grooves = useMemo(() => {
    const ys: number[] = []
    for (let y = 5; y < H; y += 5) ys.push(y)
    return ys
  }, [H])

  return (
    <group position={[0, 0, z]}>
      <Building w={W} h={H} d={D} hero seed={HERO_SEED} position={[0, H / 2, 0]} />

      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[22, 3, 22]} />
        <meshStandardMaterial color={lc(COLORS.structureMid)} roughness={0.8} metalness={0.2} />
      </mesh>

      {grooves.map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[W + 0.2, 0.15, D + 0.2]} />
          <meshStandardMaterial color={lc(0x101016)} roughness={0.9} />
        </mesh>
      ))}

      {/* glass entrance; the building sits at z=-30 so local +z faces the camera.
          The original used transmission=0.4 on three r128, where it merely thinned the alpha.
          Modern three renders a whole extra scene pass for transmissive materials, so the
          same look is achieved with plain opacity instead. */}
      <mesh position={[0, 4, 8.1]}>
        <boxGeometry args={[6, 5, 0.3]} />
        <meshPhysicalMaterial color={lc(0x1a2838)} metalness={0.9} roughness={0.1} transparent opacity={0.45} />
      </mesh>
    </group>
  )
}
