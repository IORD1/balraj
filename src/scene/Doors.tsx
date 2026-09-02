import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ASSETS, type AssetSlot } from '../config/assets'
import { DOOR } from '../config/layout'
import { lc } from '../config/theme'
import { TIMING } from '../config/timing'
import { easeInOutCubic } from '../lib/easing'
import { useExperience } from '../state/experience'
import { AssetErrorBoundary, computeFit } from './AssetSlot'

/**
 * Calls `apply` every frame with the eased open amount (0 closed → 1 open). The leaves travel
 * from wherever they are whenever `doorsOpen` flips, so a scrubbed flight closes them again.
 */
function useDoorAnimation(apply: (eased: number) => void) {
  const runSeen = useRef(-1)
  const anim = useRef({ open: false, from: 0, since: 0, p: 0 })
  useFrame(({ clock }) => {
    const s = useExperience.getState()
    const t = clock.elapsedTime
    const a = anim.current
    if (s.runId !== runSeen.current) {
      runSeen.current = s.runId
      a.open = false
      a.from = 0
      a.since = t
      a.p = 0
    }
    if (s.doorsOpen !== a.open) {
      a.open = s.doorsOpen
      a.from = a.p
      a.since = t
    }
    if (a.open && s.doorsSnap) a.p = 1
    else {
      const travelled = (t - a.since) / TIMING.act3_doorsOpen
      a.p = a.open ? Math.min(1, a.from + travelled) : Math.max(0, a.from - travelled)
    }
    apply(easeInOutCubic(a.p))
  })
}

const TRAVEL = DOOR.openX - DOOR.closedX

function ProceduralDoors() {
  const left = useRef<THREE.Mesh>(null)
  const right = useRef<THREE.Mesh>(null)
  useDoorAnimation((e) => {
    const x = DOOR.closedX + TRAVEL * e
    left.current?.position.setX(-x)
    right.current?.position.setX(x)
  })
  return (
    <>
      <mesh ref={left} position={[-DOOR.closedX, DOOR.y, DOOR.z]} castShadow>
        <boxGeometry args={[1.4, 4, 0.15]} />
        <meshStandardMaterial color={lc(0x14141c)} roughness={0.25} metalness={0.8} />
      </mesh>
      <mesh ref={right} position={[DOOR.closedX, DOOR.y, DOOR.z]} castShadow>
        <boxGeometry args={[1.4, 4, 0.15]} />
        <meshStandardMaterial color={lc(0x14141c)} roughness={0.25} metalness={0.8} />
      </mesh>
    </>
  )
}

const Y_AXIS = new THREE.Vector3(0, 1, 0)
const swingQuat = new THREE.Quaternion()

/**
 * A door model. Nodes named "DoorL" / "DoorR" are animated (slid apart along X, or swung
 * about their own origin when `slot.doors.mode === 'swing'`); everything else stays put.
 */
function ModelDoors({ slot }: { slot: AssetSlot }) {
  const { scene } = useGLTF(slot.url)
  const box = useMemo(() => new THREE.Box3().setFromObject(scene), [scene])
  const fitted = useMemo(() => computeFit(box, slot.fit), [box, slot.fit])
  const leaves = useMemo(() => {
    const pick = (name: string) => {
      const o = scene.getObjectByName(name)
      return o ? { o, pos: o.position.clone(), quat: o.quaternion.clone() } : null
    }
    return { l: pick('DoorL'), r: pick('DoorR') }
  }, [scene])
  useMemo(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
  }, [scene])

  const mode = slot.doors?.mode ?? 'slide'
  const angle = slot.doors?.angle ?? Math.PI * 0.6
  const extra = typeof slot.scale === 'number' ? slot.scale : 1
  const travel = TRAVEL / (fitted.scale * extra)

  useDoorAnimation((e) => {
    const { l, r } = leaves
    if (mode === 'swing') {
      if (l) l.o.quaternion.copy(l.quat).premultiply(swingQuat.setFromAxisAngle(Y_AXIS, angle * e))
      if (r) r.o.quaternion.copy(r.quat).premultiply(swingQuat.setFromAxisAngle(Y_AXIS, -angle * e))
    } else {
      if (l) l.o.position.x = l.pos.x - travel * e
      if (r) r.o.position.x = r.pos.x + travel * e
    }
  })

  return (
    <group position={slot.position ?? [0, 0, DOOR.z]} rotation={slot.rotation ?? [0, 0, 0]} scale={slot.scale ?? 1}>
      <group scale={fitted.scale} position={fitted.offset}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

export function Doors() {
  const slot = ASSETS.doors
  if (!slot) return <ProceduralDoors />
  return (
    <AssetErrorBoundary name="doors" fallback={<ProceduralDoors />}>
      <Suspense fallback={<ProceduralDoors />}>
        <ModelDoors slot={slot} />
      </Suspense>
    </AssetErrorBoundary>
  )
}
