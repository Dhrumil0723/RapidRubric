import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

// Placeholder sample — wire to a versions endpoint when the backend is ready.
const ASSIGNMENT = 'Essay 1 — Rhetorical Analysis'

const DRAFTS = [
  {
    n: 2,
    date: '2026-03-04',
    score: 42,
    max: 50,
    current: true,
    file_name: 'essay1_v2.pdf',
    file_size_mb: 2.4,
    file_url: '#',
    changes: [
      { criterion: 'Thesis & argument', delta: '+2', dir: 'improved', note: 'Sharper, now arguable' },
      { criterion: 'Use of evidence', delta: '+3', dir: 'improved', note: 'Added 2 sources' },
      { criterion: 'Citation accuracy', delta: '0', dir: 'unchanged', note: 'Same as before' },
      { criterion: 'Structure & flow', delta: '+1', dir: 'improved', note: 'Reordered §2 and §3' },
      { criterion: 'Grammar & style', delta: '-1', dir: 'worse', note: 'New splices in conclusion' },
    ],
  },
  { n: 1, date: '2026-02-20', score: 36, max: 50, current: false, file_name: 'essay1_v1.pdf', file_size_mb: 2.1, file_url: '#', changes: [] },
]

const DIR_BADGE = { improved: 'released', unchanged: 'neutral', worse: 'overdue' }

function fmt(date) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function VersionHistory() {
  return (
    <Card title={`Version history · ${ASSIGNMENT}`}>
      <div className="space-y-4">
        {DRAFTS.map((d) => (
          <div key={d.n} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary-50 text-primary-700 text-sm font-bold">
                  v{d.n}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">
                    Draft {d.n}{d.current && <span className="ml-2 text-xs font-medium text-primary-600">Latest</span>}
                  </p>
                  <p className="text-sm text-slate-500">
                    Submitted {fmt(d.date)}
                    {d.file_name && <><span className="text-slate-300"> · </span>{d.file_name}</>}
                    {d.file_size_mb != null && <span className="text-slate-400"> · {d.file_size_mb} MB</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <a
                  href={d.file_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                  title={`${d.file_name ?? 'Submitted PDF'}`}
                >
                  <span className="text-[10px] font-bold text-danger-700 bg-danger-100 rounded px-1.5 py-0.5">PDF</span>
                  View PDF
                </a>
                <span className="text-sm font-bold text-slate-900">{d.score} / {d.max}</span>
              </div>
            </div>

            {d.changes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Since your last draft</p>
                <ul className="space-y-2.5">
                  {d.changes.map((c) => (
                    <li key={c.criterion} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{c.criterion}</p>
                        <p className="text-xs text-slate-500">{c.note}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-slate-700 w-8 text-right">{c.delta}</span>
                        <Badge status={DIR_BADGE[c.dir]}>{c.dir}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
