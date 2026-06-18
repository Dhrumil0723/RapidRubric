import { Link } from 'react-router-dom'
import { useDashboard } from '../../features/instructor/hooks/useDashboard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const STAT_CARDS = [
  { key: 'total_submissions', label: 'Total submissions' },
  { key: 'pending_review', label: 'Pending TA review' },
  { key: 'released', label: 'Released' },
  { key: 'avg_score', label: 'Class avg. score', format: (v) => (v ? `${v}%` : '—') },
]

export default function InstructorDashboard() {
  const { stats, loading, error } = useDashboard()

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (error) return <Card><p className="text-sm text-danger-700">{error}</p></Card>

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Overview of grading progress across your course.</p>
        <div className="flex gap-3">
          <Link to="/instructor/rubrics/new"><Button>New Rubric</Button></Link>
          <Link to="/instructor/analytics"><Button variant="secondary">Analytics</Button></Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, format }) => (
          <Card key={key}>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900">
              {format ? format(stats?.[key]) : (stats?.[key] ?? '—')}
            </p>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <Card title="Quick links">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/instructor/rubrics/new" className="text-sm font-medium text-primary-600 hover:underline">Create a rubric</Link>
          <Link to="/instructor/analytics" className="text-sm font-medium text-primary-600 hover:underline">View analytics</Link>
        </div>
      </Card>
    </div>
  )
}
