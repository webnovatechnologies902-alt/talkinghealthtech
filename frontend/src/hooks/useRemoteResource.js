import { useCallback, useEffect, useState } from 'react'

function useRemoteResource(loader, key = '', enabled = true) {
  const [resource, setResource] = useState({ key: null, requestNumber: -1, data: null, error: '', loading: true })
  const [requestNumber, setRequestNumber] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined

    let controller
    const timer = setTimeout(() => {
      controller = new AbortController()
      loader(key, controller.signal)
        .then((data) => setResource({ key, requestNumber, data, error: '', loading: false }))
        .catch((requestError) => {
          if (!controller.signal.aborted) {
            setResource({
              key,
              requestNumber,
              data: null,
              error: requestError.message || 'Unable to load this content.',
              loading: false,
            })
          }
        })
    }, 0)

    return () => {
      clearTimeout(timer)
      controller?.abort()
    }
  }, [enabled, key, loader, requestNumber])

  const reload = useCallback(() => setRequestNumber((number) => number + 1), [])
  const isCurrentRequest = resource.key === key && resource.requestNumber === requestNumber
  return {
    data: enabled && isCurrentRequest ? resource.data : null,
    loading: enabled && (!isCurrentRequest || resource.loading),
    error: enabled && isCurrentRequest ? resource.error : '',
    reload,
  }
}

export default useRemoteResource
