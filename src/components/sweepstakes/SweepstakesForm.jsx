import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { PartyPopper } from 'lucide-react'
import { registerSweepstakesParticipant, describeSweepstakesError } from '../../services/sweepstakes'
import { formatPhoneBR, formatCepBR, onlyDigits } from '../../utils/brMasks'
import { markRegisteredForSweepstakes } from '../../utils/sweepstakesStorage'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR',
  'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const EMPTY_VALUES = {
  fullName: '',
  phone: '',
  rg: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
  consentAccepted: false,
}

// Rules/privacy: the project doesn't have a Privacy Policy or Rules page
// yet (checked before implementing — see the task's report). The consent
// text below doesn't link to either of them until those pages exist, so
// as not to link to something that doesn't exist.
function SweepstakesForm({ onSuccess, privacyPolicyHref }) {
  const [protocolId, setProtocolId] = useState(null)
  const [formError, setFormError] = useState(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY_VALUES })

  async function handleFormSubmit(values) {
    setFormError(null)

    const { id, error } = await registerSweepstakesParticipant({
      fullName: values.fullName,
      phone: values.phone,
      rg: values.rg,
      address: {
        street: values.street,
        number: values.number,
        complement: values.complement,
        neighborhood: values.neighborhood,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
      },
      consentAccepted: values.consentAccepted,
    })

    if (error) {
      // Shown near the submit button (not a specific field error, e.g.
      // "already registered" or a network failure).
      setFormError(describeSweepstakesError(error))
      return
    }

    markRegisteredForSweepstakes()
    setProtocolId(id)
    onSuccess?.()
  }

  if (protocolId) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-card">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <PartyPopper className="h-7 w-7" />
        </span>
        <h2 className="text-xl font-bold text-ink-900">Cadastro realizado com sucesso!</h2>
        <p className="text-sm text-ink-600">Seu cadastro para o sorteio foi realizado. Boa sorte!</p>
        <p className="mt-1 text-xs text-ink-400">
          Protocolo: <span className="font-mono">{protocolId.slice(0, 8).toUpperCase()}</span>
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6"
    >
      <Input
        id="fullName"
        label="Nome completo"
        placeholder="Seu nome completo"
        autoComplete="name"
        inputMode="text"
        error={errors.fullName?.message}
        {...register('fullName', {
          required: 'Informe seu nome completo.',
          validate: (value) =>
            value.trim().split(/\s+/).filter(Boolean).length >= 2 || 'Informe seu nome completo.',
        })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="phone"
          control={control}
          rules={{
            required: 'Informe um telefone válido.',
            validate: (value) => {
              const digits = onlyDigits(value)
              return (digits.length === 10 || digits.length === 11) || 'Informe um telefone válido.'
            },
          }}
          render={({ field }) => (
            <Input
              id="phone"
              label="Telefone"
              placeholder="(35) 99999-9999"
              inputMode="tel"
              autoComplete="tel"
              error={errors.phone?.message}
              value={field.value}
              onChange={(event) => field.onChange(formatPhoneBR(event.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />

        <Input
          id="rg"
          label="RG"
          placeholder="MG-00.000.000"
          inputMode="text"
          error={errors.rg?.message}
          {...register('rg', {
            required: 'Informe seu RG.',
            validate: (value) => value.replace(/[^0-9A-Za-z]/g, '').length >= 5 || 'Informe um RG válido.',
          })}
        />
      </div>

      <Input
        id="street"
        label="Rua"
        placeholder="Nome da rua"
        autoComplete="address-line1"
        error={errors.street?.message}
        {...register('street', { required: 'Informe seu endereço.' })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
        <Input
          id="number"
          label="Número"
          placeholder="Nº"
          inputMode="numeric"
          error={errors.number?.message}
          {...register('number', { required: 'Informe o número.' })}
        />
        <Input
          id="complement"
          label="Complemento (opcional)"
          placeholder="Apto, bloco, referência..."
          {...register('complement')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="neighborhood"
          label="Bairro"
          placeholder="Seu bairro"
          error={errors.neighborhood?.message}
          {...register('neighborhood', { required: 'Informe o bairro.' })}
        />
        <Input
          id="city"
          label="Cidade"
          placeholder="Sua cidade"
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register('city', { required: 'Informe a cidade.' })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
        <Select
          id="state"
          label="Estado"
          error={errors.state?.message}
          {...register('state', { required: 'Selecione o estado.' })}
        >
          <option value="">Selecione...</option>
          {UF_OPTIONS.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </Select>

        <Controller
          name="zipCode"
          control={control}
          render={({ field }) => (
            <Input
              id="zipCode"
              label="CEP (opcional)"
              placeholder="00000-000"
              inputMode="numeric"
              value={field.value}
              onChange={(event) => field.onChange(formatCepBR(event.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-ink-100 pt-4">
        <label className="flex items-start gap-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-500/30"
            {...register('consentAccepted', {
              required: 'É necessário aceitar os termos para participar.',
            })}
          />
          <span>
            Li e concordo com o regulamento do sorteio e com o tratamento dos meus dados pessoais para
            as finalidades relacionadas à participação no sorteio.
            {privacyPolicyHref && (
              <>
                {' '}
                Veja nossa{' '}
                <a href={privacyPolicyHref} className="text-brand-600 underline hover:text-brand-700">
                  Política de Privacidade
                </a>
                .
              </>
            )}
          </span>
        </label>
        {errors.consentAccepted && (
          <span className="text-xs text-red-500">{errors.consentAccepted.message}</span>
        )}
      </div>

      {formError && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{formError}</p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full sm:w-fit">
        Confirmar cadastro
      </Button>
    </form>
  )
}

export default SweepstakesForm
