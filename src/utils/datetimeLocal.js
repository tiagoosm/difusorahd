// Converte um timestamp ISO (vindo do banco, em UTC) para o formato que o
// input <input type="datetime-local"> exige: "AAAA-MM-DDTHH:mm", em horário local.
export function toDatetimeLocalValue(isoString) {
  if (!isoString) return ''

  const date = new Date(isoString)
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
