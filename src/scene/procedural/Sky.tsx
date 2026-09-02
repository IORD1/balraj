import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS, lc } from '../../config/theme'

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`

const fragmentShader = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 horizonColor;
  uniform vec3 bottomColor;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition).y;
    vec3 color;
    if (h > 0.0) { color = mix(horizonColor, topColor, pow(h, 0.6)); }
    else { color = mix(horizonColor, bottomColor, pow(-h, 0.5)); }
    gl_FragColor = vec4(color, 1.0);
  }`

/** Night-sky gradient dome. */
export function Sky() {
  const uniforms = useMemo(
    () => ({
      topColor: { value: lc(COLORS.purpleDeep) },
      horizonColor: { value: lc(0x8b4a3f) },
      bottomColor: { value: lc(0x050508) },
    }),
    [],
  )
  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[300, 32, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}
