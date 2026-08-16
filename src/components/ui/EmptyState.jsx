function EmptyState({ title, description, icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 px-6 py-16 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-50 text-ink-300">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-ink-800">{title}</p>
        {description && <p className="text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export default EmptyState
