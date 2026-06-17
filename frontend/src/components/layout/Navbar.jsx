import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ROLE_LABELS = {
  student: 'Student',
  ta: 'Teaching Assistant',
  instructor: 'Instructor',
}

const ROLE_COLORS = {
  student: 'bg-primary-100 text-primary-700',
  ta: 'bg-ta-100 text-ta-700',
  instructor: 'bg-instructor-100 text-instructor-700',
}

export default function Navbar() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-semibold text-primary-700 tracking-tight">
        RapidRubric
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[role]}`}>
            {ROLE_LABELS[role] ?? role}
          </span>
          <span className="text-sm text-slate-600">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
