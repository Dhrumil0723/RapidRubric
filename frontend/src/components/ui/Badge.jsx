const variants = {
  pending: 'bg-amber-100 text-amber-700',
  released: 'bg-green-100 text-green-700',
  draft: 'bg-slate-100 text-slate-600',
  info: 'bg-primary-100 text-primary-700',
}

export default function Badge({ status = 'draft', children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status]}`}>
      {children}
    </span>
  )
}
