import { useEffect, useRef, useState } from 'react'
import { validCoordinates, type Coordinates } from '../../shared/coordinates'
import { canMap } from './locations'

export interface BrowserPosition extends Coordinates {
  accuracy: number
}

const errors: Record<number, string> = {
  1: 'Location permission was denied. You can change it in your browser settings.',
  2: 'Your device could not determine its location.',
  3: 'The location request timed out. Try again.',
}

export function useBrowserLocation() {
  const requestId = useRef(0)
  const [position, setPosition] = useState<BrowserPosition>()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => { requestId.current++ }, [])

  function stop() {
    requestId.current++
    setPosition(undefined)
    setPending(false)
    setError('')
  }

  function locate() {
    if (!window.isSecureContext || !navigator.geolocation) {
      setError('Location is unavailable in this browser or connection. Open SpartIN on HTTPS or localhost.')
      return
    }
    const request = ++requestId.current
    setPending(true)
    setError('')
    function fail(code: number) {
      if (request !== requestId.current) return
      setPending(false)
      setError(errors[code] ?? errors[2])
    }
    try {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        if (request !== requestId.current) return
        if (!validCoordinates(coords) || !Number.isFinite(coords.accuracy) || coords.accuracy < 0) {
          fail(2)
          return
        }
        setPending(false)
        if (!canMap(coords)) {
          setError('Your location is outside the area supported by this map.')
          return
        }
        setPosition({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy })
      }, failure => fail(failure.code), { enableHighAccuracy: false, maximumAge: 0, timeout: 10_000 })
    } catch {
      fail(2)
    }
  }

  return { position, pending, error, locate, stop }
}
