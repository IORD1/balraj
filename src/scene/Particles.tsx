import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ROOM } from '../config/layout'
import { COLORS, lc } from '../config/theme'
import { mulberry32 } from '../lib/rng'

const COUNT = 200

/** Slow amber motes drifting around the agent room. Rotates about the room centre. */
export function Particles() {
  const positions = useMemo(() => {
    const rand = mulberry32(0x5eed)
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const r = 3 + rand() * 5
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = 1 + rand() * 5
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return arr
  }, [])
  const ref = useRef<THREE.Points>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += 0.05 * Math.min(delta, 0.1)
  })
  return (
    <points ref={ref} position={[0, 0, ROOM.centerZ]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={lc(COLORS.amber)}
        size={0.05}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
