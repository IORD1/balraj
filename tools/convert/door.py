import bpy, sys, os
from mathutils import Vector
src = sys.argv[sys.argv.index('--') + 1]
out = sys.argv[sys.argv.index('--') + 2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.obj_import(filepath=src, global_scale=0.01, use_split_objects=True, use_split_groups=True,
                      forward_axis='NEGATIVE_Z', up_axis='Y')
objs = [o for o in bpy.data.objects if o.type == 'MESH']
print('imported', len(objs), 'objects')

def principled(m, color, metallic=0.0, roughness=0.5):
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    outn = nt.nodes.new('ShaderNodeOutputMaterial')
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Roughness'].default_value = roughness
    nt.links.new(b.outputs['BSDF'], outn.inputs['Surface'])

walnut = (0.16, 0.085, 0.045)
M = bpy.data.materials
print('materials', [m.name for m in M])
for m in M:
    n = m.name
    if n.startswith('wood') or n.startswith('FrontColor'): principled(m, walnut, roughness=0.55)
    elif 'Gainsboro' in n: principled(m, (0.78, 0.78, 0.80), metallic=1.0, roughness=0.3)
    elif 'White' in n: principled(m, (0.9, 0.9, 0.9), metallic=0.2, roughness=0.4)
    elif 'Goldenrod' in n: principled(m, (0.72, 0.53, 0.04), metallic=1.0, roughness=0.35)
    else: principled(m, walnut, roughness=0.55)
fallback = M.get('wood') or M[0]
for o in objs:
    if len(o.data.materials) == 0: o.data.materials.append(fallback)
    for i, m in enumerate(o.data.materials):
        if m is None: o.data.materials[i] = fallback

frame = [o for o in objs if o.name.startswith('Mesh1 ') or o.name == 'Mesh1']
parts = [o for o in objs if o not in frame]
print('frame', [o.name for o in frame], 'leaf parts', len(parts))

# The leaf is really a pair: split every part at the meeting line (x = SPLIT) so the
# halves can swing apart. Parts that straddle the line are bisected into two objects.
SPLIT = 0.75          # metres; the door is 1.5 wide with the pull bars either side of the centre
import bmesh
def xrange_of(o):
    xs = [(o.matrix_world @ v.co).x for v in o.data.vertices]
    return min(xs), max(xs)
left, right = [], []
for o in parts:
    x0, x1 = xrange_of(o)
    if x1 <= SPLIT + 0.005: left.append(o)
    elif x0 >= SPLIT - 0.005: right.append(o)
    else:
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
        bpy.ops.object.duplicate(); dup = bpy.context.active_object
        for ob, clear_outer in ((o, True), (dup, False)):
            bm = bmesh.new(); bm.from_mesh(ob.data)
            inv = ob.matrix_world.inverted()
            co = inv @ Vector((SPLIT, 0, 0)); no = (inv.to_3x3() @ Vector((1, 0, 0))).normalized()
            bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=co, plane_no=no,
                                   clear_outer=clear_outer, clear_inner=not clear_outer)
            bm.to_mesh(ob.data); bm.free(); ob.data.update()
        left.append(o); right.append(dup)
print('left parts', len(left), 'right parts', len(right))

def join(objs_, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs_: o.select_set(True)
    bpy.context.view_layer.objects.active = objs_[0]
    bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active; ob.name = name; return ob
leafL = join(left, 'DoorL'); leafR = join(right, 'DoorR')
frame[0].name = 'Frame'

# hinges on the jambs (x = 5 cm / 145 cm), mid-depth of the frame (y = -5 cm here)
def set_origin(ob, loc):
    bpy.context.scene.cursor.location = Vector(loc)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
set_origin(leafL, (0.05, -0.05, 0.0)); set_origin(leafR, (1.45, -0.05, 0.0)); set_origin(frame[0], (0, 0, 0))
for o in (leafL, leafR, frame[0]):
    print('OBJ', o.name, 'origin', [round(v,3) for v in o.location], 'dims', [round(v,3) for v in o.dimensions], 'polys', len(o.data.polygons))
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True,
                          export_materials='EXPORT', export_cameras=False, export_lights=False)
print('EXPORTED', out, os.path.getsize(out))
