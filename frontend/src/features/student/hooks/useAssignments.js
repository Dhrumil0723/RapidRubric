import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

export function useAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/assignments/open')
      .then(setAssignments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { assignments, loading, error }
}
