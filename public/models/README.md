# Models

Converted from the source files in `../../3d-assests/` with the Blender scripts in
`tools/convert/` (see the README there). All are glTF-Binary, Y-up, metres.

| File                | Source                          | Slot (`src/config/assets.ts`) | Notes |
|---------------------|---------------------------------|-------------------------------|-------|
| `building.glb`      | `11-building-.rar` (Blender 2.79) | `heroBuilding`              | two towers; the rotated one faces +Z with its lobby at the origin, doorway cut in the glazing, ground plane / camera / sun removed, backface culling on (the app sets `shadowSide = DoubleSide` on loaded models so culled walls still block the moonlight) |
| `door.glb`          | `door.obj` (SketchUp, cm)       | `doors`                       | nodes `Frame`, `DoorL`, `DoorR`; leaf origins on the jambs so they swing; colours assigned by material name (no .mtl was supplied) |
| `corridor.glb`      | `coridor.zip` → `Corridor.fbx`  | `corridor`                    | first 45 units of the hall at 8 wide, origin at the entrance floor centre; far-end door dropped; chrome/black materials replaced |
| `ai-head.glb`       | not available yet               | `agentForm`                   | "AI Head – Demystifying Artificial Intelligence" (Brandon Baldwin, Sketchfab) is view-only with no licence — the file must come from the author. Until it exists the orb placeholder shows. |

To re-convert after editing a source file, run the matching script from `tools/convert/`.
