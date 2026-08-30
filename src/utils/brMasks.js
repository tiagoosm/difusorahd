// Brazilian phone/CEP (postal code) masks — no library, just text
// formatting as the user types. Always progressive (works with any partial
// number of digits, not only the final complete value).

// (35) 99999-9999 (mobile, 11 digits) or (35) 9999-9999 (landline, 10 digits).
export function formatPhoneBR(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''

  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)

  if (digits.length <= 2) return `(${ddd}`
  if (rest.length <= 4) return `(${ddd}) ${rest}`

  // Landline (8-digit body) vs mobile (9 digits, first one is the 9):
  // decided by how much has already been typed, not by a fixed format.
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
