function EmptyState({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center">
      {Icon && <Icon className="h-10 w-10 text-gray-300" />}
      <p className="text-base font-medium text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  )
}

export default EmptyState
