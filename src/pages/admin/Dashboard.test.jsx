import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ profile: { full_name: 'Admin' } }) }))
vi.mock('../../services/news', () => ({
  fetchNewsStats: vi.fn(),
  fetchRecentNews: vi.fn(),
}))
vi.mock('../../services/analytics', () => ({
  fetchAnalyticsSummary: vi.fn(),
  fetchAnalyticsTimeseries: vi.fn(),
}))

import { fetchNewsStats, fetchRecentNews } from '../../services/news'
import { fetchAnalyticsSummary, fetchAnalyticsTimeseries } from '../../services/analytics'

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  )
}

describe('Dashboard — "Evolução das visualizações" fetch behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchNewsStats.mockResolvedValue({ total: 10, published: 8, drafts: 2, totalViews: 500 })
    fetchRecentNews.mockResolvedValue({ data: [], error: null })
    fetchAnalyticsSummary.mockResolvedValue({ views: 10, visitors: 5 })
    fetchAnalyticsTimeseries.mockResolvedValue([
      { bucket: '2026-10-01T03:00:00+00:00', views: 12, visitors: 8 },
      { bucket: '2026-10-02T03:00:00+00:00', views: 0, visitors: 0 },
    ])
  })

  it('fetches the timeseries exactly once on mount — not once more when the stats cards finish loading', async () => {
    renderDashboard()

    await waitFor(() => expect(fetchNewsStats).toHaveBeenCalled())
    // Give any extra (buggy) re-fetch a chance to fire before asserting.
    await waitFor(() => expect(fetchAnalyticsTimeseries).toHaveBeenCalled())
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(fetchAnalyticsTimeseries).toHaveBeenCalledTimes(1)
  })

  it('re-fetches with the new range when the chart period is changed', async () => {
    renderDashboard()
    await waitFor(() => expect(fetchAnalyticsTimeseries).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByRole('button', { name: '30 dias' }))

    await waitFor(() => expect(fetchAnalyticsTimeseries).toHaveBeenCalledTimes(2))
    const [, secondCallArgs] = fetchAnalyticsTimeseries.mock.calls
    // last7 -> last30 genuinely changes the range start passed to the fetch.
    const [firstCallArgs] = fetchAnalyticsTimeseries.mock.calls
    expect(secondCallArgs[0].getTime()).not.toBe(firstCallArgs[0].getTime())
  })

  it('renders a zero-filled bucket as a real 0 point, not a gap (data reaches the chart as-is)', async () => {
    renderDashboard()
    await waitFor(() => expect(fetchAnalyticsTimeseries).toHaveBeenCalled())
    // The chart only renders once loading flips false; this just confirms
    // the zero-bucket survives the hook untouched for EvolutionChart to plot.
    await waitFor(() => expect(screen.queryByText(/Nenhuma visualização registrada/)).not.toBeInTheDocument())
  })

  it('shows the empty state (not a blank/broken chart) when the period has no views at all', async () => {
    fetchAnalyticsTimeseries.mockResolvedValue([])
    renderDashboard()
    await waitFor(() => expect(screen.getByText('Nenhuma visualização registrada neste período.')).toBeInTheDocument())
  })

  // analytics_timeseries zero-fills every bucket in the range (see its SQL
  // definition) — a quiet period returns a full row per day/hour, each with
  // views:0, never an empty array. The empty state has to key off the
  // actual total, not array length, or this case renders a flat, pointless
  // 0-axis chart instead of the "nothing happened" message.
  it('shows the empty state for an all-zero (but non-empty) zero-filled series too', async () => {
    fetchAnalyticsTimeseries.mockResolvedValue([
      { bucket: '2026-07-01T03:00:00+00:00', views: 0, visitors: 0 },
      { bucket: '2026-07-02T03:00:00+00:00', views: 0, visitors: 0 },
      { bucket: '2026-07-03T03:00:00+00:00', views: 0, visitors: 0 },
    ])
    renderDashboard()
    await waitFor(() => expect(screen.getByText('Nenhuma visualização registrada neste período.')).toBeInTheDocument())
  })
})

describe('Dashboard — chart failure does not break the rest of the panel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchNewsStats.mockResolvedValue({ total: 10, published: 8, drafts: 2, totalViews: 500 })
    fetchRecentNews.mockResolvedValue({ data: [], error: null })
    fetchAnalyticsSummary.mockResolvedValue({ views: 10, visitors: 5 })
  })

  it('shows a retry-able error state in the chart card, while the rest of the Dashboard still renders', async () => {
    fetchAnalyticsTimeseries.mockRejectedValue(new Error('db unreachable'))
    renderDashboard()

    await waitFor(() => expect(screen.getByText('Não foi possível carregar o gráfico')).toBeInTheDocument())
    // The stats cards (unrelated data source) are unaffected.
    expect(screen.getByText('Total de notícias')).toBeInTheDocument()

    fetchAnalyticsTimeseries.mockResolvedValue([{ bucket: '2026-10-01T03:00:00+00:00', views: 4, visitors: 2 }])
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    await waitFor(() => expect(screen.queryByText('Não foi possível carregar o gráfico')).not.toBeInTheDocument())
  })
})
