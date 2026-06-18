// Status chips — colours mirror the RapidRubric design system (Figma).
const variants = {
  released: 'bg-success-100 text-success-700',
  pending: 'bg-warning-100 text-warning-700',
  info: 'bg-info-100 text-info-700',
  overdue: 'bg-danger-100 text-danger-700',
  draft: 'bg-accent-100 text-accent-700',
  neutral: 'bg-slate-100 text-slate-600',
}

// Map raw backend statuses to a visual variant.
const STATUS_ALIAS = {
  pending_ta_review: 'pending',
  released: 'released',
  draft: 'draft',
  overdue: 'overdue',
  returned: 'overdue',
  active: 'released',
}

export default function Badge({ status = 'neutral', children, className = '' }) {
  const variant = variants[status] ?? variants[STATUS_ALIAS[status]] ?? variants.neutral
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variant} ${className}`}>
      {children}
    </span>
  )
}
