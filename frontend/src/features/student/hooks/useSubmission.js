import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'

const MAX_FILE_MB = 10

export function useSubmission(assignmentId) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const validate = (file) => {
    if (!file) return 'Please select a PDF.'
    if (file.type !== 'application/pdf') return 'Only PDF files are accepted.'
    if (file.size > MAX_FILE_MB * 1024 * 1024) return `File must be under ${MAX_FILE_MB} MB.`
    return null
  }

  const submit = async ({ file, comments }) => {
    const validationError = validate(file)
    if (validationError) { setError(validationError); return }

    setError(null)
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('comments', comments)

    try {
      await api.postForm(`/api/submissions/${assignmentId}`, formData)
      navigate('/student')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error, MAX_FILE_MB }
}
