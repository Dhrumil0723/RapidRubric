import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ROLE_LABELS = {
  student: 'Student',
  ta: 'Teaching Assistant',
  instructor: 'Instructor',
}

// Only items with a `to` navigate; `soon` items are part of the design but not
// built yet, so they render inert (clicking would otherwise hit the catch-all
// route and bounce the user to /login).
const NAV = {
  student: [
    { label: 'Assignments', to: '/student', icon: 'clipboard', end: true },
    { label: 'My Feedback', to: '/student/feedback', icon: 'file' },
    { label: 'Version History', to: '/student/versions', icon: 'history' },
  ],
  ta: [
    { label: 'Review Queue', to: '/ta', icon: 'inbox', end: true },
    { label: 'Released', to: '/ta/released', icon: 'check' },
    { label: 'Returned to me', to: '/ta/returned', icon: 'history' },
    { label: 'Course', icon: 'list', soon: true },
  ],
  instructor: [
    { label: 'Dashboard', to: '/instructor', icon: 'grid', end: true },
    { label: 'Courses', to: '/instructor/courses', icon: 'book' },
    { label: 'Assignments', icon: 'clipboard', soon: true },
    { label: 'Rubric Builder', to: '/instructor/rubrics/new', icon: 'list' },
    { label: 'Analytics', to: '/instructor/analytics', icon: 'chart' },
    { label: 'Approvals', icon: 'check', soon: true },
    { label: 'TAs', icon: 'users', soon: true },
  ],
}

const ICONS = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  clipboard: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  history: 'M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8M12 7v5l4 2',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  check: 'M20 6 9 17l-5-5',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  chart: 'M3 3v18h18M18 17V9M13 17V5M8 17v-3',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
}

function NavIcon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

function initials(user) {
  const name = user?.user_metadata?.name
  if (name) return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (user?.email?.[0] ?? 'U').toUpperCase()
}

export default function Sidebar() {
  const { user, role } = useAuth()
  const items = NAV[role] ?? []

  const baseItem = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors'

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16">
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary-600 font-bold text-white">R</span>
        <span className="text-lg font-semibold tracking-tight">RapidRubric</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {items.map((item) =>
          item.soon ? (
            <div
              key={item.label}
              className={`${baseItem} text-sidebar-muted/70 cursor-default justify-between`}
              title="Coming soon"
            >
              <span className="flex items-center gap-3">
                <NavIcon name={item.icon} />
                {item.label}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-sidebar-muted/60">soon</span>
            </div>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${baseItem} ${isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-white'}`
              }
            >
              <NavIcon name={item.icon} />
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      {/* Course context (placeholder — no course API yet) */}
      <div className="px-3 pb-3">
        <div className="rounded-lg bg-sidebar-hover px-4 py-3">
          <p className="text-sm font-semibold text-white">ENGL 2100</p>
          <p className="text-xs text-sidebar-muted">Academic Writing · F25</p>
        </div>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-3 px-4 py-4 border-t border-white/10">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-primary-500 text-sm font-semibold text-white">
          {initials(user)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user?.user_metadata?.name ?? user?.email ?? 'Account'}
          </p>
          <p className="text-xs text-sidebar-muted">{ROLE_LABELS[role] ?? role}</p>
        </div>
      </div>
    </aside>
  )
}
