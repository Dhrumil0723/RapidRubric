import { Link } from 'react-router-dom'
import { useQueue } from '../../features/ta/hooks/useQueue'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

export default function TADashboard() {
  const { pending, released, loading, error } = useQueue()

  if (loading) return <p className="text-slate-500 text-sm">Loading...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Review Queue</h1>
        <Badge status="pending">{pending.length} pending</Badge>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Awaiting Review</h2>
          {pending.map((s) => (
            <Card key={s.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 text-sm">{s.student_name}</p>
                <p className="text-sm text-slate-500">{s.assignment_title}</p>
              </div>
              <Link to={`/ta/review/${s.id}`} className="text-sm font-medium text-ta-600 hover:underline">Review →</Link>
            </Card>
          ))}
        </div>
      )}

      {released.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Released</h2>
          {released.map((s) => (
            <Card key={s.id} className="flex items-center justify-between opacity-60">
              <div>
                <p className="font-medium text-slate-900 text-sm">{s.student_name}</p>
                <p className="text-sm text-slate-500">{s.assignment_title}</p>
              </div>
              <Badge status="released">Released</Badge>
            </Card>
          ))}
        </div>
      )}

      {pending.length === 0 && released.length === 0 && (
        <Card><p className="text-slate-500 text-sm text-center py-8">Queue is empty.</p></Card>
      )}
    </div>
  )
}
