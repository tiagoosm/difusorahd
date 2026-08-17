import { Smartphone, Monitor, Tablet, HelpCircle } from 'lucide-react'
import { formatNumber } from '../../../utils/formatNumber'

const DEVICE_META = {
  mobile: { label: 'Celular', icon: Smartphone },
  desktop: { label: 'Desktop', icon: Monitor },
  tablet: { label: 'Tablet', icon: Tablet },
}

function DeviceBreakdown({ byDevice, byOs, byBrowser, loading }) {
  if (loading) {
    return <div className="h-56 w-full animate-pulse rounded-lg bg-ink-100" />
  }

  const total = byDevice.reduce((sum, row) => sum + Number(row.views), 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        {['mobile', 'desktop', 'tablet'].map((key) => {
          const meta = DEVICE_META[key]
          const row = byDevice.find((item) => item.device_type === key)
          const views = row ? Number(row.views) : 0
          const pct = total > 0 ? ((views / total) * 100).toFixed(0) : 0
          const Icon = meta.icon

          return (
            <div key={key} className="flex flex-col items-center gap-1.5 rounded-lg border border-ink-200 p-4">
              <Icon className="h-5 w-5 text-brand-600" />
              <p className="text-lg font-semibold text-ink-900">{pct}%</p>
              <p className="text-xs text-ink-500">{meta.label}</p>
              <p className="text-[11px] text-ink-500">{formatNumber(views)}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-500 uppercase">
            <HelpCircle className="h-3.5 w-3.5" /> Sistema
          </p>
          <ul className="flex flex-col gap-1.5">
            {byOs.slice(0, 4).map((row) => (
              <li key={row.os} className="flex items-center justify-between text-ink-600">
                <span className="truncate">{row.os}</span>
                <span className="shrink-0 font-medium text-ink-900">{formatNumber(row.views)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-500 uppercase">
            <HelpCircle className="h-3.5 w-3.5" /> Navegador
          </p>
          <ul className="flex flex-col gap-1.5">
            {byBrowser.slice(0, 4).map((row) => (
              <li key={row.browser} className="flex items-center justify-between text-ink-600">
                <span className="truncate">{row.browser}</span>
                <span className="shrink-0 font-medium text-ink-900">{formatNumber(row.views)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DeviceBreakdown
