import { useAnalytics } from '../../features/instructor/hooks/useAnalytics'
import Card from '../../components/ui/Card'

export default function Analytics() {
  const { data, loading, error } = useAnalytics()

  if (loading) return <p className="text-slate-500 text-sm">Loading analytics...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h1>

      {data?.weak_criteria?.length > 0 && (
        <Card title="Class-wide Weak Spots">
          <div className="space-y-3">
            {data.weak_criteria.map((c) => (
              <div key={c.criterion_id} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-primary-500"
                      style={{ width: `${(c.mean_score / c.max_score) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 shrink-0">
                  {c.mean_score.toFixed(1)} / {c.max_score}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data?.ai_summary && (
        <Card title="AI Summary">
          <p className="text-sm text-slate-700 leading-relaxed">{data.ai_summary}</p>
        </Card>
      )}

      {!data?.weak_criteria?.length && !data?.ai_summary && (
        <Card>
          <p className="text-slate-500 text-sm text-center py-8">
            Analytics will appear once submissions are graded and released.
          </p>
        </Card>
      )}
    </div>
  )
}
