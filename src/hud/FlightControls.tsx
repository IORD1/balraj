import { useExperience } from '../state/experience'
import { useFlightInput } from './useFlightInput'

/**
 * Flight controls, shown during the intro: the auto-mode toggle and Skip at the top right,
 * a scroll hint at the bottom until the visitor scrolls, and a progress line along the
 * bottom edge (driven by the `--flight` CSS variable that CameraRig updates).
 * The scroll/touch/key listener stays active in every phase so scrolling back out of the
 * agent room re-enters the flight.
 */
export function FlightControls() {
  useFlightInput()
  const phase = useExperience((s) => s.phase)
  const sceneReady = useExperience((s) => s.sceneReady)
  const mode = useExperience((s) => s.flightMode)
  const scrubbed = useExperience((s) => s.flightScrubbed)
  const setFlightMode = useExperience((s) => s.setFlightMode)
  const skipIntro = useExperience((s) => s.skipIntro)
  if (phase !== 'INTRO') return null
  const auto = mode === 'auto'
  return (
    <>
      <div id="flight-controls">
        <button
          type="button"
          id="flight-auto"
          className={auto ? 'on' : undefined}
          aria-pressed={auto}
          title={auto ? 'Auto mode is playing the flight. Click (or scroll) to take over.' : 'Play the flight automatically from here.'}
          onClick={() => setFlightMode(auto ? 'scroll' : 'auto')}
        >
          <span className="dot" aria-hidden="true" />
          {auto ? 'Auto mode · on' : 'Auto mode'}
        </button>
        <button type="button" id="skip-intro" onClick={skipIntro}>
          Skip intro
        </button>
      </div>
      {sceneReady && (
        <div id="flight-hint" className={scrubbed ? 'seen' : undefined} aria-hidden={scrubbed}>
          <span className="glyph" aria-hidden="true">⇅</span>
          Scroll to move back and forth
        </div>
      )}
      <div id="flight-progress" aria-hidden="true">
        <i />
      </div>
    </>
  )
}
