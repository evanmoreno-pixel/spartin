import { useEffect, useState } from 'react'

export function useResource<T>(load: (signal: AbortSignal) => Promise<T>, live = false) {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<{ load: typeof load; data?: T; error?: unknown }>()
  const [refreshing, setRefreshing] = useState(true)
  const current = result?.load === load ? result : undefined

  useEffect(() => {
    let activeRequest: AbortController | undefined
    function fetchData() {
      const request = new AbortController()
      activeRequest = request
      setRefreshing(true)
      void load(request.signal).then(
        data => {
          if (!request.signal.aborted) setResult({ load, data })
        },
        error => {
          if (!request.signal.aborted) setResult({ load, error })
        },
      ).finally(() => {
        if (!request.signal.aborted) {
          activeRequest = undefined
          setRefreshing(false)
        }
      })
    }

    fetchData()
    function refreshWhenVisible() {
      if (!document.hidden && !activeRequest) fetchData()
    }

    const timer = live ? window.setInterval(refreshWhenVisible, 15_000) : undefined
    if (live) {
      window.addEventListener('focus', refreshWhenVisible)
      document.addEventListener('visibilitychange', refreshWhenVisible)
    }
    return () => {
      activeRequest?.abort()
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshWhenVisible)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [load, live, version])

  return {
    ...current,
    pending: !current,
    refreshing,
    refresh: () => {
      setRefreshing(true)
      setVersion(value => value + 1)
    },
  }
}
