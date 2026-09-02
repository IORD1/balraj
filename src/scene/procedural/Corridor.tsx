import { CORRIDOR } from '../../config/layout'
import { COLORS, lc } from '../../config/theme'
import { ARCH, CORRIDOR_FIXTURE_Z, CORRIDOR_MID_Z } from '../../lib/corridorGeometry'

/**
 * Procedural corridor shell: floor, ceiling, walls, amber floor strip,
 * ceiling fixtures and the end archway. Its point lights live in Lighting.tsx
 * so they survive swapping this shell for a model.
 */
export function Corridor() {
  const { length, width, height } = CORRIDOR
  const midZ = CORRIDOR_MID_Z
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, midZ]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={lc(0x0f0f14)} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, midZ]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={lc(COLORS.structureDark)} roughness={0.9} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-width / 2, height / 2, midZ]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={lc(COLORS.structureDark)} roughness={0.85} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[width / 2, height / 2, midZ]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={lc(COLORS.structureDark)} roughness={0.85} />
      </mesh>

      {/* amber guide strip down the middle of the floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, midZ]}>
        <planeGeometry args={[0.3, length - 2]} />
        <meshBasicMaterial color={lc(COLORS.amber)} fog={false} />
      </mesh>

      {CORRIDOR_FIXTURE_Z.map((z) => (
        <mesh key={z} position={[0, height - 0.1, z]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={lc(COLORS.warmWhite)} fog={false} />
        </mesh>
      ))}

      {/* corridor end archway */}
      <mesh position={ARCH.position}>
        <torusGeometry args={[2.5, 0.15, 8, 24, Math.PI]} />
        <meshBasicMaterial color={lc(COLORS.amberBright)} fog={false} />
      </mesh>
    </group>
  )
}
