import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'

const emptyCriterion = () => ({ id: crypto.randomUUID(), name: '', description: '', max_score: 10 })

export function useRubric() {
  const [title, setTitle] = useState('')
  const [criteria, setCriteria] = useState([emptyCriterion()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const addCriterion = () => setCriteria((prev) => [...prev, emptyCriterion()])
  const removeCriterion = (id) => setCriteria((prev) => prev.filter((c) => c.id !== id))
  const updateCriterion = (id, field, value) =>
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))

  const save = async () => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/rubrics', { title, criteria })
      navigate('/instructor')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const totalPoints = criteria.reduce((sum, c) => sum + Number(c.max_score || 0), 0)

  return { title, setTitle, criteria, addCriterion, removeCriterion, updateCriterion, save, loading, error, totalPoints }
}
