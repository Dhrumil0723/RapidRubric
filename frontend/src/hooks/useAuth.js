import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── DEV-ONLY preview bypass ───────────────────────────────────────────────
// Lets you view role-gated pages without a real login while building the UI.
// Open one of these once, then navigate freely (the role sticks until sign out):
//   /student?devRole=student
//   /ta?devRole=ta
//   /instructor?devRole=instructor
// Disabled automatically in production builds (import.meta.env.DEV is false).
const DEV_ROLE_KEY = 'rr_dev_role'

function readDevRole() {
  if (!import.meta.env.DEV) return null
  const fromUrl = new URLSearchParams(window.location.search).get('devRole')
  if (fromUrl) localStorage.setItem(DEV_ROLE_KEY, fromUrl)
  return localStorage.getItem(DEV_ROLE_KEY)
}

function mockUser(role) {
  return { id: 'dev-user', email: `${role}@dev.local`, user_metadata: { role, name: `Dev ${role}` } }
}
// ──────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const devRole = readDevRole()
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(devRole ? mockUser(devRole) : null)
  const [role, setRole] = useState(devRole ?? null)
  const [loading, setLoading] = useState(!devRole)

  useEffect(() => {
    if (devRole) return // skip Supabase entirely in dev preview

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setRole(session?.user?.user_metadata?.role ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setRole(session?.user?.user_metadata?.role ?? null)
    })

    return () => subscription.unsubscribe()
  }, [devRole])

  const signOut = async () => {
    if (import.meta.env.DEV) localStorage.removeItem(DEV_ROLE_KEY)
    await supabase.auth.signOut()
  }

  return { session, user, role, loading, signOut }
}
