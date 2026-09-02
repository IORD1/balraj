import { useExperience } from '../state/experience'

/** White entry flash when the camera crosses the threshold. Remounts per fire so the animation restarts. */
export function Flash() {
  const flashKey = useExperience((s) => s.flashKey)
  return <div id="flash" key={flashKey} className={flashKey > 0 ? 'fire' : undefined} />
}
