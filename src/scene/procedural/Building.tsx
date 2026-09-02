import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { COLORS, lc } from '../../config/theme'
import { mulberry32 } from '../../lib/rng'

interface WindowSpec {
  x: number
  y: number
  z: number
  back: boolean
}

// shared window geometry/materials: one instance each keeps the draw-call count low
const windowGeometry = new THREE.PlaneGeometry(0.6, 0.9)
const litMaterial = new THREE.MeshBasicMaterial({ color: lc(COLORS.windowLit), transparent: true, opacity: 0.9, fog: false })
const dimMaterial = new THREE.MeshBasicMaterial({ color: lc(0x2a1f18), transparent: true, opacity: 0.6 })

const dummy = new THREE.Object3D()

function WindowInstances({ windows, lit }: { windows: WindowSpec[]; lit: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    windows.forEach((w, i) => {
      dummy.position.set(w.x, w.y, w.z)
      dummy.rotation.set(0, w.back ? Math.PI : 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [windows])
  if (windows.length === 0) return null
  return (
    <instancedMesh
      ref={ref}
      args={[windowGeometry, lit ? litMaterial : dimMaterial, windows.length]}
      frustumCulled={false}
    />
  )
}

interface BuildingProps {
  w: number
  h: number
  d: number
  hero?: boolean
  seed: number
  position: [number, number, number]
}

/** A box tower with a grid of lit/dim windows on its front and back faces. */
export function Building({ w, h, d, hero = false, seed, position }: BuildingProps) {
  const { lit, dim } = useMemo(() => {
    const rand = mulberry32(seed)
    const lit: WindowSpec[] = []
    const dim: WindowSpec[] = []
    const floors = Math.floor(h / 2.5)
    const perFloor = Math.max(2, Math.floor(w / 1.5))
    for (let f = 1; f < floors; f++) {
      for (let wi = 0; wi < perFloor; wi++) {
        const list = rand() < 0.4 ? lit : dim
        const x = -w / 2 + (wi + 0.5) * (w / perFloor)
        const y = -h / 2 + f * 2.5
        list.push({ x, y, z: d / 2 + 0.02, back: false })
        if (rand() < 0.7) list.push({ x, y, z: -d / 2 - 0.02, back: true })
      }
    }
    return { lit, dim }
  }, [w, h, d, seed])

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={lc(hero ? COLORS.structureMid : COLORS.structureDark)} roughness={0.7} metalness={0.3} />
      </mesh>
      <WindowInstances windows={lit} lit />
      <WindowInstances windows={dim} lit={false} />
    </group>
  )
}
