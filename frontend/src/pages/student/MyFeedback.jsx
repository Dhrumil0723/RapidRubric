import { Link } from 'react-router-dom'
import { useMyFeedback } from '../../features/student/hooks/useMyFeedback'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const STATUS_LABELS = {
  pending_ta_review: 'In TA review',
  released: 'Released',
}

function PdfLink({ href, name, size }) {
  return (
    <a
      href={href || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      title={name ? `${name}${size ? ` · ${size} MB` : ''}` : 'View submitted PDF'}
    >
      <span className="text-[10px] font-bold text-danger-700 bg-danger-100 rounded px-1.5 py-0.5">PDF</span>
      View PDF
    </a>
  )
}

export default function MyFeedback() {
  const { submissions, loading, error } = useMyFeedback()

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (error) return <Card><p className="text-sm text-danger-700">{error}</p></Card>

  return (
    <Card title="My submissions & feedback">
      {submissions.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">Nothing here yet — your submissions and feedback show up once you turn work in.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const isReleased = s.status === 'released'
            const submitted = s.submitted_at
              ? new Date(s.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : null
            return (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{s.assignment_title}</p>
                  <p className="text-sm text-slate-500 mt-0.5 truncate">
                    {submitted ? `Submitted ${submitted}` : 'Submitted'}
                    {s.file_name && <span className="text-slate-300"> · </span>}
                    {s.file_name}
                    {s.file_size_mb != null && <span className="text-slate-400"> · {s.file_size_mb} MB</span>}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <PdfLink href={s.file_url} name={s.file_name} size={s.file_size_mb} />
                  {isReleased && <span className="text-sm font-bold text-slate-900">{s.total_score} / {s.max_score}</span>}
                  <Badge status={s.status === 'pending_ta_review' ? 'pending' : 'released'}>
                    {STATUS_LABELS[s.status] ?? s.status}
                  </Badge>
                  {isReleased ? (
                    <Link to={`/student/feedback/${s.id}`} className="text-sm font-medium text-primary-600 hover:underline">
                      View feedback
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-300 select-none">View feedback</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
