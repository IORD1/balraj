import { ENGAGEMENT } from '../config/content'
import { HERO_SIGN } from '../config/layout'
import { makeTexture } from '../lib/textures/canvas'
import { createSignCanvas } from '../lib/textures/sign'
import { useDisposable } from '../lib/useDisposable'

/**
 * Rooftop signage on the hero building. Kept outside the `heroBuilding` slot so the
 * branding survives whichever building model is swapped in; position it via HERO_SIGN.
 */
export function HeroSign() {
  const texture = useDisposable(() => makeTexture(createSignCanvas(ENGAGEMENT.buildingSign), 1), [])
  return (
    <mesh position={HERO_SIGN.position} rotation={HERO_SIGN.rotation}>
      <planeGeometry args={HERO_SIGN.size} />
      <meshBasicMaterial map={texture} fog={false} />
    </mesh>
  )
}
