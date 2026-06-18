import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

// DEV preview data — shown only in `npm run dev` if the backend isn't reachable.
const SAMPLE = {
  assignment_title: 'Essay 1 — Rhetorical Analysis',
  released_by: 'Sam O.',
  released_at: '2026-06-01',
  status: 'released',
  total_score: 38,
  max_score: 45,
  summary: 'Strong analysis with a clear thesis. Tighten evidence in a couple of body paragraphs and watch comma splices in the conclusion.',
  criteria: [
    { id: 'c1', name: 'Thesis & argument', score: 4.5, max_score: 5, feedback: 'Strong, specific problem framing. The argument is well defined and stays focused throughout.' },
    { id: 'c2', name: 'Use of evidence', score: 8, max_score: 10, feedback: 'Two claims in §3 lack a supporting source. Tie each major point to concrete evidence.' },
    { id: 'c3', name: 'Structure & flow', score: 21, max_score: 25, feedback: 'Mostly logical paragraph order; a couple of transitions are abrupt. Tighten the heading hierarchy.' },
    { id: 'c4', name: 'Grammar & style', score: 4, max_score: 5, feedback: 'A few comma splices in the conclusion — otherwise polished and readable.' },
  ],
  flagged_issues: [],
}

export function useFeedback(submissionId) {
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!submissionId) return
    api.get(`/api/submissions/feedback/${submissionId}`)
      .then(setFeedback)
      .catch((err) => {
        if (import.meta.env.DEV) setFeedback(SAMPLE)
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [submissionId])

  return { feedback, loading, error }
}
