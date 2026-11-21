import { Copy, Share2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { copyEventLink, eventShareUrl, shareEventLink } from './sharing'
import { Notice } from './ui'

export function ShareActions({ eventId, title }: { eventId: string; title: string }) {
  const url = eventShareUrl(eventId)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState({ message: '', manual: false })
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!feedback.manual) return
    input.current?.focus()
    input.current?.select()
  }, [feedback])

  async function share() {
    setBusy(true)
    setFeedback({ message: '', manual: false })
    try {
      const result = await shareEventLink(title, url)
      if (result === 'shared') setFeedback({ message: 'Share request completed.', manual: false })
      if (result === 'unavailable') setFeedback({ message: 'Direct sharing is unavailable here. Copy the event link below.', manual: true })
      if (result === 'failed') setFeedback({ message: 'The share menu could not open. Copy the event link below.', manual: true })
    } finally {
      setBusy(false)
    }
  }

  async function copy() {
    setBusy(true)
    setFeedback({ message: '', manual: false })
    try {
      const copied = await copyEventLink(url)
      setFeedback(copied
        ? { message: 'Event link copied.', manual: false }
        : { message: 'Clipboard access is unavailable. Select and copy the event link below.', manual: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="event-description" aria-labelledby="share-heading">
      <h2 id="share-heading">Share</h2>
      <div className="event-tools">
        <button type="button" className="button secondary" disabled={busy} onClick={() => void share()}>
          <Share2 size={17} aria-hidden="true" /> Share event
        </button>
        <button type="button" className="button secondary" disabled={busy} onClick={() => void copy()}>
          <Copy size={17} aria-hidden="true" /> Copy link
        </button>
      </div>
      {feedback.message && <Notice>{feedback.message}</Notice>}
      {feedback.manual && (
        <div className="field">
          <label htmlFor="manual-event-link">Event link</label>
          <input id="manual-event-link" type="url" readOnly ref={input} value={url} onFocus={event => event.currentTarget.select()} />
        </div>
      )}
    </section>
  )
}
