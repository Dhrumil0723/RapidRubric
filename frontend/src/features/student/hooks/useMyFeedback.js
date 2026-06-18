import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

// DEV preview data — shown only in `npm run dev` if the backend isn't reachable.
const SAMPLE = [
  { id: 'sub1', assignment_title: 'Essay 1 — Rhetorical Analysis', status: 'released', total_score: 38, max_score: 45, released_at: '2026-06-01', submitted_at: '2026-03-04', file_name: 'essay1_final.pdf', file_size_mb: 2.4, file_url: '#' },
  { id: 'sub2', assignment_title: 'Essay 2 — Argumentative', status: 'pending_ta_review', submitted_at: '2026-03-19', file_name: 'essay2_draft.pdf', file_size_mb: 1.9, file_url: '#' },
  { id: 'sub3', assignment_title: 'Reflection: Peer Review', status: 'released', total_score: 42, max_score: 50, released_at: '2026-05-18', submitted_at: '2026-05-10', file_name: 'reflection.pdf', file_size_mb: 0.8, file_url: '#' },
]

export function useMyFeedback() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/submissions/mine')
      .then(setSubmissions)
      .catch((err) => {
        if (import.meta.env.DEV) setSubmissions(SAMPLE)
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return { submissions, loading, error }
}
