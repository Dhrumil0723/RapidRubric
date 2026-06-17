import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

export function useRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const register = async ({ email, password, role, name }) => {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate('/login')
  }

  return { register, loading, error }
}
