import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../../features/auth/hooks/useLogin'
import Button from '../../components/ui/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const { login, loading, error } = useLogin()

  const handleSubmit = (e) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-card border border-slate-200 shadow-card p-8">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-6">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary-600 font-bold text-white">RR</span>
            <span className="text-xl font-semibold tracking-tight text-slate-900">RapidRubric</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in to your account</h1>
          <p className="text-sm text-slate-500 mb-6">AI-assisted rubric grading for writing courses.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full rounded-input border border-slate-300 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-input border border-slate-300 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                Remember me
              </label>
              <Link to="/login" className="text-sm font-medium text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="text-sm text-danger-700 bg-danger-100 rounded-md px-3 py-2">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">Sign in</Button>
          </form>

          <div className="my-6 border-t border-slate-200" />

          <Link to="/register" className="block">
            <Button variant="secondary" className="w-full">Join with enrollment code</Button>
          </Link>

          <p className="mt-6 text-xs text-center text-slate-400">
            Signs in via Supabase Auth — your role decides your view
          </p>
        </div>
      </div>
    </div>
  )
}
