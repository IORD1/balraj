import bpy, bmesh, sys, os, math, collections
from mathutils import Vector, Matrix
src = sys.argv[sys.argv.index('--') + 1]; out = sys.argv[sys.argv.index('--') + 2]
WIDTH = float(sys.argv[sys.argv.index('--') + 3]); LENGTH = float(sys.argv[sys.argv.index('--') + 4])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=src)
# keep world transforms (the FBX parents carry the unit scale and axis rotation)
for o in list(bpy.data.objects):
    if o.type == 'MESH':
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
for o in list(bpy.data.objects):
    if o.type != 'MESH' or o.name in ('Door', 'Frame'):
        bpy.data.objects.remove(o, do_unlink=True)
ob = bpy.data.objects['Corridor_']
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
me = ob.data
xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
x0, x1, y0, y1, z0, z1 = min(xs), max(xs), min(ys), max(ys), min(zs), max(zs)
print('blender bbox x', round(x0,2), round(x1,2), 'y(depth)', round(y0,2), round(y1,2), 'z(up)', round(z0,2), round(z1,2))
# where are the walls? histogram of x for vertices at mid height
mid = [v.co.x for v in me.vertices if abs(v.co.z - (z0+z1)/2) < (z1-z0)*0.25]
h = collections.Counter(round(x, 0) for x in mid)
print('x histogram (mid height):', sorted(h.items()))
hz = collections.Counter(round(v.co.z, 0) for v in me.vertices)
print('z(up) histogram:', sorted(hz.items())[:6], '...', sorted(hz.items())[-6:])
# faces capping the ends (normal along depth axis)
bm = bmesh.new(); bm.from_mesh(me); bm.normal_update()
caps = collections.Counter()
for f in bm.faces:
    if abs(f.normal.y) > 0.95 and f.calc_area() > 4:
        c = f.calc_center_median(); caps[(round(c.y, 0), 'front' if f.normal.y < 0 else 'back')] += 1
print('end-cap faces (depth, facing):', sorted(caps.items())[:12])
bm.free()

s = WIDTH / (x1 - x0)
keep_len = LENGTH / s
front = y0                      # Blender -Y is glTF +Z: the entrance end
cut_at = front + keep_len
print('scale', round(s,4), 'keep model length', round(keep_len,2), 'cut at depth', round(cut_at,2), 'of', round(y1,2))
bm = bmesh.new(); bm.from_mesh(me)
geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
bmesh.ops.bisect_plane(bm, geom=geom, plane_co=Vector((0, cut_at, 0)), plane_no=Vector((0, 1, 0)), clear_outer=True, clear_inner=False)
bm.to_mesh(me); bm.free(); me.update()
# origin at entrance-centre-floor
cx = (x0 + x1) / 2
for v in me.vertices:
    v.co.x -= cx; v.co.y -= front; v.co.z -= z0
me.update()
xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
print('after: x', round(min(xs),2), round(max(xs),2), 'depth', round(min(ys),2), round(max(ys),2), 'height', round(min(zs),2), round(max(zs),2), 'polys', len(me.polygons))

def principled(m, color, metallic=0.0, roughness=0.5, emission=None, strength=0.0):
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    outn = nt.nodes.new('ShaderNodeOutputMaterial'); b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Metallic'].default_value = metallic; b.inputs['Roughness'].default_value = roughness
    if emission:
        b.inputs['Emission Color'].default_value = (*emission, 1); b.inputs['Emission Strength'].default_value = strength
    nt.links.new(b.outputs['BSDF'], outn.inputs['Surface'])
M = bpy.data.materials
principled(M['Main Mat'], (0.62, 0.63, 0.66), metallic=0.35, roughness=0.55)
principled(M['White Glow'], (0.05, 0.05, 0.05), roughness=0.5, emission=(1.0, 0.93, 0.82), strength=3.0)
for m in list(M):
    if m.users == 0: M.remove(m)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True, export_materials='EXPORT', export_cameras=False, export_lights=False)
print('EXPORTED', out, os.path.getsize(out))
