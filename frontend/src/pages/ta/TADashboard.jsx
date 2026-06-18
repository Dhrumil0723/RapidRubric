import { useQueue } from '../../features/ta/hooks/useQueue'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import SubmissionsTable from '../../components/ta/SubmissionsTable'

export default function TADashboard() {
  const { queue, pending, released, returned, avgAiScore, maxScore, loading, error } = useQueue()

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (error) return <Card><p className="text-sm text-danger-700">{error}</p></Card>

  const stats = [
    { label: 'Pending review', value: pending.length, color: 'text-warning-700' },
    { label: 'Released', value: released.length, color: 'text-success-700' },
    { label: 'Avg. AI score', value: avgAiScore != null ? `${avgAiScore} / ${maxScore}` : '—', color: 'text-primary-700' },
    { label: 'Returned', value: returned.length, color: 'text-danger-700' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="secondary">Filter</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-slate-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Queue table */}
      <Card>
        <SubmissionsTable rows={queue} emptyText="No submissions assigned to you yet." />
      </Card>
    </div>
  )
}
