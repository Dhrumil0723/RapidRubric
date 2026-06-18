import { useQueue } from '../../features/ta/hooks/useQueue'
import Card from '../../components/ui/Card'
import SubmissionsTable from '../../components/ta/SubmissionsTable'

export default function TAReturned() {
  const { returned, loading, error } = useQueue()

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (error) return <Card><p className="text-sm text-danger-700">{error}</p></Card>

  return (
    <Card title="Returned to me">
      <p className="text-sm text-slate-500 -mt-2 mb-4">Submissions an instructor sent back for another look.</p>
      <SubmissionsTable rows={returned} emptyText="Nothing has been returned to you." />
    </Card>
  )
}
