function DashboardCard({ title, action, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-card ${className}`}>
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default DashboardCard
