import { useState } from 'react'
import { useStore, type Offre } from '../store/useStore'
import { Briefcase, Plus, ExternalLink, Trash2, MapPin, Clock } from 'lucide-react'
import { Bouton } from './ui/Bouton'
import { StatutBadge } from './ui/StatutBadge'

const STATUTS: Offre['statut'][] = ['a_postuler', 'postulee', 'relancee', 'entretien', 'refus', 'acceptee']

export default function OngletOffres() {
  const offres = useStore((s) => s.offres)
  const removeOffre = useStore((s) => s.removeOffre)
  const updateOffre = useStore((s) => s.updateOffre)
  const setCurrentTab = useStore((s) => s.setCurrentTab)

  const [filtreStatut, setFiltreStatut] = useState<Offre['statut'] | 'tout'>('tout')
  const [recherche, setRecherche] = useState('')

  const filtrees = offres.filter((o) => {
    if (filtreStatut !== 'tout' && o.statut !== filtreStatut) return false
    if (recherche) {
      const q = recherche.toLowerCase()
      return o.titre.toLowerCase().includes(q) || o.entreprise.toLowerCase().includes(q)
    }
    return true
  })

  const countParStatut = (s: Offre['statut']) => offres.filter((o) => o.statut === s).length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-action to-action-vif flex items-center justify-center shadow-lg shadow-action-glow">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1>Offres d'emploi</h1>
            <p className="text-text-dim text-sm">{offres.length} offre{offres.length > 1 ? 's' : ''} suivie{offres.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <Bouton variant="primaire" onClick={() => setCurrentTab('postuler')}>
          <Plus className="w-4 h-4" /> Nouvelle offre
        </Bouton>
      </div>

      {/* Barre recherche + filtres */}
      <div className="relative">
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher par titre ou entreprise..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-bordure bg-surface-2 text-text text-sm placeholder:text-text-muted/60 focus:border-action focus:ring-1 focus:ring-action/30 transition-all"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-lg">🔍</span>
      </div>

      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltreStatut('tout')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filtreStatut === 'tout' ? 'bg-action/15 text-white border border-action/20' : 'bg-surface-2 text-text-dim hover:text-text border border-bordure'
          }`}
        >
          Toutes ({offres.length})
        </button>
        {STATUTS.map((s) => (
          <button
            key={s}
            onClick={() => setFiltreStatut(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filtreStatut === s ? 'bg-action/15 text-white border border-action/20' : 'bg-surface-2 text-text-dim hover:text-text border border-bordure'
            }`}
          >
            {s === 'a_postuler' ? 'À postuler' : s.charAt(0).toUpperCase() + s.slice(1)} ({countParStatut(s)})
          </button>
        ))}
      </div>

      {/* Liste offres */}
      {filtrees.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-dim text-lg font-medium mb-1">Aucune offre trouvée</p>
          <p className="text-text-muted text-sm mb-6">
            {recherche ? 'Essayez d\'autres mots-clés' : 'Ajoutez votre première offre pour commencer'}
          </p>
          {!recherche && <Bouton variant="primaire" onClick={() => setCurrentTab('postuler')}><Plus className="w-4 h-4" /> Ajouter une offre</Bouton>}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtrees.map((offre) => (
            <div key={offre.id} className="rounded-2xl border border-bordure bg-surface-2 p-6 shadow-sm card-hover">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-text-dim" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{offre.titre}</h3>
                      <p className="text-text-dim text-sm">{offre.entreprise}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-muted">
                    {offre.ville && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {offre.ville}</span>}
                    {offre.dateAjout && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(offre.dateAjout).toLocaleDateString('fr-FR')}</span>}
                    {offre.url && (
                      <a href={offre.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-action hover:text-action-vif">
                        <ExternalLink className="w-3.5 h-3.5" /> Voir l'offre
                      </a>
                    )}
                  </div>
                  {offre.notes && <p className="text-text-dim text-sm mt-3">{offre.notes}</p>}
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <StatutBadge statut={offre.statut} />
                  {offre.statut === 'a_postuler' && (
                    <Bouton variant="primaire" onClick={() => { updateOffre(offre.id, { statut: 'postulee', datePostulation: new Date().toISOString().split('T')[0] }) }}>
                      Postuler
                    </Bouton>
                  )}
                  <button onClick={() => removeOffre(offre.id)} className="text-text-muted hover:text-rouge-error p-2 rounded-lg hover:bg-rouge-error/10 transition-all" title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
