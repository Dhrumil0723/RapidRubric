import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ROLE_LABELS = {
  student: 'Student',
  ta: 'Teaching Assistant',
  instructor: 'Instructor',
}

// Page heading shown in the top bar, keyed by route.
const PAGE_META = {
  '/student': { title: 'Assignments', subtitle: 'Open assignments — submit and resubmit' },
  '/student/feedback': { title: 'My Feedback', subtitle: 'Your released scores and comments' },
  '/student/versions': { title: 'Version History', subtitle: 'Draft-by-draft progress' },
  '/ta': { title: 'Review queue', subtitle: 'Submissions assigned to you' },
  '/ta/released': { title: 'Released', subtitle: "Feedback you've released to students" },
  '/ta/returned': { title: 'Returned to me', subtitle: 'Sent back by an instructor for another look' },
  '/instructor': { title: 'Dashboard', subtitle: 'Class overview and grading progress' },
  '/instructor/courses': { title: 'Courses', subtitle: 'Courses you own' },
  '/instructor/rubrics/new': { title: 'New Rubric', subtitle: 'Create a grading rubric' },
  '/instructor/analytics': { title: 'Analytics', subtitle: 'Class-wide performance' },
}

// Prefix matches for detail routes (e.g. /student/feedback/:id).
const PREFIX_META = [
  { prefix: '/student/feedback', meta: { title: 'My Feedback', subtitle: 'Released score and comments' } },
  { prefix: '/ta/review', meta: { title: 'Review submission', subtitle: 'AI draft — edit and release' } },
]

function metaFor(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname]
  const prefixed = PREFIX_META.find((p) => pathname.startsWith(p.prefix))
  if (prefixed) return prefixed.meta
  const last = pathname.split('/').filter(Boolean).pop() ?? 'Dashboard'
  return { title: last.charAt(0).toUpperCase() + last.slice(1), subtitle: '' }
}

function initials(user) {
  const name = user?.user_metadata?.name
  if (name) return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (user?.email?.[0] ?? 'U').toUpperCase()
}

export default function Topbar() {
  const { user, role, signOut } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { title, subtitle } = metaFor(pathname)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between gap-4">
      {/* Page heading */}
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-slate-900 leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 w-72 max-w-[40vw] rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-500 focus-within:ring-2 focus-within:ring-primary-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search submissions..."
            className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
            aria-label="Search submissions"
          />
        </div>

        {/* Filter / count */}
        <button
          type="button"
          className="relative grid place-items-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Filters"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-4 h-4 px-1 rounded-full bg-primary-600 text-[10px] font-semibold text-white">1</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative grid place-items-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-danger-600 ring-2 ring-white" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="grid place-items-center w-9 h-9 rounded-full bg-primary-600 text-sm font-semibold text-white"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {initials(user)}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 z-20 rounded-lg border border-slate-200 bg-white shadow-dropdown py-1">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.user_metadata?.name ?? 'Account'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <p className="text-xs text-primary-600 mt-0.5">{ROLE_LABELS[role] ?? role}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
