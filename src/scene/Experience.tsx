import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, lc } from '../config/theme'
import { CAMERA_KEYFRAMES } from '../config/timing'
import { useExperience } from '../state/experience'
import { CameraRig } from './CameraRig'
import { World } from './World'

const start = CAMERA_KEYFRAMES[0]

/** The WebGL canvas. Mounted only once the web fonts are ready (canvas textures depend on them). */
export function Experience() {
  const setSceneReady = useExperience((s) => s.setSceneReady)
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      camera={{ fov: 50, near: 0.1, far: 500, position: start.pos }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
        camera.lookAt(...start.look)
        setSceneReady()
      }}
    >
      <color attach="background" args={[lc(COLORS.bgDeep)]} />
      <fog attach="fog" args={[lc(COLORS.bgDeep), 30, 200]} />
      <World />
      <CameraRig />
    </Canvas>
  )
}
