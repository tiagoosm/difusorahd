import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchSweepstakesParticipantById, updateSweepstakesParticipantStatus } from '../../../services/sweepstakes'
import { formatDate } from '../../../utils/formatDate'
import Modal from '../../ui/Modal'
import Select from '../../ui/Select'
import Spinner from '../../ui/Spinner'
import Badge from '../../ui/Badge'

const STATUS_OPTIONS = [
  { value: 'registered', label: 'Cadastrado' },
  { value: 'winner', label: 'Sorteado' },
  { value: 'disqualified', label: 'Desclassificado' },
]

const STATUS_TONE = { registered: 'gray', winner: 'green', disqualified: 'red' }

function formatAddress(participant) {
  const line1 = [participant.address_street, participant.address_number].filter(Boolean).join(', ')
  const line2 = participant.address_complement
  const line3 = [participant.address_neighborhood, participant.address_city, participant.address_state]
    .filter(Boolean)
    .join(' - ')
  const line4 = participant.address_zip_code ? `CEP ${participant.address_zip_code}` : null

  return [line1, line2, line3, line4].filter(Boolean)
}

// A participant's full detail (ID document, address, consent) — only
// loaded when the admin opens this modal, never along with the list (see
// LIST_FIELDS vs DETAIL_FIELDS in services/sweepstakes.js). Closes
// automatically whenever participantId becomes null again.
function ParticipantDetailModal({ participantId, onClose, onDeleteRequest, onStatusChanged }) {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isSavingStatus, setIsSavingStatus] = useState(false)

  useEffect(() => {
    if (!participantId) {
      setParticipant(null)
      return
    }

    let isMounted = true
    setLoading(true)

    fetchSweepstakesParticipantById(participantId).then(({ data, error }) => {
      if (!isMounted) return
      if (error || !data) {
        toast.error('Não foi possível carregar os dados deste participante.')
        onClose()
        return
      }
      setParticipant(data)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantId])

  async function handleStatusChange(event) {
    const nextStatus = event.target.value
    setIsSavingStatus(true)
    const { data, error } = await updateSweepstakesParticipantStatus(participantId, nextStatus)
    setIsSavingStatus(false)

    if (error) {
      toast.error('Não foi possível atualizar o status. Tente novamente.')
      return
    }

    setParticipant(data)
    toast.success('Status atualizado!')
    onStatusChanged?.()
  }

  return (
    <Modal isOpen={Boolean(participantId)} onClose={onClose} title="Detalhes do participante">
      {loading || !participant ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-lg font-semibold text-ink-900">{participant.full_name}</p>
            <p className="text-sm text-ink-500">{participant.phone}</p>
          </div>

          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="font-medium text-ink-500">RG</dt>
              <dd className="text-ink-900">{participant.rg}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-500">Endereço</dt>
              <dd className="text-ink-900">
                {formatAddress(participant).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink-500">Cadastrado em</dt>
              <dd className="text-ink-900">{formatDate(participant.created_at)}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-500">Consentimento (LGPD)</dt>
              <dd className="text-ink-900">
                {participant.consent_accepted ? (
                  <>Aceito em {formatDate(participant.consent_at)}</>
                ) : (
                  'Não registrado'
                )}
              </dd>
            </div>
          </dl>

          <div className="flex items-end justify-between gap-3 border-t border-ink-200 pt-4">
            <Select
              id="participant-status"
              label="Status"
              value={participant.status}
              onChange={handleStatusChange}
              disabled={isSavingStatus}
              className="w-44"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Badge tone={STATUS_TONE[participant.status] ?? 'gray'}>
              {STATUS_OPTIONS.find((option) => option.value === participant.status)?.label ?? participant.status}
            </Badge>
          </div>

          <button
            type="button"
            onClick={() => onDeleteRequest(participant)}
            className="flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Excluir participante
          </button>
        </div>
      )}
    </Modal>
  )
}

export default ParticipantDetailModal
