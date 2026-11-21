import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Coordinates } from '../../shared/coordinates'
import { campusCenter } from './locations'
import type { BrowserPosition } from './useBrowserLocation'

export interface MapPin {
  id: string
  title: string
  point: Coordinates
}

const osmTiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

function mapPoint({ latitude, longitude }: Coordinates): L.LatLngTuple {
  return [latitude, longitude]
}

export default function EventMap({ pins, position, onSelect, label }: {
  pins: readonly MapPin[]
  position?: BrowserPosition
  onSelect?: (ids: string[]) => void
  label: string
}) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const [tiles, setTiles] = useState<'loading' | 'ready' | 'failed'>('loading')

  useEffect(() => {
    if (!container.current) return
    const instance = L.map(container.current, { minZoom: 2, maxZoom: 19, scrollWheelZoom: false, attributionControl: false })
      .setView(mapPoint(campusCenter), 16)
    map.current = instance
    const resize = typeof ResizeObserver === 'undefined' ? undefined
      : new ResizeObserver(() => instance.invalidateSize({ pan: false }))
    resize?.observe(container.current)
    return () => {
      resize?.disconnect()
      instance.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    const instance = map.current
    if (!instance) return
    const layers = L.layerGroup().addTo(instance)
    const groups = new Map<string, MapPin[]>()
    for (const pin of pins) {
      const key = mapPoint(pin.point).join(',')
      const group = groups.get(key)
      if (group) group.push(pin)
      else groups.set(key, [pin])
    }

    for (const group of groups.values()) {
      const title = group.length === 1 ? group[0].title : `Events here: ${group.map(pin => pin.title).join(', ')}`
      const marker = L.marker(mapPoint(group[0].point), {
        title, keyboard: !!onSelect, interactive: !!onSelect,
        icon: L.divIcon({ className: 'event-map-pin', html: group.length === 1 ? '●' : String(group.length), iconSize: [34, 34] }),
      }).addTo(layers)
      const element = marker.getElement()
      element?.setAttribute('role', onSelect ? 'button' : 'img')
      element?.setAttribute('aria-label', title)
      if (onSelect) {
        marker.on('click', () => onSelect(group.map(pin => pin.id)))
        element?.addEventListener('keydown', event => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            onSelect(group.map(pin => pin.id))
          }
        })
      }
    }

    const destinations = pins.map(pin => mapPoint(pin.point))
    const bounds = L.latLngBounds(destinations.length ? destinations : [mapPoint(campusCenter)])
    let streetTiles: L.TileLayer | undefined
    if (position) {
      const point = mapPoint(position)
      bounds.extend(point)
      if (position.accuracy > 0) {
        const accuracy = L.circle(point, {
          radius: position.accuracy, color: '#225bb1', fillOpacity: 0.12, interactive: false,
        }).addTo(layers)
        bounds.extend(accuracy.getBounds())
      }
      const marker = L.marker(point, {
        keyboard: false, interactive: false, title: 'Your approximate location', zIndexOffset: 100,
        icon: L.divIcon({ className: 'user-map-pin', iconSize: [20, 20] }),
      }).addTo(layers)
      marker.getElement()?.setAttribute('role', 'img')
      marker.getElement()?.setAttribute('aria-label', 'Your approximate location')
    }
    instance.fitBounds(bounds, { padding: [26, 26], maxZoom: 17, animate: false })

    if (!position) {
      setTiles('loading')
      streetTiles = L.tileLayer(osmTiles, {
        noWrap: true, updateWhenIdle: true, maxZoom: 19,
        referrerPolicy: 'strict-origin-when-cross-origin',
      })
      streetTiles.on('load', () => setTiles('ready'))
      streetTiles.on('tileerror', () => {
        streetTiles?.remove().off()
        setTiles('failed')
      })
      streetTiles.addTo(instance)
    }
    return () => {
      streetTiles?.remove().off()
      layers.remove()
    }
  }, [pins, position, onSelect])

  return (
    <div className="map-frame">
      <div className="event-map" ref={container} role="region" aria-label={label} />
      <div className="map-credit">
        <a className="text-link" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>
      </div>
      {position ? <p className="map-note">Street tiles are paused while your location is shown.</p>
        : tiles === 'failed' ? <p className="map-note" role="status">Street tiles are unavailable. Pins and directions are still available.</p>
        : tiles === 'loading' && <p className="map-note" role="status">Loading street map…</p>}
    </div>
  )
}
