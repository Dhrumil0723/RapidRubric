import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

const ROLE_REDIRECT = { instructor: '/instructor', ta: '/ta', student: '/student' }

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const login = async ({ email, password }) => {
    setError(null)
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const role = data.user?.user_metadata?.role
    navigate(ROLE_REDIRECT[role] ?? '/student')
  }

  return { login, loading, error }
}
