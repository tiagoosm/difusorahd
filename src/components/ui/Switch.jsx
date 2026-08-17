function Switch({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex w-fit cursor-pointer select-none items-center gap-3">
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-ink-300 transition-colors peer-checked:bg-brand-600" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      {label && <span className="text-sm font-medium text-ink-700">{label}</span>}
    </label>
  )
}

export default Switch
