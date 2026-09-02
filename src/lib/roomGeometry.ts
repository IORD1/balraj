import { ROOM } from '../config/layout'

export interface RoomWall {
  index: number
  angle: number
  px: number
  pz: number
  /** Rotation about Y so the plane's front (+Z) faces the room centre (Object3D.lookAt equivalent). */
  rotationY: number
}

export const ROOM_APOTHEM = ROOM.radius * 0.866
export const ROOM_WALL_WIDTH = 2 * ROOM.radius * Math.sin(Math.PI / 6)

/** Wall index 1 (angle π/2) faces the corridor and stays open as the entry. */
export const ROOM_ENTRY_WALL = 1

export const ROOM_WALLS: RoomWall[] = [0, 1, 2, 3, 4, 5]
  .filter((i) => i !== ROOM_ENTRY_WALL)
  .map((i) => {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6
    return {
      index: i,
      angle,
      px: Math.cos(angle) * ROOM_APOTHEM,
      pz: ROOM.centerZ + Math.sin(angle) * ROOM_APOTHEM,
      rotationY: Math.atan2(-Math.cos(angle), -Math.sin(angle)),
    }
  })

/** Hexagon vertices of the room floor/ceiling in the XZ plane, relative to the room centre. */
export const ROOM_HEX_POINTS: [number, number][] = [0, 1, 2, 3, 4, 5].map((i) => {
  const a = (i / 6) * Math.PI * 2
  return [Math.cos(a) * ROOM.radius, Math.sin(a) * ROOM.radius]
})
