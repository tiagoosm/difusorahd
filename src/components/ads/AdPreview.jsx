import { AD_POSITION_LABELS } from '../../utils/adPositions'

function AdPreview({ title, imageUrl, linkUrl, position }) {
  const height = AD_POSITION_LABELS[position]?.height ?? 'h-40'

  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400 ${height}`}
      >
        A prévia aparece aqui depois que você enviar uma imagem
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">
        Prévia {position && <span className="font-normal text-gray-400">(tamanho real do banner)</span>}
      </span>
      <a
        href={linkUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => !linkUrl && event.preventDefault()}
        className="block overflow-hidden rounded-xl border border-gray-200 transition-opacity hover:opacity-90"
      >
        <img src={imageUrl} alt={title || 'Prévia do anúncio'} className={`w-full object-cover ${height}`} />
      </a>
    </div>
  )
}

export default AdPreview
