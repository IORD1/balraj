import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { ASSETS } from '../config/assets'
import { AGENT_FORM, ROOM } from '../config/layout'
import { COLORS, lc } from '../config/theme'
import { useExperience } from '../state/experience'
import { Slot } from './AssetSlot'

const IDLE = { spin: 0.3, pulse: 1.0 }
const BUSY = { spin: 1.2, pulse: 3.0 }
// the procedural orb tumbles; a modelled head/bust only turns about Y
const TUMBLE = ASSETS.agentForm ? 0 : 0.4

function Core() {
  return (
    <mesh castShadow>
      <icosahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial
        color={lc(COLORS.amber)}
        emissive={lc(COLORS.amber)}
        emissiveIntensity={0.6}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  )
}

/** The agent itself: a spinning, breathing core inside a counter-rotating wireframe. */
export function AgentForm() {
  const group = useRef<THREE.Group>(null)
  const pulse = useRef<THREE.Group>(null)
  const wire = useRef<THREE.Mesh>(null)

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const { spin, pulse: pulseSpeed } = useExperience.getState().agentRunning ? BUSY : IDLE
    if (group.current) {
      group.current.rotation.y += spin * delta
      group.current.rotation.x += spin * TUMBLE * delta
    }
    pulse.current?.scale.setScalar(1 + Math.sin(clock.elapsedTime * pulseSpeed) * 0.08)
    if (wire.current) wire.current.rotation.y -= spin * 0.6 * delta
  })

  return (
    <group ref={group} position={[0, AGENT_FORM.y, ROOM.centerZ]}>
      <group ref={pulse}>
        <Slot name="agentForm" fallback={<Core />} />
      </group>
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshBasicMaterial color={lc(COLORS.amberBright)} wireframe transparent opacity={0.6} fog={false} />
      </mesh>
    </group>
  )
}
