import { ENGAGEMENT } from '../config/content'
import { useExperience } from '../state/experience'

/** Act 1 title card. Keyed on runId so the fade-in replays with the intro. */
export function IntroCard() {
  const visible = useExperience((s) => s.introCardVisible)
  const runId = useExperience((s) => s.runId)
  return (
    <div id="hud-intro" className={visible ? undefined : 'fade-out'}>
      <div id="intro-title" key={`title-${runId}`}>
        {ENGAGEMENT.firm}
      </div>
      <div id="intro-subtitle" key={`subtitle-${runId}`}>
        {ENGAGEMENT.introSubtitle}
      </div>
    </div>
  )
}
