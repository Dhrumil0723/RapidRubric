import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'

// DEV preview data — shown only in `npm run dev` if the backend isn't reachable.
const SAMPLE = [
  { id: 'c1', name: 'CSCI 4177/5709 — Advanced Web Services', students: 48, tas: 3, enrollment_code: 'AWS-5709', status: 'active' },
  { id: 'c2', name: 'CSCI 2100 — Communication for CS', students: 61, tas: 4, enrollment_code: 'CC-2100', status: 'active' },
]

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/instructor/courses')
      .then(setCourses)
      .catch((err) => {
        if (import.meta.env.DEV) setCourses(SAMPLE)
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return { courses, loading, error }
}
