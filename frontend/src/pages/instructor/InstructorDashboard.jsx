import { Link } from 'react-router-dom'
import { useDashboard } from '../../features/instructor/hooks/useDashboard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const STAT_CARDS = [
  { key: 'total_submissions', label: 'Total submissions' },
  { key: 'pending_review', label: 'Pending TA review' },
  { key: 'released', label: 'Released' },
  { key: 'avg_score', label: 'Class avg. score', format: (v) => v ? `${v}%` : '—' },
]

export default function InstructorDashboard() {
  const { stats, loading, error } = useDashboard()

  if (loading) return <p className="text-slate-500 text-sm">Loading...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Instructor Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/instructor/rubrics/new"><Button>New Rubric</Button></Link>
          <Link to="/instructor/analytics"><Button variant="secondary">Analytics</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, format }) => (
          <Card key={key}>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">
              {format ? format(stats?.[key]) : (stats?.[key] ?? '—')}
            </p>
          </Card>
        ))}
      </div>

      <Card title="Quick links">
        <div className="flex flex-wrap gap-3">
          <Link to="/instructor/rubrics" className="text-sm text-primary-600 hover:underline">Manage rubrics</Link>
          <Link to="/instructor/assignments" className="text-sm text-primary-600 hover:underline">Manage assignments</Link>
          <Link to="/instructor/analytics" className="text-sm text-primary-600 hover:underline">Analytics dashboard</Link>
        </div>
      </Card>
    </div>
  )
}
