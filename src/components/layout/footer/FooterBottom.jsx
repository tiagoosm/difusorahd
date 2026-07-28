// TODO: preencher quando o crédito de desenvolvimento for definido.
const DEVELOPER_NAME = ''

function FooterBottom() {
  const year = new Date().getFullYear()

  return (
    <div className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-white/45 sm:flex-row">
        <p>
          &copy; {year} Fundação São José do Paraíso – Rádio Difusora HD. Todos os direitos
          reservados.
        </p>
        <p>Desenvolvido por {DEVELOPER_NAME || '—'}</p>
      </div>
    </div>
  )
}

export default FooterBottom
