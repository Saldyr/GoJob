import { useState } from 'react'
import { useStore, type Offre } from '../store/useStore'
import { Briefcase, ExternalLink, MapPin, Clock, Building2, Globe, X, Mail } from 'lucide-react'
import { Bouton } from './ui/Bouton'
import { joursDepuis, canalOffre, PLATEFORMES, type CanalOffre } from '../utils/offres'
import PageHeader from './ui/PageHeader'
import { useT } from '../i18n/useT'


const TYPES_CONTRAT: { val: string; label: string }[] = [
  { val: 'cdi', label: 'CDI' },
  { val: 'cdd', label: 'CDD' },
  { val: 'freelance', label: 'Freelance' },
  { val: 'stage', label: 'Stage' },
  { val: 'alternance', label: 'Alternance' },
  { val: 'interim', label: 'Intérim' },
]

function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/)
  if (mots.length >= 2) return (mots[0][0] + mots[1][0]).toUpperCase()
  return nom.slice(0, 2).toUpperCase()
}

const PALETTE = [
  'bg-action/15 text-action', 'bg-electric/15 text-electric',
  'bg-rose/15 text-rose', 'bg-vert/15 text-vert',
  'bg-orange-500/15 text-orange-400', 'bg-cyan-500/15 text-cyan-400',
]

function couleurEntreprise(nom: string): string {
  let hash = 0
  for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export default function OngletOffres() {
  const offres = useStore((s) => s.offres)
  const storeMotsCles = useStore((s) => s.searchMotsCles)
  const setStoreMotsCles = useStore((s) => s.setSearchMotsCles)
  const filtreCanal = useStore((s) => s.offresFiltre)
  const setFiltreCanal = useStore((s) => s.setOffresFiltre)
  const { t } = useT()
  const getContratLabel = (type: string) => t(`offers.contractLabels.${type}`)

  const [recherche] = useState('')
  const [motsCles, setMotsCles] = useState<string[]>(storeMotsCles)
  const [saisieMotCle, setSaisieMotCle] = useState('')
  const [filtreContrat, setFiltreContrat] = useState<string[]>([])
  const [filtreRemote, setFiltreRemote] = useState(false)
  const [filtreSource, setFiltreSource] = useState('')
  const [filtreLocalisation, setFiltreLocalisation] = useState<string[]>([])
  const [saisieVille, setSaisieVille] = useState('')
  const [triDate, setTriDate] = useState<'nouveau' | 'ancien'>('nouveau')
  const [page, setPage] = useState(1)
  const [ftChargement, setFtChargement] = useState(false)
  const [message, setMessage] = useState<{ texte: string; type: 'ok' | 'info' | 'err' } | null>(null)
  const OFFRES_PAR_PAGE = 30

  const ajouterMotCle = () => {
    if (saisieMotCle.trim() && !motsCles.includes(saisieMotCle.trim().toLowerCase())) {
      const nouveau = [...motsCles, saisieMotCle.trim().toLowerCase()]
      setMotsCles(nouveau)
      setStoreMotsCles(nouveau)
    }
    setSaisieMotCle('')
  }

  const ajouterVille = () => {
    if (saisieVille.trim() && !filtreLocalisation.includes(saisieVille.trim())) {
      setFiltreLocalisation([...filtreLocalisation, saisieVille.trim()])
    }
    setSaisieVille('')
  }

  // Recherche en ligne : interroge France Travail ET Adzuna avec les mots-clés.
  const lancerRecherche = async () => {
    setMessage(null)
    setFtChargement(true)
    const s = useStore.getState().settings
    const requete = motsCles.join(' ').trim() || recherche.trim() || 'architecte'
    const loc = filtreLocalisation[0] || ''
    const urlsExistantes = new Set(useStore.getState().offres.map((o) => o.url).filter(Boolean))
    const erreurs: string[] = []
    let ajoutees = 0

    const ajouter = (liste: Offre[]) => {
      for (const o of liste || []) {
        if (o.url && urlsExistantes.has(o.url)) continue
        if (o.url) urlsExistantes.add(o.url)
        useStore.getState().addOffre(o)
        ajoutees++
      }
    }

    // France Travail
    if (s.franceTravailClientId && s.franceTravailClientSecret && window.electronAPI?.franceTravailOffres) {
      try {
        const r = await window.electronAPI.franceTravailOffres({ motsCles: requete, localisation: loc })
        if (r.ok) ajouter(r.offres || [])
        else if (r.erreur) erreurs.push('France Travail : ' + r.erreur)
      } catch (e) {
        erreurs.push('France Travail : ' + (e instanceof Error ? e.message : String(e)))
      }
    }

    // Plateformes en ligne (Adzuna, Jooble, Reed)
    if (window.electronAPI?.chercherEnLigne) {
      try {
        const r = await window.electronAPI.chercherEnLigne({
          motsCles: requete, localisation: loc,
          adzunaAppId: s.adzunaAppId, adzunaAppKey: s.adzunaAppKey,
          joobleKey: s.joobleKey, reedKey: s.reedKey,
        })
        if (r.ok) ajouter(r.offres || [])
        if (r.erreurs?.length) erreurs.push(...r.erreurs)
      } catch (e) {
        erreurs.push('Plateformes : ' + (e instanceof Error ? e.message : String(e)))
      }
    }

    if (ajoutees > 0) {
      if (motsCles.length === 0 && requete) { setMotsCles([requete]); setStoreMotsCles([requete]) }
      setMessage({ texte: `${ajoutees} nouvelle${ajoutees > 1 ? 's' : ''} offre${ajoutees > 1 ? 's' : ''} pour « ${requete} »`, type: 'ok' })
      setTimeout(() => setMessage(null), 4000)
    } else if (!s.franceTravailClientId && !s.adzunaAppId && !s.joobleKey && !s.reedKey) {
      setMessage({ texte: 'Configure tes sources dans Réglages (France Travail, Adzuna, Jooble, Reed) pour de meilleurs résultats.', type: 'info' })
    } else if (erreurs.length) {
      setMessage({ texte: erreurs[0], type: 'err' })
    } else {
      setMessage({ texte: `Aucune nouvelle offre trouvée pour « ${requete} ».`, type: 'info' })
    }
    setFtChargement(false)
  }

  const sources = [...new Set(offres.map((o) => o.source).filter(Boolean))] as string[]
  const countCanal = (v: CanalOffre) =>
    v === 'tout' ? offres.length : offres.filter((o) => canalOffre(o) === v).length

  // Boutons de filtre : origines + une entrée par plateforme configurable.
  const CANAUX: { val: CanalOffre; label: string; icon: React.ReactNode }[] = [
    { val: 'tout', label: 'Toutes', icon: <Briefcase className="w-4 h-4" /> },
    { val: 'france-travail', label: 'France Travail', icon: <Building2 className="w-4 h-4" /> },
    { val: 'email', label: 'Boîte mail', icon: <Mail className="w-4 h-4" /> },
    ...PLATEFORMES.map((p) => ({ val: p as CanalOffre, label: p, icon: <Globe className="w-4 h-4" /> })),
  ]

  const filtrees = offres
    .filter((o) => {
      if (filtreCanal !== 'tout' && canalOffre(o) !== filtreCanal) return false
      if (recherche) {
        const q = recherche.toLowerCase()
        if (!o.titre.toLowerCase().includes(q) && !o.entreprise.toLowerCase().includes(q)) return false
      }
      if (storeMotsCles.length > 0 && !storeMotsCles.some(m => o.titre.toLowerCase().includes(m))) return false
      if (filtreContrat.length > 0 && (!o.typeContrat || !filtreContrat.includes(o.typeContrat))) return false
      if (filtreRemote && !o.remote) return false
      if (filtreSource && o.source !== filtreSource) return false
      if (filtreLocalisation.length > 0 && o.ville) {
        const v = o.ville.toLowerCase()
        if (!filtreLocalisation.some(city => v.includes(city.toLowerCase()))) return false
      }
      return true
    })
    .sort((a, b) => {
      if (triDate === 'nouveau') return new Date(b.dateAjout).getTime() - new Date(a.dateAjout).getTime()
      return new Date(a.dateAjout).getTime() - new Date(b.dateAjout).getTime()
    })

  const nbFiltresActifs = [...motsCles, ...filtreContrat, filtreSource, ...filtreLocalisation, filtreRemote ? 'remote' : ''].filter(Boolean).length

  const totalPages = Math.max(1, Math.ceil(filtrees.length / OFFRES_PAR_PAGE))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * OFFRES_PAR_PAGE
  const affichees = filtrees.slice(debut, debut + OFFRES_PAR_PAGE)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <PageHeader
        icon={<Briefcase className="w-5 h-5 text-white" />}
        title={t('offers.title')}
        subtitle={t('offers.withCount', { count: offres.length })}
        actions={<div />}
      />

      {/* Filtre par canal : France Travail / Boîte mail / Adzuna / Jooble / Reed */}
      <div className="flex flex-wrap gap-2">
        {CANAUX.map(({ val, label, icon }) => (
          <button key={val} onClick={() => { setFiltreCanal(val); setPage(1) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filtreCanal === val
                ? 'bg-action text-white shadow-sm'
                : 'bg-surface-2 text-text-dim hover:text-text border border-bordure'
            }`}>
            {icon}{label} ({countCanal(val)})
          </button>
        ))}
      </div>

      {/* Barre de filtres (toujours visible) */}
      <div className="rounded-2xl border border-bordure bg-surface-2 p-2.5 md:p-3 space-y-2.5 md:space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
          {/* Mots-clés */}
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-text-muted mb-1 block">Mots-clés</label>
            <div className="flex gap-1">
              <input value={saisieMotCle} onChange={(e) => setSaisieMotCle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterMotCle() } }}
                placeholder="Architecte, BIM..."
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-bordure bg-surface text-text text-xs placeholder:text-text-muted/60 focus:border-action focus:ring-1 focus:ring-action/30" />
              <button type="button" onClick={ajouterMotCle}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-action/15 text-action border border-action/20 text-xs font-medium hover:bg-action/25 transition-all">+</button>
            </div>
          </div>

          {/* Source + Localisation sur mobile : empilés */}
          <div className="sm:col-span-1">
            <label className="text-xs font-medium text-text-muted mb-1 block">Source</label>
            <select value={filtreSource} onChange={(e) => setFiltreSource(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-bordure bg-surface text-text text-xs focus:border-action focus:ring-1 focus:ring-action/30">
              <option value="">Toutes</option>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Localisation */}
          <div className="sm:col-span-1">
            <label className="text-xs font-medium text-text-muted mb-1 block">Localisation</label>
            <div className="flex flex-wrap gap-1 mb-1">
              {filtreLocalisation.map(v => (
                <button key={v} onClick={() => setFiltreLocalisation(filtreLocalisation.filter(x => x !== v))}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-surface-3 text-text-dim border border-bordure hover:bg-surface-3/80 transition-all">
                  {v} <X className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <input value={saisieVille} onChange={(e) => setSaisieVille(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterVille() } }}
                placeholder="Ville"
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-bordure bg-surface text-text text-xs placeholder:text-text-muted/60 focus:border-action focus:ring-1 focus:ring-action/30" />
              <button type="button" onClick={ajouterVille}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-action/15 text-action border border-action/20 text-xs font-medium hover:bg-action/25 transition-all">+</button>
            </div>
          </div>
        </div>

        {/* Deuxième ligne : contrat + remote + tri + recherche */}
        <div className="flex flex-wrap items-end gap-2 md:gap-3">
          <div className="w-full sm:w-auto">
            <label className="text-xs font-medium text-text-muted mb-1 block">Type contrat</label>
            <div className="flex flex-wrap gap-1">
              {TYPES_CONTRAT.map(t => (
                <label key={t.val} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium cursor-pointer border transition-all ${
                  filtreContrat.includes(t.val) ? 'bg-action/15 text-action border-action/30' : 'bg-surface-glass-2 text-text-muted border-border-glass hover:border-action/40 hover:text-text'
                }`}>
                  <input type="checkbox" checked={filtreContrat.includes(t.val)}
                    onChange={(e) => {
                      if (e.target.checked) setFiltreContrat([...filtreContrat, t.val])
                      else setFiltreContrat(filtreContrat.filter(v => v !== t.val))
                    }}
                    className="sr-only" />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-text-dim cursor-pointer pb-1">
            <input type="checkbox" checked={filtreRemote} onChange={(e) => setFiltreRemote(e.target.checked)}
              className="rounded border-bordure bg-surface text-action focus:ring-action/30" />
            Remote
          </label>

          <div>
            <label className="text-xs font-medium text-text-muted mb-1 block">Tri</label>
            <select value={triDate} onChange={(e) => setTriDate(e.target.value as 'nouveau' | 'ancien')}
              className="px-2 py-1.5 rounded-lg border border-bordure bg-surface text-text text-xs focus:border-action focus:ring-1 focus:ring-action/30">
              <option value="nouveau">+ récentes</option>
              <option value="ancien">+ anciennes</option>
            </select>
          </div>

          <div className="w-full sm:w-auto sm:ml-auto pt-1 sm:pt-0">
            <Bouton variant="primaire" onClick={lancerRecherche} disabled={ftChargement} className="w-full sm:w-auto justify-center text-xs sm:text-sm py-1.5">
              {ftChargement ? 'Recherche...' : '🔍 Rechercher'}
            </Bouton>
          </div>
        </div>
      </div>

      {/* Suppression de la barre recherche locale — le panneau filtres fait déjà le job */}


      {/* Résumé des filtres actifs */}
      {nbFiltresActifs > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-dim">
          <span className="text-text-muted">Filtres :</span>
          {motsCles.map(m => (
            <button key={m} onClick={() => { const nouveau = motsCles.filter(x => x !== m); setMotsCles(nouveau); setStoreMotsCles(nouveau) }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-action/10 border border-action/20 text-action hover:bg-action/20 transition-all">
              {m} <X className="w-3 h-3" />
            </button>
          ))}
          {filtreContrat.map(c => (
            <button key={c} onClick={() => setFiltreContrat(filtreContrat.filter(v => v !== c))}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-action/10 border border-action/20 text-action hover:bg-action/20 transition-all">
              {TYPES_CONTRAT.find(t => t.val === c)?.label || c} <X className="w-3 h-3" />
            </button>
          ))}
          {filtreSource && (
            <button onClick={() => setFiltreSource('')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-electric/10 border border-electric/20 text-electric hover:bg-electric/20 transition-all">
              {filtreSource} <X className="w-3 h-3" />
            </button>
          )}
          {filtreRemote && (
            <button onClick={() => setFiltreRemote(false)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-vert/10 border border-vert/20 text-vert hover:bg-vert/20 transition-all">
              Remote <X className="w-3 h-3" />
            </button>
          )}
          {filtreLocalisation.map(v => (
            <button key={v} onClick={() => setFiltreLocalisation(filtreLocalisation.filter(x => x !== v))}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-3 border border-bordure text-text-dim hover:bg-surface-3/80 transition-all">
              {v} <X className="w-3 h-3" />
            </button>
          ))}
          <button onClick={() => { setMotsCles([]); setStoreMotsCles([]); setFiltreContrat([]); setFiltreSource(''); setFiltreRemote(false); setFiltreLocalisation([]); setTriDate('nouveau') }}
            className="text-action hover:underline ml-1">Tout effacer</button>
        </div>
      )}

      {/* Message de recherche (succès / info / erreur) */}
      {message && (
        <div className={`rounded-xl border p-3 text-sm ${
          message.type === 'ok' ? 'border-vert/30 bg-vert/10 text-vert'
          : message.type === 'info' ? 'border-electric/30 bg-electric/10 text-electric'
          : 'border-rouge-error/30 bg-rouge-error/10 text-rouge-error'
        }`}>
          {message.texte}
          <button onClick={() => setMessage(null)} className="ml-2 underline">OK</button>
        </div>
      )}
      {offres.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-text-muted text-sm">
            {filtrees.length} offre{filtrees.length > 1 ? 's' : ''} sur {offres.length}
            {totalPages > 1 && ` — page ${pageCourante}/${totalPages}`}
          </p>
        </div>
      )}

      {/* Liste offres */}
      {filtrees.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-dim text-lg font-medium mb-1">{offres.length === 0 ? t('offers.empty') : t('offers.noResults')}</p>
          {offres.length > 0 ? (
            <p className="text-text-muted text-sm mb-6">Aucune offre ne correspond aux filtres sélectionnés. Modifie tes filtres ou essaie d'autres mots-clés.</p>
          ) : (
            <p className="text-text-muted text-sm mb-6">Importe des offres depuis le Tableau de bord ou lance une recherche.</p>
          )}
          <Bouton variant="primaire" onClick={() => {
            const s = useStore.getState().settings;
            if (s.franceTravailClientId || s.adzunaAppId) {
              const el = document.querySelector('[data-tab="offres"] input');
              if (el instanceof HTMLInputElement) el.focus();
            }
          }}>🔍 Lancer une recherche</Bouton>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {affichees.map((offre) => (
              <div key={offre.id} className="rounded-2xl border border-bordure bg-surface-2 p-6 shadow-sm card-hover cursor-pointer"
                onClick={() => offre.url && window.electronAPI?.openUrl?.(offre.url)}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-base ${couleurEntreprise(offre.entreprise)}`}>
                        {initiales(offre.entreprise)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-lg leading-tight">{offre.titre}</h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-text-dim text-sm flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" /> {offre.entreprise}
                          </p>
                          {offre.ville && (
                            <span className="text-text-muted text-sm flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5" /> {offre.ville}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {offre.typeContrat && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-action/10 text-action border border-action/20">
                          {getContratLabel(offre.typeContrat)}
                        </span>
                      )}
                      {offre.remote && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-electric/10 text-electric border border-electric/20">
                          <Globe className="w-3 h-3" /> Remote
                        </span>
                      )}
                      {offre.salaire && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-surface-3 text-text-dim border border-bordure">{offre.salaire}</span>
                      )}
                      {offre.tags?.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-surface-3 text-text-dim border border-bordure">{tag}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-muted">
                      {offre.dateAjout && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> il y a {joursDepuis(offre.dateAjout)} jours</span>
                      )}
                      {offre.source && <span className="text-text-muted/70">· {offre.source}</span>}
                      {offre.url && (
                        <a href={offre.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-action hover:text-action-vif ml-auto" onClick={(e) => { e.stopPropagation(); window.electronAPI?.openUrl?.(offre.url) }}>
                          <ExternalLink className="w-3.5 h-3.5" /> {t('offers.viewOffer')}
                        </a>
                      )}
                    </div>
                    {offre.notes && <p className="text-text-dim text-sm mt-3 bg-surface-3 rounded-lg p-3 border border-bordure/50">{offre.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, pageCourante - 1))} disabled={pageCourante <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-bordure bg-surface-2 text-text-dim hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">←</button>
              {Array.from({ length: Math.min(totalPages, 50) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === pageCourante ? 'bg-action text-white' : 'border border-bordure bg-surface-2 text-text-dim hover:text-white'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, pageCourante + 1))} disabled={pageCourante >= totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-bordure bg-surface-2 text-text-dim hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">→</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
