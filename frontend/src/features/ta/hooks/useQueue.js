import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

export function useQueue() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/ta/queue')
      .then(setQueue)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const pending = queue.filter((s) => s.status === 'pending_ta_review')
  const released = queue.filter((s) => s.status === 'released')

  return { queue, pending, released, loading, error }
}
