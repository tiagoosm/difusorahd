export const AD_POSITIONS = [
  { value: 'TOP_HOME', label: 'Topo da Home', description: 'Banner acima das notícias em destaque.' },
  {
    value: 'HOME_MIDDLE',
    label: 'Meio da Home',
    description: 'Banner entre Notícias em Destaque e Últimas Notícias.',
  },
  { value: 'ARTICLE_TOP', label: 'Topo da notícia', description: 'Banner logo abaixo do título da notícia.' },
  {
    value: 'ARTICLE_MIDDLE',
    label: 'Meio da notícia',
    description: 'Banner aproximadamente na metade do conteúdo.',
  },
  { value: 'ARTICLE_BOTTOM', label: 'Final da notícia', description: 'Banner no final da notícia.' },
  { value: 'SIDEBAR', label: 'Barra lateral', description: 'Banner lateral (para quando existir sidebar).' },
  { value: 'FOOTER', label: 'Rodapé', description: 'Banner antes do rodapé.' },
]

export const AD_POSITION_LABELS = Object.fromEntries(
  AD_POSITIONS.map((position) => [position.value, position]),
)
