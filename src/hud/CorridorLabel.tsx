import { useEffect, useState } from 'react'
import { CORRIDOR_LABEL_HOLD_MS } from '../config/timing'
import { useExperience } from '../state/experience'

/** Act 4: framework name shown briefly as the camera passes each panel. */
export function CorridorLabel() {
  const label = useExperience((s) => s.corridorLabel)
  const [text, setText] = useState({ name: '', subtitle: '' })
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!label) {
      setShow(false)
      return
    }
    setText({ name: label.name, subtitle: label.subtitle })
    setShow(true)
    const timer = setTimeout(() => setShow(false), CORRIDOR_LABEL_HOLD_MS)
    return () => clearTimeout(timer)
  }, [label])

  return (
    <div id="hud-corridor-label" className={show ? 'show' : undefined}>
      <div className="label-name">{text.name}</div>
      <div className="label-subtitle">{text.subtitle}</div>
    </div>
  )
}
