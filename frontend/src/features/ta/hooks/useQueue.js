import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

const MAX_SCORE = 45

// DEV preview data — shown only in `npm run dev` if the backend isn't reachable.
const SAMPLE = [
  { id: 's1', student_name: 'Jordan Lee', assignment_title: 'Essay 1 — Rhetorical Analysis', ai_score: 32, max_score: MAX_SCORE, flags: 2, status: 'pending_ta_review' },
  { id: 's2', student_name: 'Priya N.', assignment_title: 'Essay 1 — Rhetorical Analysis', ai_score: 36, max_score: MAX_SCORE, flags: 0, status: 'pending_ta_review' },
  { id: 's3', student_name: 'Marcus T.', assignment_title: 'Essay 1 — Rhetorical Analysis', ai_score: 29, max_score: MAX_SCORE, flags: 3, status: 'pending_ta_review' },
  { id: 's4', student_name: 'Ava Nguyen', assignment_title: 'Essay 1 — Rhetorical Analysis', ai_score: 38, max_score: MAX_SCORE, flags: 1, status: 'pending_ta_review' },
  { id: 's5', student_name: 'Liam Patel', assignment_title: 'Essay 1 — Rhetorical Analysis', ai_score: 27, max_score: MAX_SCORE, flags: 2, status: 'pending_ta_review' },
  { id: 's6', student_name: 'Emma Davis', assignment_title: 'Essay 1 — Rhetorical Analysis', ai_score: 34, max_score: MAX_SCORE, flags: 0, status: 'pending_ta_review' },
  { id: 's7', student_name: 'Wei Zhang', assignment_title: 'Essay 1 — Rhetorical Analysis', ai_score: 40, max_score: MAX_SCORE, flags: 0, status: 'released' },
  { id: 's8', student_name: 'Noah Smith', assignment_title: 'Essay 1 — Rhetorical Analysis', ai_score: 35, max_score: MAX_SCORE, flags: 1, status: 'released' },
  { id: 's9', student_name: 'Olivia Brown', assignment_title: 'Essay 1 — Rhetorical Analysis', ai_score: 37, max_score: MAX_SCORE, flags: 0, status: 'released' },
  { id: 's10', student_name: 'Sofia R.', assignment_title: 'Essay 1 — Rhetorical Analysis', ai_score: 31, max_score: MAX_SCORE, flags: 1, status: 'returned' },
]

export function useQueue() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/ta/queue')
      .then(setQueue)
      .catch((err) => {
        if (import.meta.env.DEV) setQueue(SAMPLE)
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const pending = queue.filter((s) => s.status === 'pending_ta_review')
  const released = queue.filter((s) => s.status === 'released')
  const returned = queue.filter((s) => s.status === 'returned')

  const scored = queue.filter((s) => typeof s.ai_score === 'number')
  const avgAiScore = scored.length
    ? Math.round(scored.reduce((sum, s) => sum + s.ai_score, 0) / scored.length)
    : null
  const maxScore = queue[0]?.max_score ?? MAX_SCORE

  return { queue, pending, released, returned, avgAiScore, maxScore, loading, error }
}
