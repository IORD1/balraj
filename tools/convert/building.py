import bpy, sys, os, math
from mathutils import Vector, Matrix
out = sys.argv[sys.argv.index('--') + 1]
DOOR_W = float(sys.argv[sys.argv.index('--') + 2])   # doorway cut, model units
DOOR_H = float(sys.argv[sys.argv.index('--') + 3])

for o in list(bpy.data.objects):
    if o.type in ('CAMERA', 'LIGHT') or o.name == 'Plane.004' or (o.type == 'MESH' and len(o.data.polygons) == 0):
        bpy.data.objects.remove(o, do_unlink=True)

def principled(m, color, metallic=0.0, roughness=0.5, emission=None, strength=0.0):
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    outn = nt.nodes.new('ShaderNodeOutputMaterial')
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Roughness'].default_value = roughness
    if emission:
        b.inputs['Emission Color'].default_value = (*emission, 1)
        b.inputs['Emission Strength'].default_value = strength
    nt.links.new(b.outputs['BSDF'], outn.inputs['Surface'])
    m.use_backface_culling = True   # -> glTF doubleSided=false: walls vanish when seen from inside

M = bpy.data.materials
principled(M['window'], (0.10, 0.16, 0.24), metallic=0.85, roughness=0.18)
principled(M['Material'], (0.20, 0.20, 0.22), roughness=0.75)
principled(M['Material.002'], (0.20, 0.20, 0.22), roughness=0.75)
principled(M['white'], (0.72, 0.70, 0.68), roughness=0.6)
principled(M['grey'], (0.16, 0.16, 0.17), roughness=0.6)
principled(M['light'], (0.0, 0.0, 0.0), roughness=0.5, emission=(1.0, 0.88, 0.70), strength=4.0)

dg = bpy.context.evaluated_depsgraph_get()
def wbbox(o):
    ev = o.evaluated_get(dg); me = ev.to_mesh()
    mn = Vector((1e9,1e9,1e9)); mx = Vector((-1e9,-1e9,-1e9))
    for v in me.vertices:
        w = ev.matrix_world @ v.co
        for k in range(3): mn[k] = min(mn[k], w[k]); mx[k] = max(mx[k], w[k])
    ev.to_mesh_clear(); return mn, mx

O = bpy.data.objects
tower = O['Cube.014']; lobby = O['Plane.006']; podium = O['Cube.013']
yaw = tower.matrix_world.to_euler().z
lmn, lmx = wbbox(lobby); tmn, tmx = wbbox(tower)
anchor = Vector(((lmn.x+lmx.x)/2, (lmn.y+lmx.y)/2, tmn.z))   # Blender: z up, y depth
print('yaw deg', round(math.degrees(yaw),2), 'anchor', [round(v,3) for v in anchor])
# outward normal of the lobby face = from tower centre towards the lobby centre (horizontal)
tc = (tmn + tmx) / 2
n = Vector((anchor.x - tc.x, anchor.y - tc.y, 0)).normalized()
print('lobby outward normal (blender xy)', [round(v,3) for v in n])
# undo the tower's own yaw (exact), then add the quarter turn that points the lobby face to -Y
# in Blender (= +Z in glTF, towards the camera)
best = None
for k in range(4):
    ang = -yaw + k * math.pi / 2
    r = Matrix.Rotation(ang, 2, 'Z') if False else None
    nx = n.x*math.cos(ang) - n.y*math.sin(ang); ny = n.x*math.sin(ang) + n.y*math.cos(ang)
    score = -ny   # want (0,-1)
    if best is None or score > best[0]: best = (score, ang, (round(nx,3), round(ny,3)))
ang = best[1]
print('rotate by deg', round(math.degrees(ang),2), 'lobby normal after', best[2])
X = Matrix.Rotation(ang, 4, 'Z') @ Matrix.Translation(-anchor)

# apply the alignment to every object
for o in bpy.data.objects:
    if o.parent is None:
        o.matrix_world = X @ o.matrix_world

# doorway: slice the lobby glazing along the opening's edges and delete what lies inside.
# (a boolean cannot be trusted on this thin, non-manifold strip.) Done in world space.
import bmesh
bpy.ops.object.select_all(action='DESELECT')
lobby.select_set(True); bpy.context.view_layer.objects.active = lobby
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bm = bmesh.new(); bm.from_mesh(lobby.data)
for co, no in (((-DOOR_W/2, 0, 0), (1, 0, 0)), ((DOOR_W/2, 0, 0), (1, 0, 0)), ((0, 0, DOOR_H), (0, 0, 1))):
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=Vector(co), plane_no=Vector(no), clear_outer=False, clear_inner=False)
inside = [f for f in bm.faces if abs(f.calc_center_median().x) < DOOR_W/2 - 1e-4 and -0.01 < f.calc_center_median().z < DOOR_H - 1e-4]
print('lobby faces removed for the doorway', len(inside), 'of', len(bm.faces))
bmesh.ops.delete(bm, geom=inside, context='FACES')
bm.to_mesh(lobby.data); bm.free(); lobby.data.update()

dg = bpy.context.evaluated_depsgraph_get()
tot_mn = Vector((1e9,1e9,1e9)); tot_mx = Vector((-1e9,-1e9,-1e9))
for o in bpy.data.objects:
    if o.type != 'MESH': continue
    mn, mx = wbbox(o)
    y_mn = [round(mn.x,2), round(mn.z,2), round(-mx.y,2)]; y_mx = [round(mx.x,2), round(mx.z,2), round(-mn.y,2)]
    if o.name in ('Cube.014','Cube.013','Plane.006','Cube.009','Cube.010','Plane.005','Cube.016','Plane.008'):
        print('BBOX(yup)', o.name, 'min', y_mn, 'max', y_mx)
    for k in range(3): tot_mn[k] = min(tot_mn[k], mn[k]); tot_mx[k] = max(tot_mx[k], mn[k]*0+mx[k])
print('TOTAL(yup) min', [round(tot_mn.x,2), round(tot_mn.z,2), round(-tot_mx.y,2)], 'max', [round(tot_mx.x,2), round(tot_mx.z,2), round(-tot_mn.y,2)])
print('lobby polys after cut', len(lobby.data.polygons), 'podium polys', len(podium.data.polygons))

bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True,
                          export_materials='EXPORT', export_cameras=False, export_lights=False)
print('EXPORTED', out, os.path.getsize(out))
