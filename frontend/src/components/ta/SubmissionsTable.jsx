import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'

const STATUS = {
  pending_ta_review: { label: 'Pending', badge: 'pending', action: 'Review' },
  released: { label: 'Released', badge: 'released', action: 'View' },
  returned: { label: 'Returned', badge: 'returned', action: 'Re-review' },
}

function initials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function SubmissionsTable({ rows, emptyText = 'Nothing here.' }) {
  if (!rows.length) {
    return <p className="text-slate-500 text-sm text-center py-10">{emptyText}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col className="w-[42%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
          <col className="w-[16%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="font-medium py-3 px-2">Student</th>
            <th className="font-medium py-3 px-2">AI score</th>
            <th className="font-medium py-3 px-2">Flags</th>
            <th className="font-medium py-3 px-2">Status</th>
            <th className="py-3 px-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const s = STATUS[r.status] ?? STATUS.pending_ta_review
            return (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid place-items-center w-9 h-9 rounded-full bg-primary-700 text-xs font-semibold text-white shrink-0">
                      {initials(r.student_name)}
                    </span>
                    <span className="font-medium text-slate-900 truncate">{r.student_name}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-slate-700 whitespace-nowrap">{r.ai_score} / {r.max_score}</td>
                <td className="py-3 px-2 whitespace-nowrap">
                  <span className={r.flags > 0 ? 'text-warning-700' : 'text-slate-400'}>
                    {r.flags} {r.flags === 1 ? 'flag' : 'flags'}
                  </span>
                </td>
                <td className="py-3 px-2"><Badge status={s.badge}>{s.label}</Badge></td>
                <td className="py-3 px-2 text-right">
                  <Link to={`/ta/review/${r.id}`} className="text-sm font-medium text-primary-600 hover:underline">
                    {s.action}
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
