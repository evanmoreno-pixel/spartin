const dateTimePattern = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/

export function normalizeEventTimestamp(value: unknown) {
  if (typeof value !== 'string' || !dateTimePattern.test(value) || value !== value.trim()) return
  const day = new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== value.slice(0, 10)) return
  const instant = new Date(value)
  if (!Number.isFinite(instant.getTime()) || instant.getUTCFullYear() < 1 || instant.getUTCFullYear() > 9999) return
  return instant.toISOString()
}
