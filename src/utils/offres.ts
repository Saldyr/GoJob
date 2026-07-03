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

/** Libellé court d'ancienneté : « Aujourd'hui », « Hier », sinon « Nj ». */
export function ancienneteCourt(dateISO: string): string {
  const j = joursDepuis(dateISO)
  if (j <= 0) return "Aujourd'hui"
  if (j === 1) return 'Hier'
  return `${j}j`
}

/** Libellé long d'ancienneté : « Aujourd'hui », « Hier », « il y a N jours ». */
export function ancienneteLong(dateISO: string): string {
  const j = joursDepuis(dateISO)
  if (j <= 0) return "Aujourd'hui"
  if (j === 1) return 'Hier'
  return `il y a ${j} jours`
}

export type OrigineOffre = 'france-travail' | 'email' | 'plateforme' | 'manuel'

// Plateformes interrogées par API/connecteur (vs. reçues par alerte mail).
// L'ordre définit l'affichage des compteurs / boutons de filtre.
export const PLATEFORMES = ['Adzuna', 'Jooble', 'Reed', 'Careerjet', 'The Muse', 'Arbeitnow', 'Remotive', 'RemoteOK'] as const
export type Plateforme = (typeof PLATEFORMES)[number]

const PLATEFORMES_EN_LIGNE = PLATEFORMES.map((p) => p.toLowerCase())

/** Regroupe les sources d'une même plateforme (ex. "Adzuna FR/UK/ES/DE" → "Adzuna", "Reed UK" → "Reed"). */
export function familleSource(source: string): string {
  const s = source || 'Autre'
  if (/^adzuna/i.test(s)) return 'Adzuna'
  if (/^reed/i.test(s)) return 'Reed'
  if (/^jooble/i.test(s)) return 'Jooble'
  if (/^arbeitnow/i.test(s)) return 'Arbeitnow'
  if (/^remotive/i.test(s)) return 'Remotive'
  if (/^remoteok/i.test(s)) return 'RemoteOK'
  if (/^careerjet/i.test(s)) return 'Careerjet'
  if (/^the muse/i.test(s)) return 'The Muse'
  return s
}

/** Détermine l'origine d'une offre à partir de sa source. */
export function origineOffre(o: { source?: string }): OrigineOffre {
  const s = (o.source || '').toLowerCase()
  if (s.includes('france travail') || s.includes('francetravail') || s.includes('pôle emploi') || s.includes('pole emploi')) {
    return 'france-travail'
  }
  if (PLATEFORMES_EN_LIGNE.some((p) => s.includes(p))) return 'plateforme'
  if (s === '' || s.includes('manuel')) return 'manuel'
  return 'email'
}

// Canal de filtrage unifié : 'france-travail' | 'email' | 'manuel' | nom de plateforme ('Adzuna'…).
// Sert à la fois aux compteurs et aux boutons de filtre (Tableau de bord + Offres).
export type CanalOffre = 'tout' | 'france-travail' | 'email' | 'manuel' | Plateforme

/** Renvoie le canal d'une offre : son origine simple, ou le nom de sa plateforme. */
export function canalOffre(o: { source?: string }): Exclude<CanalOffre, 'tout'> {
  const orig = origineOffre(o)
  if (orig === 'plateforme') return familleSource(o.source || '') as Plateforme
  return orig
}

/** Flags d'activation d'une plateforme (issus des Réglages). */
export type ActivationPlateformes = {
  franceTravailEnabled: boolean
  imapEnabled: boolean
  adzunaEnabled: boolean
  joobleEnabled: boolean
  reedEnabled: boolean
  arbeitnowEnabled: boolean
  remotiveEnabled: boolean
  remoteokEnabled: boolean
  museEnabled: boolean
  careerjetEnabled: boolean
}

/** Un canal (plateforme) est-il actif d'après les Réglages ? ('manuel'/autres restent visibles). */
export function canalActif(canal: Exclude<CanalOffre, 'tout'>, s: ActivationPlateformes): boolean {
  switch (canal) {
    case 'france-travail': return s.franceTravailEnabled
    case 'email': return s.imapEnabled
    case 'Adzuna': return s.adzunaEnabled
    case 'Jooble': return s.joobleEnabled
    case 'Reed': return s.reedEnabled
    case 'Arbeitnow': return s.arbeitnowEnabled
    case 'Remotive': return s.remotiveEnabled
    case 'RemoteOK': return s.remoteokEnabled
    case 'Careerjet': return s.careerjetEnabled
    case 'The Muse': return s.museEnabled
    default: return true
  }
}

/** Une offre appartient-elle à une plateforme actuellement activée ? */
export function offreActive(o: { source?: string }, s: ActivationPlateformes): boolean {
  return canalActif(canalOffre(o), s)
}
