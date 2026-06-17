import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'

export function useReview(submissionId) {
  const [data, setData] = useState(null)
  const [criteria, setCriteria] = useState([])
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!submissionId) return
    api.get(`/api/ta/${submissionId}`)
      .then((res) => {
        setData(res)
        setCriteria(res.ai_feedback?.criteria?.map((c) => ({ ...c })) ?? [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [submissionId])

  const updateCriterion = (index, field, value) =>
    setCriteria((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))

  const release = async () => {
    setReleasing(true)
    try {
      await api.post(`/api/ta/${submissionId}/release`, { criteria })
      navigate('/ta')
    } catch (err) {
      setError(err.message)
      setReleasing(false)
    }
  }

  return { data, criteria, loading, releasing, error, updateCriterion, release }
}
