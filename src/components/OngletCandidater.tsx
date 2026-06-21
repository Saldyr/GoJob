import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { genererLettreMotivation } from '../utils/api'
import { FileText, Copy, Sparkles, RefreshCw, Send, ArrowRight } from 'lucide-react'

export default function OngletCandidater() {
  const offres = useStore((s) => s.offres)
  const profile = useStore((s) => s.profile)
  const settings = useStore((s) => s.settings)
  const updateOffre = useStore((s) => s.updateOffre)
  const setCurrentTab = useStore((s) => s.setCurrentTab)
  const [offreId, setOffreId] = useState('')
  const [lettreLocale, setLettreLocale] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const offreCourante = offres.find((o) => o.id === offreId)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (offreCourante?.lettre) setLettreLocale(offreCourante.lettre)
    else setLettreLocale('')
  }, [offreId, offreCourante?.lettre])

  const offresAPostuler = offres.filter((o) => o.statut === 'a_postuler')

  const handleGenerer = async () => {
    if (!offreId) return
    if (!settings.cleApi) { setErreur('Configure d\'abord ta clé API dans l\'onglet Réglages.'); return }
    setLoading(true)
    setLettreLocale('')
    setErreur('')

    const offre = offres.find((o) => o.id === offreId)
    if (!offre) return

    const result = await genererLettreMotivation({
      offre, cvText: profile.cvText, competences: profile.competences,
      nom: profile.nom, endpoint: settings.endpoint, modele: settings.modele,
      cleApi: settings.cleApi, titreMetier: profile.titre || '',
      langue: settings.langue || 'fr',
    })

    if (result.ok) {
      const contenu = result.contenu || ''
      setLettreLocale(contenu)
      updateOffre(offreId, { lettre: contenu, statut: 'postulee', datePostulation: new Date().toISOString() })
    } else {
      setErreur(result.erreur || 'Erreur inconnue')
    }
    setLoading(false)
  }

  const handleLettreChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nouveauTexte = e.target.value
    setLettreLocale(nouveauTexte)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (offreId) updateOffre(offreId, { lettre: nouveauTexte })
    }, 1000)
  }

  const handleCopier = async () => {
    if (!lettreLocale) return
    if (window.electronAPI?.copierPressePapier) await window.electronAPI.copierPressePapier(lettreLocale)
    else await navigator.clipboard.writeText(lettreLocale)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Send className="w-7 h-7 text-action" />
        <h1 className="text-2xl font-bold text-cacao">Postuler</h1>
      </div>

      {/* Sélection de l'offre */}
      <div className="rounded-2xl bg-white border border-bordure shadow-sm p-6">
        <label className="block text-sm font-medium text-cacao mb-2">Sélectionne une offre</label>
        <select
          value={offreId}
          onChange={(e) => { setOffreId(e.target.value); setErreur('') }}
          className="w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base focus:outline-none focus:ring-2 focus:ring-action/50"
        >
          <option value="">Choisis une offre...</option>
          {offresAPostuler.map((o) => (
            <option key={o.id} value={o.id}>{o.titre} — {o.entreprise}</option>
          ))}
          {offres.filter((o) => o.statut !== 'a_postuler').map((o) => (
            <option key={o.id} value={o.id}>{o.titre} — {o.entreprise} [{o.statut}]</option>
          ))}
        </select>

        {offreCourante && (
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-taupe">
            {offreCourante.source && <span>Source : {offreCourante.source}</span>}
            {offreCourante.ville && <span>· {offreCourante.ville}</span>}
            {offreCourante.url && (
              <a href={offreCourante.url} target="_blank" rel="noreferrer" className="text-action hover:underline flex items-center gap-1 ml-auto">
                Voir l'annonce <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        <button
          onClick={handleGenerer}
          disabled={!offreId || loading}
          className="mt-4 w-full bg-action text-white rounded-xl px-6 py-3 text-base font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all"
        >
          {loading ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> Génération...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Générer la lettre de motivation</>
          )}
        </button>
      </div>

      {/* Résultat */}
      {lettreLocale ? (
        <div className="rounded-2xl bg-white border border-bordure shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-taupe">Lettre modifiable — sauvegardée automatiquement</p>
            <button onClick={handleCopier} className="bg-sable text-cacao rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 hover:opacity-90 transition-all font-medium">
              <Copy className="w-4 h-4" /> Copier
            </button>
          </div>
          <textarea
            value={lettreLocale}
            onChange={handleLettreChange}
            className="w-full p-5 rounded-xl border border-bordure bg-creme text-cacao text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-action/50"
            rows={18}
          />
        </div>
      ) : erreur ? (
        <div className="rounded-2xl bg-white border border-rouge-error/30 shadow-sm p-6 text-center">
          <p className="text-base text-rouge-error">{erreur}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-bordure shadow-sm p-12 text-center">
          <FileText className="w-14 h-14 text-sable mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-cacao mb-2">Sélectionne une offre</h2>
          <p className="text-base text-taupe">La lettre sera générée automatiquement.</p>
          {!profile.cvText && (
            <button onClick={() => setCurrentTab('profil')} className="text-sm text-action underline font-medium cursor-pointer hover:opacity-80 transition-colors mt-3">
              Remplis d'abord ton profil (onglet Mon profil) pour une lettre personnalisée.
            </button>
          )}
          {!settings.cleApi && (
            <button onClick={() => setCurrentTab('reglages')} className="text-sm text-action underline font-medium cursor-pointer hover:opacity-80 transition-colors mt-2">
              Configure ta clé API dans l'onglet Réglages pour générer des lettres.
            </button>
          )}
        </div>
      )}
    </div>
  )
}
