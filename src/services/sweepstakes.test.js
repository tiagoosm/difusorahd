import { describe, it, expect, vi, beforeEach } from 'vitest'

const rpcMock = vi.fn()
vi.mock('./supabase', () => ({ supabase: { rpc: rpcMock } }))

const { registerSweepstakesParticipant, describeSweepstakesError } = await import('./sweepstakes')

describe('registerSweepstakesParticipant', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  it('calls the register_sweepstakes_participant RPC with correctly mapped fields', async () => {
    rpcMock.mockResolvedValue({ data: 'new-id', error: null })

    const { id, error } = await registerSweepstakesParticipant({
      fullName: 'Maria Silva',
      phone: '(35) 99999-8888',
      rg: 'MG-12.345.678',
      address: {
        street: 'Rua A',
        number: '100',
        complement: 'Apto 2',
        neighborhood: 'Centro',
        city: 'Pouso Alegre',
        state: 'MG',
        zipCode: '37550-000',
      },
      consentAccepted: true,
    })

    expect(rpcMock).toHaveBeenCalledWith('register_sweepstakes_participant', {
      p_full_name: 'Maria Silva',
      p_phone: '(35) 99999-8888',
      p_rg: 'MG-12.345.678',
      p_address_street: 'Rua A',
      p_address_number: '100',
      p_address_complement: 'Apto 2',
      p_address_neighborhood: 'Centro',
      p_address_city: 'Pouso Alegre',
      p_address_state: 'MG',
      p_address_zip_code: '37550-000',
      p_consent_accepted: true,
    })
    expect(id).toBe('new-id')
    expect(error).toBeNull()
  })

  it('sends null for empty optional fields instead of empty strings', async () => {
    rpcMock.mockResolvedValue({ data: 'new-id', error: null })

    await registerSweepstakesParticipant({
      fullName: 'Maria Silva',
      phone: '(35) 99999-8888',
      rg: '12.345.678',
      address: { street: 'Rua A', number: '100', neighborhood: 'Centro', city: 'PA', state: 'MG' },
      consentAccepted: true,
    })

    const [, payload] = rpcMock.mock.calls[0]
    expect(payload.p_address_complement).toBeNull()
    expect(payload.p_address_zip_code).toBeNull()
  })

  it('propagates the RPC error untouched (no data leaked in the success path)', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'Você já está cadastrado neste sorteio.' } })

    const { id, error } = await registerSweepstakesParticipant({
      fullName: 'Maria Silva',
      phone: '(35) 99999-8888',
      rg: '12.345.678',
      address: { street: 'Rua A', number: '100', neighborhood: 'Centro', city: 'PA', state: 'MG' },
      consentAccepted: true,
    })

    expect(id).toBeNull()
    expect(error.message).toBe('Você já está cadastrado neste sorteio.')
  })
})

describe('describeSweepstakesError', () => {
  it('forwards known, already-friendly messages from the database function as-is', () => {
    expect(describeSweepstakesError({ message: 'Você já está cadastrado neste sorteio.' })).toBe(
      'Você já está cadastrado neste sorteio.',
    )
    expect(describeSweepstakesError({ message: 'Informe um telefone válido.' })).toBe(
      'Informe um telefone válido.',
    )
  })

  // Regression: an unexpected/technical error (timeout, renamed column,
  // etc.) must never leak database text to the end user.
  it('falls back to a generic message for unexpected/technical errors', () => {
    expect(
      describeSweepstakesError({ message: 'relation "sweepstakes_participants" does not exist' }),
    ).toBe('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.')
    expect(describeSweepstakesError({})).toBe(
      'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.',
    )
  })
})
