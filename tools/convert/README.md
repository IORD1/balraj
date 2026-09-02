# Model conversion scripts (Blender 4.2, headless)

The files in `3d-assests/` are converted to glTF-Binary in `public/models/` with these
scripts. Blender is not part of the repo; a portable build works
(https://www.blender.org/download/lts/4-2/).

```sh
B=/path/to/blender
# building: aligns the rotated tower so its lobby faces +Z, origin at the lobby floor centre,
# cuts a 2.1 x 3.0 (model units) doorway in the lobby glazing, fixes the materials
$B -b "3d-assests/building .blend" --python tools/convert/building.py -- public/models/building.glb 2.1 3.0

# door: OBJ (cm) -> metres, splits the leaf pair into "DoorL" / "DoorR" nodes with their
# origins on the jambs, keeps the frame as "Frame", assigns colours by material name (no .mtl)
$B -b --python tools/convert/door.py -- 3d-assests/door.obj public/models/door.glb

# corridor: keeps the first 45 world units of the hall at 8 wide (drops its far-end door),
# origin at the entrance floor centre, replaces the chrome/black materials
$B -b --python tools/convert/corridor.py -- Corridor.fbx public/models/corridor.glb 8 45
```

The `.rar` needs `unrar` (RAR 5 with a method p7zip cannot read); the corridor zip
extracts with any unzip.
