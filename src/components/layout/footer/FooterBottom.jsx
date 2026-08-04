function FooterBottom() {
  const year = new Date().getFullYear()

  return (
    <div className="border-t border-white/15 bg-black/10">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-white/70">
        <p>
          &copy; {year} Fundação São José do Paraíso – Rádio Difusora HD. Todos os direitos
          reservados.
        </p>
      </div>
    </div>
  )
}

export default FooterBottom
