import { useMemo } from 'react'
import * as THREE from 'three'
import { DOOR, ENTRANCE } from '../config/layout'

// Linear RGB, matching the materials baked into the models (glTF colours are linear).
const PORTAL_COLOR = new THREE.Color(0.72, 0.7, 0.68) // building.glb "white" (the mullions)
const WALL_COLOR = new THREE.Color(0.62, 0.63, 0.66) // corridor.glb "Main Mat"

/**
 * Ties the door into the building. Outside: pilasters, a lintel and a sill in the façade's
 * mullion colour wrap the door frame, which otherwise stands in a raw hole in the glazing.
 * Inside: a wall closes the corridor mouth behind the glazing (whose back faces are culled),
 * so from the corridor the door sits in a wall instead of floating against the sky.
 */
export function EntrancePortal() {
  const { width: w, height: h, z } = DOOR
  const { jamb, lintel, depth, protrude, sill, wall } = ENTRANCE
  // portal boxes sit in front of the interior wall so nothing of them shows from the corridor
  const pz = protrude - depth / 2

  const wallShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-wall.width / 2, 0)
    s.lineTo(wall.width / 2, 0)
    s.lineTo(wall.width / 2, wall.height)
    s.lineTo(-wall.width / 2, wall.height)
    s.closePath()
    const hw = w / 2 - wall.overlap
    const hh = h - wall.overlap
    const hole = new THREE.Path()
    hole.moveTo(-hw, 0)
    hole.lineTo(hw, 0)
    hole.lineTo(hw, hh)
    hole.lineTo(-hw, hh)
    hole.closePath()
    s.holes.push(hole)
    return s
  }, [w, h, wall.width, wall.height, wall.overlap])

  const portalMaterial = <meshStandardMaterial color={PORTAL_COLOR} roughness={0.6} metalness={0} />
  const outerW = w + 2 * jamb

  return (
    <group position={[0, 0, z]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (w + jamb) / 2, (h + lintel) / 2, pz]} castShadow receiveShadow>
          <boxGeometry args={[jamb, h + lintel, depth]} />
          {portalMaterial}
        </mesh>
      ))}
      <mesh position={[0, h + lintel / 2, pz]} castShadow receiveShadow>
        <boxGeometry args={[outerW, lintel, depth]} />
        {portalMaterial}
      </mesh>
      <mesh position={[0, sill / 2, pz + 0.15]} receiveShadow>
        <boxGeometry args={[outerW, sill, depth]} />
        {portalMaterial}
      </mesh>

      {/* faces -z, towards the corridor; casts so moonlight only enters through the doorway */}
      <mesh position={[0, 0, wall.z - z]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
        <shapeGeometry args={[wallShape]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.55} metalness={0.35} />
      </mesh>
    </group>
  )
}
