export function parseLienOffre(url: string): { titre?: string; entreprise?: string; source: string } {
  const source = detecterSource(url)

  // Extraction basique depuis l'URL — améliorable
  if (url.includes('linkedin.com')) {
    const match = url.match(/jobs\/view\/\d+\/?/)
    if (match) return { source: 'LinkedIn' }
    return { source: 'LinkedIn', titre: 'Offre LinkedIn' }
  }
  if (url.includes('indeed.')) {
    return { source: 'Indeed' }
  }
  if (url.includes('france-travail') || url.includes('pole-emploi')) {
    return { source: 'France Travail' }
  }
  if (url.includes('malt.')) {
    return { source: 'Malt' }
  }
  if (url.includes('welcometothejungle')) {
    return { source: 'WTTJ' }
  }
  if (url.includes('apec.')) {
    return { source: 'APEC' }
  }

  return { source }
}

function detecterSource(url: string): string {
  try {
    const hostname = new URL(url).hostname
    if (hostname.includes('linkedin')) return 'LinkedIn'
    if (hostname.includes('indeed')) return 'Indeed'
    if (hostname.includes('france-travail') || hostname.includes('pole-emploi')) return 'France Travail'
    if (hostname.includes('malt')) return 'Malt'
    if (hostname.includes('welcometothejungle')) return 'Welcome to the Jungle'
    if (hostname.includes('apec')) return 'APEC'
    if (hostname.includes('upwork')) return 'Upwork'
    if (hostname.includes('fiverr')) return 'Fiverr'
    if (hostname.includes('toptal')) return 'Toptal'
    if (hostname.includes('freelancer')) return 'Freelancer'
    if (hostname.includes('jeelo')) return 'Jeelo'
    if (hostname.includes('jobijoba')) return 'JobiJoba'
    return hostname
  } catch {
    return 'Manuel'
  }
}

export function joursDepuis(dateISO: string): number {
  const diff = Date.now() - new Date(dateISO).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
