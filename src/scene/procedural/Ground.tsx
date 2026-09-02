import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { COLORS, lc } from '../../config/theme'

export function Ground() {
  const grid = useRef<THREE.GridHelper>(null)
  useLayoutEffect(() => {
    const m = grid.current?.material as THREE.Material | undefined
    if (m) {
      m.transparent = true
      m.opacity = 0.15
    }
  }, [])
  return (
    <>
      {/* Pushed back in the depth buffer: the agent-room floor and model floors sit exactly
          on y = 0 too, and coplanar surfaces z-fight (the floor shimmers as the camera moves). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial
          color={lc(0x151519)}
          roughness={0.9}
          metalness={0.1}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      <gridHelper ref={grid} args={[400, 80, lc(COLORS.structureDark), lc(COLORS.structureDark)]} position={[0, 0.01, 0]} />
    </>
  )
}
