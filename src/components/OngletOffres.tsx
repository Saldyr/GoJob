import { useState } from 'react'
import { useStore, type Offre } from '../store/useStore'
import { joursDepuis } from '../utils/offres'
import { Briefcase, Plus, ExternalLink, Trash2, FileText, MapPin } from 'lucide-react'

export default function OngletOffres() {
  const offres = useStore((s) => s.offres)
  const addOffre = useStore((s) => s.addOffre)
  const removeOffre = useStore((s) => s.removeOffre)
  const [showForm, setShowForm] = useState(false)
  const [url, setUrl] = useState('')
  const [manuel, setManuel] = useState({ titre: '', entreprise: '', source: '', ville: '' })

  const ajouterDepuisUrl = () => {
    if (!url.trim()) return
    try {
      const parsed = new URL(url)
      const sourceMap: Record<string, string> = { 'indeed.fr': 'Indeed', 'francebleu.fr': 'France Bleu', 'linkedin.com': 'LinkedIn', 'welcometothejungle.com': 'Welcome to the Jungle', 'apec.fr': 'APEC', 'franceboulot': 'France Boulot', 'regionsjob': 'RégionsJob' }
      const source = Object.entries(sourceMap).find(([k]) => parsed.hostname.includes(k))?.[1] || parsed.hostname
      const titre = parsed.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Offre'
      addOffre({ id: '', titre, entreprise: 'À déterminer', description: '', url: parsed.href, source, dateAjout: new Date().toISOString(), statut: 'a_postuler', notes: '', ville: '' })
      setUrl('')
      setShowForm(false)
    } catch { /* pas une URL valide, on laisse remplir manuel */ }
  }

  const ajouterManuellement = () => {
    if (!manuel.titre.trim() || !manuel.entreprise.trim()) return
    addOffre({ id: '', titre: manuel.titre, entreprise: manuel.entreprise, description: '', url: '', source: manuel.source || 'Manuelle', dateAjout: new Date().toISOString(), statut: 'a_postuler', notes: '', ville: manuel.ville || '' })
    setManuel({ titre: '', entreprise: '', source: '', ville: '' })
    setShowForm(false)
  }

  const getIcon = (source: string) => {
    const s = source.toLowerCase()
    if (s.includes('linkedin')) return 'in'
    if (s.includes('indeed')) return '!'
    if (s.includes('apec')) return 'A'
    if (s.includes('welcometothejungle')) return 'W'
    if (s.includes('france')) return 'FT'
    return <FileText className="w-4 h-4" />
  }

  const triStatut: Offre['statut'][] = ['a_postuler', 'postulee', 'relancee', 'entretien', 'refus', 'acceptee']
  const statutLabels: Record<string, string> = { a_postuler: 'À postuler', postulee: 'Postulée', relancee: 'Relancée', entretien: 'En entretien', refus: 'Refus', acceptee: 'Acceptée' }
  const statutCouleurs: Record<string, string> = { a_postuler: 'bg-taupe/20 text-taupe', postulee: 'bg-sable/20 text-cacao', relancee: 'bg-ambre/10 text-action', entretien: 'bg-vert-success/10 text-vert-success', refus: 'bg-rouge-error/10 text-rouge-error', acceptee: 'bg-vert-success/20 text-vert-success' }

  if (offres.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-action" />
            <h1 className="text-2xl font-bold text-cacao">Mes offres</h1>
          </div>
          <button onClick={() => setShowForm(true)}
            className="bg-action text-white rounded-xl px-5 py-2.5 flex items-center gap-2 hover:opacity-90 transition-all font-medium">
            <Plus className="w-5 h-5" /> Ajouter
          </button>
        </div>

        <div className="rounded-2xl bg-white border border-bordure shadow-sm p-12 text-center">
          <Briefcase className="w-14 h-14 text-sable mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-cacao mb-2">Aucune offre</h2>
          <p className="text-base text-taupe mb-6">Ajoute ta première offre d'emploi.</p>
          <button onClick={() => setShowForm(true)}
            className="bg-action text-white rounded-xl px-6 py-3 flex items-center gap-2 hover:opacity-90 transition-all font-medium">Ajouter une offre</button>
        </div>

        {showForm && formulaireAjout()}
      </div>
    )
  }

  function formulaireAjout() {
    return (
      <div className="rounded-2xl bg-white border border-bordure shadow-sm p-6">
        <h3 className="text-lg font-semibold text-cacao mb-4">Nouvelle offre</h3>
        <div className="space-y-4">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Colle l'URL de l'offre (détection automatique)"
            className="w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30" />
          <button onClick={ajouterDepuisUrl}
            className="bg-sable text-cacao rounded-xl px-5 py-2.5 text-base font-medium hover:opacity-90 transition-all">Détecter depuis l'URL</button>

          <p className="text-sm text-taupe text-center">ou ajouter manuellement</p>

          <div className="grid grid-cols-2 gap-3">
            <input value={manuel.titre} onChange={(e) => setManuel({ ...manuel, titre: e.target.value })}
              placeholder="Titre du poste" className="px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30" />
            <input value={manuel.entreprise} onChange={(e) => setManuel({ ...manuel, entreprise: e.target.value })}
              placeholder="Entreprise" className="px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30" />
            <input value={manuel.source} onChange={(e) => setManuel({ ...manuel, source: e.target.value })}
              placeholder="Source (Indeed, LinkedIn...)" className="px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30" />
            <input value={manuel.ville} onChange={(e) => setManuel({ ...manuel, ville: e.target.value })}
              placeholder="Ville" className="px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30" />
          </div>
          <button onClick={ajouterManuellement} disabled={!manuel.titre.trim() || !manuel.entreprise.trim()}
            className="w-full bg-action text-white rounded-xl px-5 py-3 text-base font-medium hover:opacity-90 disabled:opacity-40 transition-all">Ajouter l'offre</button>
        </div>
      </div>
    )
  }

  const groupees = triStatut.map((s) => ({ statut: s, offres: offres.filter((o) => o.statut === s) }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Briefcase className="w-7 h-7 text-action" />
          <h1 className="text-2xl font-semibold text-cacao">Mes offres <span className="text-taupe text-lg font-normal ml-1">({offres.length})</span></h1>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-action text-white rounded-xl px-5 py-2.5 flex items-center gap-2 hover:opacity-90 transition-all font-medium">
          <Plus className="w-5 h-5" />{showForm ? 'Fermer' : 'Ajouter'}</button>
      </div>

      {showForm && formulaireAjout()}

      <div className="space-y-6">
        {groupees.map((g) => {
          if (g.offres.length === 0) return null
          return (
            <div key={g.statut}>
              <h2 className="text-lg font-semibold text-cacao mb-3">{statutLabels[g.statut] || g.statut} · {g.offres.length}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {g.offres.map((o) => (
                  <article key={o.id} className="rounded-2xl bg-white border border-bordure shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-creme flex items-center justify-center text-sm font-bold text-taupe flex-shrink-0">{getIcon(o.source)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-cacao truncate">{o.titre}</h3>
                        <p className="text-base text-taupe">{o.entreprise}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-taupe mb-3">
                      {o.ville && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{o.ville}</span>}
                      <span>Ajoutée il y a {joursDepuis(o.dateAjout)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-bordure">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${statutCouleurs[o.statut] || ''}`}>
                        {statutLabels[o.statut] || o.statut}
                      </span>
                      <div className="flex items-center gap-2">
                        {o.url && <a href={o.url} target="_blank" rel="noreferrer" className="p-2 text-taupe hover:text-action transition-colors rounded-lg hover:bg-ambre/5"><ExternalLink className="w-4 h-4" /></a>}
                        <button onClick={() => removeOffre(o.id)} className="p-2 text-taupe hover:text-rouge-error transition-colors rounded-lg hover:bg-rouge-error/5"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
