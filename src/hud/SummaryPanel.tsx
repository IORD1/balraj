import { useRef } from 'react'
import type { AgentOutput } from '../config/content'
import { useExperience } from '../state/experience'

/** Slides up from the bottom once the agent run completes. */
export function SummaryPanel() {
  const visible = useExperience((s) => s.summaryVisible)
  const result = useExperience((s) => s.agentResult)
  const openModal = useExperience((s) => s.openModal)
  // keep the last result while the panel slides out after a replay
  const last = useRef<AgentOutput | null>(null)
  if (result) last.current = result
  const output = result ?? last.current

  return (
    <div id="hud-summary" className={visible ? 'show' : undefined} aria-hidden={!visible}>
      {output && (
        <>
          <div className="summary-stats">
            {output.stats.map((stat) => (
              <div className="stat-block" key={stat.label}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="summary-headline">{output.headline}</div>
          <button type="button" id="view-output" onClick={openModal} tabIndex={visible ? 0 : -1}>
            View full output
          </button>
        </>
      )}
    </div>
  )
}
