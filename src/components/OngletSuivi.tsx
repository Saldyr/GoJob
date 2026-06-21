import { useStore } from '../store/useStore'
import { ClipboardList, Briefcase, TrendingUp, Calendar, Send, CheckCircle, Clock } from 'lucide-react'
import { Carte } from './ui/Carte'
import { Bouton } from './ui/Bouton'
import { StatutBadge } from './ui/StatutBadge'

export default function OngletSuivi() {
  const offres = useStore((s) => s.offres)
  const setCurrentTab = useStore((s) => s.setCurrentTab)

  const postulees = offres.filter((o) => o.statut === 'postulee' || o.statut === 'relancee' || o.statut === 'entretien')
  const entretiens = offres.filter((o) => o.statut === 'entretien')
  const refus = offres.filter((o) => o.statut === 'refus')
  const acceptees = offres.filter((o) => o.statut === 'acceptee')

  const stats = [
    { label: 'Candidatures actives', valeur: postulees.length, icone: Send, couleur: 'text-electric' },
    { label: 'Entretiens', valeur: entretiens.length, icone: Calendar, couleur: 'text-vert' },
    { label: 'Refus', valeur: refus.length, icone: TrendingUp, couleur: 'text-rouge-error' },
    { label: 'Acceptations', valeur: acceptees.length, icone: CheckCircle, couleur: 'text-vert' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-action to-action-vif flex items-center justify-center shadow-lg shadow-action-glow">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1>Suivi des candidatures</h1>
          <p className="text-text-dim text-sm">{postulees.length} candidature{postulees.length > 1 ? 's' : ''} active{postulees.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, valeur, icone: Icon, couleur }) => (
          <div key={label} className="rounded-2xl border border-bordure bg-surface-2 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-5 h-5 ${couleur}`} />
              <span className="text-2xl font-bold text-white">{valeur}</span>
            </div>
            <p className="text-xs text-text-dim">{label}</p>
          </div>
        ))}
      </div>

      {/* Liste des candidatures */}
      {postulees.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-dim text-lg font-medium mb-1">Aucune candidature active</p>
          <p className="text-text-muted text-sm mb-6">Postulez à des offres pour les voir apparaître ici</p>
          <Bouton variant="primaire" onClick={() => setCurrentTab('offres')}><Briefcase className="w-4 h-4" /> Voir les offres</Bouton>
        </div>
      ) : (
        <div className="space-y-3">
          {postulees.map((offre) => (
            <div key={offre.id} className="rounded-2xl border border-bordure bg-surface-2 p-5 shadow-sm card-hover">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{offre.titre}</h3>
                    <StatutBadge statut={offre.statut} />
                  </div>
                  <p className="text-text-dim text-sm">{offre.entreprise}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-muted">
                    {offre.datePostulation && (
                      <span className="flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" /> Postulée le {new Date(offre.datePostulation).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    {offre.dateRelance && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Relancée le {new Date(offre.dateRelance).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entretiens à venir */}
      {entretiens.length > 0 && (
        <Carte titre="Entretiens à venir" icone={<Calendar className="w-5 h-5" />}>
          <div className="space-y-3">
            {entretiens.map((offre) => (
              <div key={offre.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-3 border border-bordure">
                <div className="w-8 h-8 rounded-lg bg-vert/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-vert" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{offre.titre}</p>
                  <p className="text-xs text-text-dim">{offre.entreprise}</p>
                </div>
              </div>
            ))}
          </div>
        </Carte>
      )}
    </div>
  )
}
