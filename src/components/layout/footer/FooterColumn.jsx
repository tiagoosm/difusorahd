function FooterColumn({ title, children, className = '' }) {
  return (
    <div className={className}>
      {title && (
        <h3 className="mb-5 text-xs font-semibold tracking-[0.15em] text-white/70 uppercase">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export default FooterColumn
