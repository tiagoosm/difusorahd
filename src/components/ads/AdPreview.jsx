function AdPreview({ title, imageUrl, linkUrl }) {
  if (!imageUrl) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400">
        A prévia aparece aqui depois que você enviar uma imagem
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">Prévia</span>
      <a
        href={linkUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => !linkUrl && event.preventDefault()}
        className="block overflow-hidden rounded-xl border border-gray-200 transition-opacity hover:opacity-90"
      >
        <img src={imageUrl} alt={title || 'Prévia do anúncio'} className="h-auto w-full object-cover" />
      </a>
    </div>
  )
}

export default AdPreview
