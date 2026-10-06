// Identifies a pasted video URL and derives how to embed it: YouTube/Vimeo
// links become an iframe (via their embed URL), anything else is assumed to
// be a direct video file URL and gets a plain <video> tag. No upload step —
// video stays off Supabase Storage entirely (see mediaNodes.jsx), so this is
// the only place that needs to understand video URL shapes.
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com']
const VIMEO_HOSTS = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']

function extractYoutubeId(url) {
  if (url.hostname === 'youtu.be') return url.pathname.slice(1)
  if (url.pathname === '/watch') return url.searchParams.get('v')
  if (url.pathname.startsWith('/embed/')) return url.pathname.split('/embed/')[1]
  if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/shorts/')[1]
  return null
}

function extractVimeoId(url) {
  const match = url.pathname.match(/\/(\d+)/)
  return match ? match[1] : null
}

export function parseVideoUrl(rawUrl) {
  let url
  try {
    url = new URL(rawUrl.trim())
  } catch {
    return { error: 'URL inválida.' }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { error: 'URL inválida.' }
  }

  if (YOUTUBE_HOSTS.includes(url.hostname)) {
    const id = extractYoutubeId(url)
    if (!id) return { error: 'Não foi possível identificar o vídeo do YouTube nessa URL.' }
    return { provider: 'youtube', url: rawUrl, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` }
  }

  if (VIMEO_HOSTS.includes(url.hostname)) {
    const id = extractVimeoId(url)
    if (!id) return { error: 'Não foi possível identificar o vídeo do Vimeo nessa URL.' }
    return { provider: 'vimeo', url: rawUrl, embedUrl: `https://player.vimeo.com/video/${id}` }
  }

  // Anything else: trust it's a direct, playable video file URL (mp4/webm/ogg
  // hosted elsewhere) and let the native <video> element validate it at
  // playback time — there's no reliable way to confirm that up front from a URL alone.
  return { provider: 'file', url: rawUrl, embedUrl: null }
}
