import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

// DEV preview data — shown only in `npm run dev` if the backend isn't reachable.
const SAMPLE = { total_submissions: 128, pending_review: 14, released: 96, avg_score: 82 }

export function useDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/instructor/analytics/summary')
      .then(setStats)
      .catch((err) => {
        if (import.meta.env.DEV) setStats(SAMPLE)
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return { stats, loading, error }
}
