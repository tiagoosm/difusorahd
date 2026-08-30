// Converts an ISO timestamp (coming from the database, in UTC) to the
// format an <input type="datetime-local"> expects: "YYYY-MM-DDTHH:mm", in local time.
export function toDatetimeLocalValue(isoString) {
  if (!isoString) return ''

  const date = new Date(isoString)
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
