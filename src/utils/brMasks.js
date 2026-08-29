// Máscaras de telefone/CEP brasileiros — sem biblioteca, só formatação de
// texto conforme o usuário digita. Sempre progressivas (funcionam com
// qualquer quantidade parcial de dígitos, não só o valor final completo).

// (35) 99999-9999 (celular, 11 dígitos) ou (35) 9999-9999 (fixo, 10 dígitos).
export function formatPhoneBR(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''

  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)

  if (digits.length <= 2) return `(${ddd}`
  if (rest.length <= 4) return `(${ddd}) ${rest}`

  // Fixo (8 dígitos no corpo) vs celular (9 dígitos, primeiro é o 9): decide
  // pelo tamanho do que já foi digitado, não por um formato fixo.
  const splitAt = rest.length <= 8 ? 4 : 5
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`
}

// 00000-000
export function formatCepBR(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function onlyDigits(value) {
  return (value || '').replace(/\D/g, '')
}
