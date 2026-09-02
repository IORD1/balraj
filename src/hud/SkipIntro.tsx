import { useExperience } from '../state/experience'

export function SkipIntro() {
  const phase = useExperience((s) => s.phase)
  const skipIntro = useExperience((s) => s.skipIntro)
  if (phase !== 'INTRO') return null
  return (
    <button type="button" id="skip-intro" onClick={skipIntro}>
      Skip intro
    </button>
  )
}
