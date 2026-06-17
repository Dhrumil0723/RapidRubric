import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

export function useFeedback(submissionId) {
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!submissionId) return
    api.get(`/api/submissions/feedback/${submissionId}`)
      .then(setFeedback)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [submissionId])

  return { feedback, loading, error }
}
