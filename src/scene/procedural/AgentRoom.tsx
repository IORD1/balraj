import { useMemo } from 'react'
import * as THREE from 'three'
import { ROOM } from '../../config/layout'
import { COLORS, lc } from '../../config/theme'
import { ROOM_HEX_POINTS, ROOM_WALLS, ROOM_WALL_WIDTH } from '../../lib/roomGeometry'

/** Hexagonal agent room shell: floor, ceiling, five walls (entry side open) and the plinth. */
export function AgentRoom() {
  const { height, centerZ } = ROOM
  const hexShape = useMemo(() => {
    const shape = new THREE.Shape()
    ROOM_HEX_POINTS.forEach(([x, z], i) => (i === 0 ? shape.moveTo(x, z) : shape.lineTo(x, z)))
    shape.closePath()
    return shape
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]} receiveShadow>
        <shapeGeometry args={[hexShape]} />
        <meshStandardMaterial color={lc(0x0f0f14)} roughness={0.25} metalness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, centerZ]}>
        <shapeGeometry args={[hexShape]} />
        <meshStandardMaterial color={lc(COLORS.structureDark)} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {ROOM_WALLS.map((wall) => (
        <mesh key={wall.index} position={[wall.px, height / 2, wall.pz]} rotation={[0, wall.rotationY, 0]} receiveShadow>
          <planeGeometry args={[ROOM_WALL_WIDTH, height]} />
          <meshStandardMaterial color={lc(COLORS.structureDark)} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <mesh position={[0, 0.3, centerZ]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 3, 0.6, 24]} />
        <meshStandardMaterial
          color={lc(COLORS.structureMid)}
          roughness={0.4}
          metalness={0.6}
          emissive={lc(COLORS.amber)}
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  )
}
