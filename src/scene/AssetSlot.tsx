import { Clone, useGLTF } from '@react-three/drei'
import { Component, Suspense, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { ASSETS, type AssetFit, type AssetKey, type AssetSlot as AssetSlotConfig } from '../config/assets'

interface BoundaryProps {
  name: string
  fallback: ReactNode
  children: ReactNode
}

/** Falls back to the procedural placeholder if a model fails to load. */
export class AssetErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn(`[assets] "${this.props.name}" failed to load — using the procedural placeholder.`, error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Uniform scale + offset that realise an `AssetFit` for a model with bounding box `box`. */
export function computeFit(box: THREE.Box3, fit: AssetFit | undefined): { scale: number; offset: THREE.Vector3 } {
  if (!fit) return { scale: 1, offset: new THREE.Vector3() }
  const size = box.getSize(new THREE.Vector3())
  const dim = fit.axis === 'longest' ? Math.max(size.x, size.y, size.z) : size[fit.axis]
  const s = dim > 0 ? fit.size / dim : 1
  if (fit.anchor) {
    return { scale: s, offset: new THREE.Vector3(-fit.anchor[0] * s, -fit.anchor[1] * s, -fit.anchor[2] * s) }
  }
  const center = box.getCenter(new THREE.Vector3())
  return {
    scale: s,
    offset: new THREE.Vector3(
      fit.center === false ? 0 : -center.x * s,
      fit.align === 'center' ? -center.y * s : -box.min.y * s,
      fit.center === false ? 0 : -center.z * s,
    ),
  }
}

/** Loads a glTF and applies the slot's fit/transform. */
export function SceneAsset({ url, position, rotation, scale, fit }: AssetSlotConfig) {
  const { scene } = useGLTF(url)

  // Bounding box of the raw model, in its own frame.
  const box = useMemo(() => new THREE.Box3().setFromObject(scene), [scene])
  const fitted = useMemo(() => computeFit(box, fit), [box, fit])

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group scale={fitted.scale} position={fitted.offset}>
        <Clone object={scene} castShadow receiveShadow />
      </group>
    </group>
  )
}

interface SlotProps {
  name: AssetKey
  /** Procedural placeholder: rendered when the slot is empty, while loading, and on failure. */
  fallback: ReactNode
}

export function Slot({ name, fallback }: SlotProps) {
  const slot = ASSETS[name]
  if (!slot) return <>{fallback}</>
  return (
    <AssetErrorBoundary name={name} fallback={fallback}>
      <Suspense fallback={fallback}>
        <SceneAsset {...slot} />
      </Suspense>
    </AssetErrorBoundary>
  )
}
