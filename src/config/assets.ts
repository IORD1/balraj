import { CORRIDOR, DOOR, HERO_BUILDING } from './layout'

export type Vec3 = [number, number, number]

export interface AssetFit {
  /**
   * Which dimension of the model's bounding box should equal `size`
   * (uniform scale). 'longest' is handy for corridors/hallways whose
   * long axis you don't know yet.
   */
  axis: 'x' | 'y' | 'z' | 'longest'
  size: number
  /** 'floor' rests the model's lowest point on the slot's y = 0 (default); 'center' centres it vertically. */
  align?: 'floor' | 'center'
  /** Centre the model's bounding box on the slot position in x/z. Default true. */
  center?: boolean
  /**
   * A point in the model's own space that should land exactly on the slot position
   * (after scaling). Overrides `align`/`center`. Use it when the file's origin is not
   * where the scene needs it, e.g. anchor = [entranceX, floorY, entranceZ].
   */
  anchor?: Vec3
}

export interface AssetSlot {
  /** Served from public/ ('/models/foo.glb') or an `import`ed .glb URL. */
  url: string
  position?: Vec3
  /** Euler rotation in radians, applied after `fit`. */
  rotation?: Vec3
  /** Extra scale applied after `fit`. */
  scale?: number | Vec3
  fit?: AssetFit
  /**
   * Door slot only. Nodes named "DoorL" / "DoorR" are animated by the intro:
   * 'slide' moves them apart along X, 'swing' rotates them about their own origin
   * (put the origin on the hinge) by `angle` radians — positive swings DoorL inwards.
   */
  doors?: { mode: 'slide' | 'swing'; angle?: number }
}

export type AssetKey =
  | 'sky'
  | 'ground'
  | 'city'
  | 'heroBuilding'
  | 'doors'
  | 'corridor'
  | 'agentRoom'
  | 'agentForm'

/**
 * 3D ASSET REGISTRY
 * -----------------
 * Every visual element of the scene has a slot here.
 *   - `null`  → the procedural placeholder in src/scene/procedural/ is rendered.
 *   - a slot  → the glTF is loaded instead (the placeholder still shows while
 *               it loads, and again if loading fails, with a console warning).
 *
 * World layout the models need to respect (see src/config/layout.ts):
 *   hero building   footprint 18×18, 55 tall, centred at z = -30, entrance at z ≈ -21.75
 *   corridor        x ∈ [-4, 4], y ∈ [0, 6], z from -22 to -67 (camera walks down the centre)
 *   agent room      hexagon, radius 14, 8 tall, centred at z = -82, open towards the corridor
 *   agentForm       slot position is relative to the spinning group at (0, 2.2, -82)
 *   doors           child nodes named "DoorL" / "DoorR" are slid or swung open by the intro
 */
export const ASSETS: Record<AssetKey, AssetSlot | null> = {
  sky: null,
  ground: null,
  city: null,

  // 3d-assests/11-building-.rar → public/models/building.glb (tools/convert/building.py).
  // Two towers; the rotated one was aligned so its glazed lobby faces +Z with the
  // model origin at the lobby's floor centre, and a doorway was cut in the glazing.
  heroBuilding: {
    url: '/models/building.glb',
    position: [0, 0, DOOR.z],
    fit: { axis: 'y', size: HERO_BUILDING.height, anchor: [0, 0, 0] },
  },

  // 3d-assests/door.obj → public/models/door.glb (tools/convert/door.py).
  // Nodes: "Frame" (static), "DoorL" / "DoorR" (the two leaves, origins on their jambs).
  doors: {
    url: '/models/door.glb',
    position: [0, 0, DOOR.z],
    fit: { axis: 'y', size: DOOR.height },
    doors: { mode: 'swing', angle: 1.9 },
  },

  // 3d-assests/coridor.zip (Corridor.fbx) → public/models/corridor.glb (tools/convert/corridor.py).
  // Trimmed to the first 45 units at 8 wide; origin at the entrance floor centre.
  corridor: {
    url: '/models/corridor.glb',
    position: [0, 0, CORRIDOR.zStart],
    fit: { axis: 'x', size: CORRIDOR.width, anchor: [0, 0, 0] },
  },

  agentRoom: null,

  // Replaces the orb at the centre of the agent room. Wanted: "AI Head – Demystifying
  // Artificial Intelligence" by Brandon Baldwin (Sketchfab). That listing is view-only
  // (no download, no licence), so the file has to come from the author. Any head/bust
  // glTF saved at this path will be used; it spins about Y inside the wireframe.
  agentForm: {
    url: '/models/ai-head.glb',
    position: [0, 0, 0],
    fit: { axis: 'y', size: 2.4, align: 'center' },
  },
}
