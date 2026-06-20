import { useStore } from '../store/useStore'
import { MessageCircle, Calendar, Briefcase, BarChart3, PlusCircle, FileEdit, Sparkles } from 'lucide-react'
import { joursDepuis } from '../utils/offres'

function Tuile({ valeur, label }: { valeur: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white border border-bordure shadow-sm p-6 text-center">
      <p className="text-3xl font-bold text-cacao mb-1">{valeur}</p>
      <p className="text-sm text-taupe">{label}</p>
    </div>
  )
}

function Carte({ titre, icone, children }: { titre: string; icone?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border border-bordure shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        {icone && <span className="text-ambre">{icone}</span>}
        <h2 className="text-lg font-semibold text-cacao">{titre}</h2>
      </div>
      {children}
    </section>
  )
}

export default function OngletAccueil() {
  const offres = useStore((s) => s.offres)
  const setCurrentTab = useStore((s) => s.setCurrentTab)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const offresRecentes = offres.filter((o) => o.dateAjout && new Date(o.dateAjout) >= sevenDaysAgo)
  const offresTriees = [...offres].sort((a, b) => new Date(b.dateAjout || 0).getTime() - new Date(a.dateAjout || 0).getTime())
  const avecLettre = offres.filter((o) => o.lettre && o.statut === 'postulee')

  const postulees = offres.filter((o) => o.statut === 'postulee').length
  const entretiens = offres.filter((o) => o.statut === 'entretien').length
  const refus = offres.filter((o) => o.statut === 'refus').length
  const enAttente = offres.filter((o) => o.statut === 'a_postuler' || o.statut === 'postulee').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-7 h-7 text-ambre" />
        <h1 className="text-2xl font-bold text-cacao">Tableau de bord</h1>
      </div>

      {/* 1. Réponses / retours */}
      <Carte titre="Réponses reçues" icone={<MessageCircle className="w-5 h-5" />}>
        {avecLettre.length > 0 ? (
          <ul className="space-y-3">
            {avecLettre.map((o) => (
              <li key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-creme border border-bordure">
                <div className="w-2 h-2 rounded-full bg-vert-success flex-shrink-0" />
                <div>
                  <p className="text-base font-medium text-cacao">{o.titre}</p>
                  <p className="text-sm text-taupe">{o.entreprise}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 text-sable mx-auto mb-3" />
            <p className="text-base text-taupe">Pas encore de réponses.</p>
            <p className="text-sm text-taupe/60 mt-1">Configure ton email dans <button onClick={() => setCurrentTab('reglages')} className="text-ambre underline">Réglages</button>.</p>
          </div>
        )}
      </Carte>

      {/* 2. À faire aujourd'hui */}
      <Carte titre="À faire aujourd'hui" icone={<Calendar className="w-5 h-5" />}>
        {offresRecentes.length > 0 ? (
          <ul className="space-y-2">
            {offresRecentes.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-creme border border-bordure">
                <Briefcase className="w-4 h-4 text-taupe flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-base text-cacao">{o.titre}</p>
                  <p className="text-sm text-taupe">{o.entreprise} · {joursDepuis(o.dateAjout)}</p>
                </div>
                {!o.lettre && (
                  <button onClick={() => setCurrentTab('postuler')} className="text-sm text-ambre font-medium hover:underline">
                    Postuler
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-taupe py-4">Rien de prévu aujourd'hui. Profite pour ajouter des offres !</p>
        )}
      </Carte>

      {/* 3. Nouvelles offres */}
      <Carte titre="Nouvelles offres" icone={<Briefcase className="w-5 h-5" />}>
        {offresTriees.length > 0 ? (
          <ul className="space-y-2">
            {offresTriees.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-creme border border-bordure">
                <div>
                  <p className="text-base font-medium text-cacao">{o.titre}</p>
                  <p className="text-sm text-taupe">{o.entreprise}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-taupe py-4">Aucune offre pour l'instant. Ajoutes-en une !</p>
        )}
      </Carte>

      {/* 4. Vue d'ensemble */}
      <Carte titre="Vue d'ensemble" icone={<BarChart3 className="w-5 h-5" />}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Tuile valeur={postulees} label="Postulées" />
          <Tuile valeur={entretiens} label="Entretiens" />
          <Tuile valeur={refus} label="Refus" />
          <Tuile valeur={enAttente} label="En attente" />
        </div>
      </Carte>

      {/* 5. Actions rapides */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setCurrentTab('offres')}
          className="flex items-center justify-center gap-3 bg-ambre text-white rounded-2xl px-6 py-5 text-lg font-medium hover:opacity-90 transition-all shadow-sm"
        >
          <PlusCircle className="w-6 h-6" />
          Ajouter une offre
        </button>
        <button
          onClick={() => setCurrentTab('postuler')}
          className="flex items-center justify-center gap-3 bg-sable text-cacao rounded-2xl px-6 py-5 text-lg font-medium hover:bg-sablefonce transition-all shadow-sm border border-bordure"
        >
          <FileEdit className="w-6 h-6" />
          Générer une lettre
        </button>
      </div>
    </div>
  )
}
