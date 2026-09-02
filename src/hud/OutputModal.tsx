import { useEffect } from 'react'
import { ENGAGEMENT } from '../config/content'
import { useExperience } from '../state/experience'

/** Full agent output. Closes on the Close button, backdrop click, or Escape. */
export function OutputModal() {
  const open = useExperience((s) => s.modalOpen)
  const output = useExperience((s) => s.agentResult)
  const closeModal = useExperience((s) => s.closeModal)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeModal])

  if (!open || !output) return null

  return (
    <div id="modal-output" onClick={closeModal} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">{ENGAGEMENT.project} · Agent Output</div>
        <div className="modal-body">
          {output.sections.map((section) => (
            <p key={section.title}>
              <strong>{section.title}</strong>
              {section.body}
            </p>
          ))}
          <p className="meta">{output.meta}</p>
        </div>
        <div className="modal-footer">
          <button type="button" id="modal-close" onClick={closeModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
