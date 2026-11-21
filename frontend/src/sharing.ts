export function eventShareUrl(eventId: string, origin = window.location.origin) {
  return new URL(`/events/${encodeURIComponent(eventId)}`, origin).href
}

export async function shareEventLink(title: string, url: string) {
  try {
    const data = { title, url }
    if (typeof navigator.share !== 'function' || (navigator.canShare && !navigator.canShare(data))) return 'unavailable'
    await navigator.share(data)
    return 'shared'
  } catch (error) {
    return error instanceof DOMException && error.name === 'AbortError' ? 'cancelled' : 'failed'
  }
}

export async function copyEventLink(url: string) {
  if (!navigator.clipboard?.writeText) return false
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}
