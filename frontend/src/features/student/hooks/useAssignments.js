import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

// DEV preview data — shown only in `npm run dev` if the backend isn't reachable.
const SAMPLE = [
  { id: 'a1', title: 'Essay 1 — Rhetorical Analysis', due_at: '2026-03-04', submission_status: 'released' },
  { id: 'a2', title: 'Essay 2 — Argumentative', due_at: '2026-03-20', submission_status: 'pending_ta_review' },
  { id: 'a3', title: 'Research Proposal', due_at: '2026-04-02', submission_status: null },
]

export function useAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/assignments/open')
      .then(setAssignments)
      .catch((err) => {
        if (import.meta.env.DEV) setAssignments(SAMPLE)
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return { assignments, loading, error }
}
