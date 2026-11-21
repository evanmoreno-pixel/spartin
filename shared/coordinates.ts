export interface Coordinates {
  latitude: number
  longitude: number
}

export function validLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90
}

export function validLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180
}

export function validCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') return false
  const { latitude, longitude } = value as Partial<Coordinates>
  return validLatitude(latitude) && validLongitude(longitude)
}
