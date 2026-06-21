import { Calendar, MessageSquare, CheckCircle, Briefcase, XCircle } from 'lucide-react'
import { Carte, StatutBadge } from './ui'
import { useStore, type Offre } from '../store/useStore'
import { joursDepuis } from '../utils/offres'

export default function OngletSuivi() {
  const offres = useStore((s) => s.offres)
  const updateOffre = useStore((s) => s.updateOffre)
  const setCurrentTab = useStore((s) => s.setCurrentTab)

  const offresActives = offres.filter((o) => o.statut !== 'a_postuler' && o.statut !== 'refus' && o.statut !== 'acceptee')
  const refus = offres.filter((o) => o.statut === 'refus').length
  const acceptees = offres.filter((o) => o.statut === 'acceptee').length
  const aRelancer = offres.filter((o) => {
    if (o.statut !== 'postulee' && o.statut !== 'relancee') return false
    if (!o.datePostulation) return false
    return joursDepuis(o.datePostulation) >= 7
  })

  const besoinRelance = (o: Offre): boolean => {
    if (o.statut !== 'postulee' && o.statut !== 'relancee') return false
    if (!o.datePostulation) return false
    return joursDepuis(o.datePostulation) >= 7
  }

  const marquerRelance = (id: string) => {
    updateOffre(id, { statut: 'relancee', dateRelance: new Date().toISOString() })
  }

  if (offresActives.length === 0 && refus === 0 && acceptees === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-7 h-7 text-action" />
          <h1 className="text-2xl font-bold text-cacao">Suivi</h1>
        </div>
        <div className="rounded-2xl bg-white border border-bordure shadow-sm p-12 text-center">
          <Calendar className="w-14 h-14 text-sable mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-cacao mb-2">Aucune candidature</h2>
          <p className="text-base text-taupe">Postule à une offre depuis l'onglet Postuler.</p>
          <button onClick={() => setCurrentTab('postuler')} className="mt-3 bg-action text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-all">
            Aller postuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Calendar className="w-7 h-7 text-action" />
        <h1 className="text-2xl font-bold text-cacao">Suivi des candidatures</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-bordure shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-cacao">{offresActives.length}</p>
          <p className="text-sm text-taupe mt-1">En cours</p>
        </div>
        <div className="rounded-2xl bg-white border border-bordure shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-action">{aRelancer.length}</p>
          <p className="text-sm text-taupe mt-1">À relancer</p>
        </div>
        <div className="rounded-2xl bg-white border border-bordure shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-vert-success">{acceptees}</p>
          <p className="text-sm text-taupe mt-1">Acceptées</p>
        </div>
        <div className="rounded-2xl bg-white border border-bordure shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-rouge-error">{refus}</p>
          <p className="text-sm text-taupe mt-1">Refus</p>
        </div>
      </div>

      {/* Actives */}
      {offresActives.length > 0 && (
        <Carte titre="Candidatures en cours" icone={<Briefcase className="w-5 h-5" />}>
          <div className="space-y-3">
            {offresActives.map((o) => (
              <div key={o.id} className={`p-4 rounded-xl border ${besoinRelance(o) ? 'bg-ambre/5 border-ambre/30' : 'bg-creme border-bordure'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-cacao">{o.titre}</h3>
                    <p className="text-base text-taupe">{o.entreprise}</p>
                  </div>
                  <StatutBadge statut={o.statut} />
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-taupe">
                  <span>Postulée le {o.datePostulation ? new Date(o.datePostulation).toLocaleDateString() : '-'}</span>
                  {o.dateRelance && <span>· Relancée le {new Date(o.dateRelance).toLocaleDateString()}</span>}
                </div>

                {besoinRelance(o) && (
                  <button
                    onClick={() => marquerRelance(o.id)}
                    className="mt-3 bg-action text-white rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 hover:opacity-90 transition-all font-medium"
                  >
                    <MessageSquare className="w-4 h-4" /> Marquer comme relancée
                  </button>
                )}

                {o.url && (
                  <a href={o.url} target="_blank" rel="noreferrer" className="text-sm text-action hover:underline mt-2 inline-block">
                    Voir l'offre →
                  </a>
                )}
              </div>
            ))}
          </div>
        </Carte>
      )}

      {/* Terminées */}
      {(refus > 0 || acceptees > 0) && (
        <Carte titre="Terminées" icone={<CheckCircle className="w-5 h-5" />}>
          <div className="space-y-2">
            {offres.filter((o) => o.statut === 'refus' || o.statut === 'acceptee').map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-creme border border-bordure">
                <div className="flex items-center gap-2">
                  {o.statut === 'acceptee' ? (
                    <CheckCircle className="w-4 h-4 text-vert-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rouge-error" />
                  )}
                  <div>
                    <span className="text-base font-medium text-cacao">{o.titre}</span>
                    <span className="text-sm text-taupe ml-2">— {o.entreprise}</span>
                  </div>
                </div>
                <StatutBadge statut={o.statut} />
              </div>
            ))}
          </div>
        </Carte>
      )}
    </div>
  )
}
