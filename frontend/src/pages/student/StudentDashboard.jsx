import { Link } from 'react-router-dom'
import { useAssignments } from '../../features/student/hooks/useAssignments'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

export default function StudentDashboard() {
  const { assignments, loading, error } = useAssignments()

  if (loading) return <p className="text-slate-500 text-sm">Loading...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">My Assignments</h1>

      {assignments.length === 0 ? (
        <Card><p className="text-slate-500 text-sm text-center py-8">No open assignments right now.</p></Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{a.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">Due {new Date(a.due_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={a.submission_status ?? 'draft'}>{a.submission_status ?? 'Not submitted'}</Badge>
                <Link to={`/student/assignments/${a.id}/submit`} className="text-sm font-medium text-primary-600 hover:underline">
                  {a.submission_status ? 'Resubmit' : 'Submit'}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
