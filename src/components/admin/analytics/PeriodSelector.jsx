import { PERIOD_OPTIONS } from '../../../utils/analyticsPeriods'
import Select from '../../ui/Select'

function PeriodSelector({ period, customFrom, customTo, onPeriodChange, onCustomRangeChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select
        value={period}
        onChange={(event) => onPeriodChange(event.target.value)}
        className="w-full sm:w-48"
        aria-label="Período de análise"
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {period === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            max={customTo || undefined}
            onChange={(event) => onCustomRangeChange({ from: event.target.value, to: customTo })}
            className="rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <span className="text-sm text-ink-500">até</span>
          <input
            type="date"
            value={customTo}
            min={customFrom || undefined}
            onChange={(event) => onCustomRangeChange({ from: customFrom, to: event.target.value })}
            className="rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      )}
    </div>
  )
}

export default PeriodSelector
