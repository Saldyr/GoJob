import type { Offre } from '../store/useStore'

interface LetterRequest {
  offre: Offre
  cvText: string
  competences: string[]
  nom: string
  endpoint: string
  modele: string
  cleApi: string
  titreMetier: string
  langue: string
}

/** Construit le prompt système pour la génération */
export function buildSystemPrompt(titreMetier: string, langue: string): string {
  const intitule = titreMetier || 'le métier visé'
  const langage = langue === 'es' ? 'espagnol (Amérique latine)' : 'français'
  return `Tu es un assistant spécialisé dans la rédaction de lettres de motivation pour ${intitule}.

Règles :
- Lettre personnalisée : adapte chaque phrase à l'offre spécifique et au profil réel du candidat.
- Naturelle en ${langage} : phrasé varié, ton humain et professionnel. Évite les formules génériques ("je suis passionné", "je souhaiterais mettre à profit mes compétences", "dynamique et motivé").
- Incorpore naturellement les mots-clés et compétences de l'offre (intitulé du poste, logiciels, certifications, domaines) pour passer les filtres ATS.
- N'invente jamais d'expériences, compétences ou diplômes absents du profil.
- Si le profil manque un prérequis clé de l'offre, ne mens pas — reformule en mettant en avant des compétences transférables.
- Format : 200-250 mots, 3 paragraphes — accroche (poste + entreprise), corps (compétences alignées), conclusion (confiance + demande d'entretien).
- Langue : ${langage} sauf si l'offre est dans une autre langue — dans ce cas, suis la langue de l'offre.
- Signature : "Cordialement, [Prénom]" (ne mets pas de nom si inconnu).
- Relis-toi : vérifie la cohérence entre ce que tu écris et le profil.`
}

/** Construit le prompt utilisateur à partir de l'offre et du profil */
export function buildUserPrompt(req: Pick<LetterRequest, 'offre' | 'nom' | 'competences' | 'cvText'>): string {
  return `Offre : ${req.offre.titre} chez ${req.offre.entreprise}
Description : ${req.offre.description || 'Non fournie'}
Source : ${req.offre.source}

Profil du candidat :
- Nom : ${req.nom || 'Candidat'}
- Compétences : ${req.competences.join(', ')}
- CV : ${req.cvText || 'Non fourni'}

Génère une lettre de motivation adaptée à cette offre.`
}

const MAP_HTTP_ERREUR: Record<number, string> = {
  400: 'Requête invalide — vérifie les paramètres.',
  401: 'Clé API invalide — vérifie dans Réglages.',
  403: 'Accès refusé — ta clé API n\'a pas les droits nécessaires.',
  404: 'Modèle ou endpoint introuvable — vérifie l\'URL.',
  429: 'Quota API dépassé — attends et réessaie, ou vérifie ton forfait.',
  500: 'Erreur serveur — le fournisseur a un souci.',
  502: 'Passage défaillant — réessaie dans quelques instants.',
  503: 'Service indisponible — maintenance ou surcharge.',
}

/**
 * Génère une lettre de motivation via IPC (Electron) ou fetch direct (dev web).
 * La clé, l'endpoint et le modèle viennent du store (Réglages), pas du bundle.
 */
export async function genererLettreMotivation(req: LetterRequest): Promise<{ ok: boolean; contenu?: string; erreur?: string }> {
  // Mode Electron : appel via IPC (processus principal = pas de CORS)
  const electronAPI = (window as unknown as { electronAPI?: { genererLettre: (params: unknown) => Promise<{ ok: boolean; contenu?: string; erreur?: string }> } }).electronAPI
  if (electronAPI?.genererLettre) {
    return electronAPI.genererLettre({
      offre: req.offre,
      cvText: req.cvText,
      competences: req.competences,
      nom: req.nom,
      endpoint: req.endpoint,
      modele: req.modele,
      cleApi: req.cleApi,
      titreMetier: req.titreMetier,
      langue: req.langue,
    })
  }

  // Fallback dev web : fetch direct
  if (!req.cleApi) {
    return { ok: false, erreur: 'Clé API non configurée. Va dans l\'onglet Réglages.' }
  }

  const systemPrompt = buildSystemPrompt(req.titreMetier, req.langue)
  const userPrompt = buildUserPrompt(req)

  const payload = {
    model: req.modele || 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  }

  try {
    const baseUrl = (req.endpoint || 'https://api.deepseek.com/v1').replace(/\/+$/, '')
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${req.cleApi}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      const message = MAP_HTTP_ERREUR[res.status] || `Erreur ${res.status} du fournisseur`
      console.error(`API error ${res.status}: ${errBody}`)
      return { ok: false, erreur: `${message} (code ${res.status})` }
    }

    const data = await res.json()
    const contenu = data?.choices?.[0]?.message?.content
    return { ok: true, contenu: contenu || 'Erreur de génération : réponse vide du fournisseur.' }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Erreur génération lettre:', msg)
    return { ok: false, erreur: msg }
  }
}

export function copierLettre(texte: string) {
  const electronAPI = (window as unknown as { electronAPI?: { copierPressePapier: (t: string) => boolean } }).electronAPI
  if (electronAPI?.copierPressePapier) {
    electronAPI.copierPressePapier(texte)
    return
  }
  // Fallback web
  navigator.clipboard.writeText(texte).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = texte
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}
