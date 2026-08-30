// `height` is a string of responsive Tailwind classes (mobile -> desktop),
// used by AdBanner/AdCarousel/AdPreview to keep the banner size consistent
// no matter the dimensions of the uploaded image. The lg: values match the
// requested examples (320/220/180px); the smaller ones scale proportionally
// for narrow screens.
export const AD_POSITIONS = [
  {
    value: 'TOP_HOME',
    label: 'Topo da Home',
    description: 'Banner acima das notícias em destaque.',
    height: 'h-[180px] sm:h-[240px] lg:h-[320px]',
  },
  {
    value: 'HOME_MIDDLE',
    label: 'Meio da Home',
    description: 'Banner entre Notícias em Destaque e Últimas Notícias.',
    height: 'h-[140px] sm:h-[180px] lg:h-[220px]',
  },
  {
    value: 'ARTICLE_TOP',
    label: 'Topo da notícia',
    description: 'Banner no topo da página da notícia.',
    height: 'h-[120px] sm:h-[150px] lg:h-[180px]',
  },
  {
    value: 'ARTICLE_BOTTOM',
    label: 'Final da notícia',
    description: 'Banner no final da notícia.',
    height: 'h-[120px] sm:h-[150px] lg:h-[180px]',
  },
  {
    value: 'FOOTER',
    label: 'Rodapé',
    description: 'Banner antes do rodapé.',
    height: 'h-[100px] sm:h-[130px] lg:h-[160px]',
  },
]

export const AD_POSITION_LABELS = Object.fromEntries(
  AD_POSITIONS.map((position) => [position.value, position]),
)
