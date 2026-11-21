import type { CampusEvent } from '../../shared/contracts'
import { validCoordinates, type Coordinates } from '../../shared/coordinates'

type EventLocation = Pick<CampusEvent, 'location' | 'coordinates'>

export const campusCenter: Coordinates = { latitude: 37.33513, longitude: -121.88122 }

const studentUnion = { latitude: 37.33649, longitude: -121.88068 } // OSM way 25774831
const campusVenues = new Map<string, { point: Coordinates; name: string }>([
  ['diaz compean student union', { point: studentUnion, name: 'Diaz Compean Student Union, San José State University' }],
  ['student union, room 1200', { point: studentUnion, name: 'Diaz Compean Student Union, San José State University' }],
  ['dr. martin luther king, jr. library', {
    point: { latitude: 37.33551, longitude: -121.88501 }, // OSM way 25774796
    name: 'Dr. Martin Luther King, Jr. Library, San José, CA',
  }],
])

export function canMap(point: Coordinates) {
  // The standard OSM projection stops at approximately 85 degrees north and south.
  return Math.abs(point.latitude) <= 85.05112878
}

function campusVenue(event: EventLocation) {
  return campusVenues.get(event.location.trim().toLowerCase())
}

export function eventPin(event: EventLocation) {
  if (validCoordinates(event.coordinates)) {
    return canMap(event.coordinates) ? { point: event.coordinates, venue: false } : undefined
  }
  const venue = campusVenue(event)
  if (venue) return { point: venue.point, venue: true }
}

export function directionsUrl(event: EventLocation) {
  const destination = validCoordinates(event.coordinates)
    ? `${event.coordinates.latitude},${event.coordinates.longitude}`
    : campusVenue(event)?.name ?? event.location.trim()
  if (!destination) return
  const url = new URL('https://www.google.com/maps/dir/')
  url.search = new URLSearchParams({ api: '1', destination }).toString()
  if (url.href.length <= 2048) return url.href
}
