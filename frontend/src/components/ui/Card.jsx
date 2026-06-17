export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}>
      {title && <h2 className="text-base font-semibold text-slate-900 mb-4">{title}</h2>}
      {children}
    </div>
  )
}
