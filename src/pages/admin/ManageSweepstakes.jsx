import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Gift, Users, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSweepstakesParticipants } from '../../hooks/useSweepstakesParticipants'
import { useSweepstakesCount } from '../../hooks/useSweepstakesCount'
import { deleteSweepstakesParticipant, fetchAllSweepstakesParticipantsForExport } from '../../services/sweepstakes'
import { formatDate } from '../../utils/formatDate'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import SearchBar from '../../components/ui/SearchBar'
import StatsCard from '../../components/ui/StatsCard'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ParticipantDetailModal from '../../components/admin/sweepstakes/ParticipantDetailModal'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'registered', label: 'Cadastrado' },
  { value: 'winner', label: 'Sorteado' },
  { value: 'disqualified', label: 'Desclassificado' },
]

const STATUS_TONE = { registered: 'gray', winner: 'green', disqualified: 'red' }
const STATUS_LABEL = { registered: 'Cadastrado', winner: 'Sorteado', disqualified: 'Desclassificado' }

// Gera e baixa o CSV localmente, no navegador do admin — os dados nunca
// passam por um servidor nem ficam hospedados numa URL (ver
// fetchAllSweepstakesParticipantsForExport em services/sweepstakes.js).
function downloadParticipantsCsv(participants) {
  const headers = [
    'Nome completo',
    'Telefone',
    'RG',
    'Rua',
    'Número',
    'Complemento',
    'Bairro',
    'Cidade',
    'Estado',
    'CEP',
    'Status',
    'Data de cadastro',
  ]

  function csvEscape(value) {
    const text = String(value ?? '')
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  const rows = participants.map((participant) =>
    [
      participant.full_name,
      participant.phone,
      participant.rg,
      participant.address_street,
      participant.address_number,
      participant.address_complement,
      participant.address_neighborhood,
      participant.address_city,
      participant.address_state,
      participant.address_zip_code,
      STATUS_LABEL[participant.status] ?? participant.status,
      formatDate(participant.created_at),
    ]
      .map(csvEscape)
      .join(','),
  )

  const csvContent = [headers.join(','), ...rows].join('\n')
  // BOM (﻿): sem isso o Excel abre acentos em português quebrados.
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `sorteio-participantes-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function ManageSweepstakes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? ''
  const dateFrom = searchParams.get('from') ?? ''
  const dateTo = searchParams.get('to') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { participants, totalCount, pageSize, loading, error, reload } = useSweepstakesParticipants({
    search,
    status,
    dateFrom,
    dateTo,
    page,
  })
  const { count, loading: countLoading, reload: reloadCount } = useSweepstakesCount()
  const [selectedId, setSelectedId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  function updateFilters(next) {
    const params = { q: search, status, from: dateFrom, to: dateTo, page: String(page), ...next }
    const cleaned = Object.fromEntries(Object.entries(params).filter(([, value]) => value))
    setSearchParams(cleaned)
  }

  function handlePageChange(nextPage) {
    updateFilters({ page: nextPage === 1 ? undefined : String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete() {
    setIsDeleting(true)
    const { deleted, error: deleteError } = await deleteSweepstakesParticipant(deleteTarget.id)
    setIsDeleting(false)

    if (!deleted) {
      toast.error(deleteError?.message || 'Não foi possível excluir o participante.')
      setDeleteTarget(null)
      return
    }

    toast.success('Participante excluído com sucesso!')
    setDeleteTarget(null)
    setSelectedId(null)
    reload()
    reloadCount()
  }

  async function handleExport() {
    setIsExporting(true)
    const { data, error: exportError } = await fetchAllSweepstakesParticipantsForExport()
    setIsExporting(false)

    if (exportError) {
      toast.error('Não foi possível exportar os participantes. Tente novamente.')
      return
    }

    if (!data || data.length === 0) {
      toast.error('Não há participantes para exportar.')
      return
    }

    downloadParticipantsCsv(data)
    toast.success('Exportação concluída!')
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Gift className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold text-ink-900">Sorteio</h1>
        </div>
        <Button variant="secondary" onClick={handleExport} loading={isExporting} disabled={totalCount === 0}>
          <Download className="h-4 w-4" />
          Exportar participantes
        </Button>
      </div>

      <div className="max-w-xs">
        <StatsCard label="Participantes cadastrados" value={count} icon={Users} loading={countLoading} />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-card">
        <div className="w-full sm:max-w-md">
          <SearchBar
            defaultValue={search}
            placeholder="Buscar por nome, telefone ou RG..."
            onSearch={(value) => updateFilters({ q: value || undefined, page: undefined })}
          />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Status"
            value={status}
            onChange={(event) => updateFilters({ status: event.target.value || undefined, page: undefined })}
            className="w-full sm:w-48"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <div className="flex w-full flex-col gap-1.5 sm:w-auto">
            <span className="text-sm font-medium text-ink-700">Cadastrado de</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => updateFilters({ from: event.target.value || undefined, page: undefined })}
              className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:w-auto"
            />
          </div>

          <div className="flex w-full flex-col gap-1.5 sm:w-auto">
            <span className="text-sm font-medium text-ink-700">até</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => updateFilters({ to: event.target.value || undefined, page: undefined })}
              className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:w-auto"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState
          title="Não foi possível carregar os participantes"
          description="Tente novamente."
          onRetry={reload}
        />
      ) : participants.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Nenhum participante encontrado"
          description="Ajuste os filtros ou aguarde novos cadastros."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Nome completo</th>
                  <th className="px-5 py-3 font-medium">Telefone</th>
                  <th className="px-5 py-3 font-medium">Cidade</th>
                  <th className="px-5 py-3 font-medium">Cadastrado em</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {participants.map((participant) => (
                  <tr
                    key={participant.id}
                    onClick={() => setSelectedId(participant.id)}
                    className="cursor-pointer transition-colors hover:bg-ink-50"
                  >
                    <td className="px-5 py-3 font-medium text-ink-900">{participant.full_name}</td>
                    <td className="px-5 py-3 text-ink-500">{participant.phone}</td>
                    <td className="px-5 py-3 text-ink-500">{participant.address_city}</td>
                    <td className="px-5 py-3 text-ink-500">{formatDate(participant.created_at)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[participant.status] ?? 'gray'}>
                        {STATUS_LABEL[participant.status] ?? participant.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="text-sm text-ink-500">
              {totalCount} participante{totalCount === 1 ? '' : 's'} encontrado{totalCount === 1 ? '' : 's'}
            </span>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}

      <ParticipantDetailModal
        participantId={selectedId}
        onClose={() => setSelectedId(null)}
        onDeleteRequest={(participant) => setDeleteTarget(participant)}
        onStatusChanged={() => {
          reload()
          reloadCount()
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Excluir participante"
        description={
          <>
            Tem certeza que deseja excluir <strong>{deleteTarget?.full_name}</strong> do sorteio? Essa
            ação não pode ser desfeita.
          </>
        }
      />
    </div>
  )
}

export default ManageSweepstakes
