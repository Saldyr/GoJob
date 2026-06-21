import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import {
  Briefcase,
  MessageCircle,
  Calendar,
  BarChart3,
  PlusCircle,
  FileEdit,
  Sparkles,
  CheckCircle,
  Target,
  TrendingUp,
  UserCheck,
  Star,
} from 'lucide-react'
import { joursDepuis } from '../utils/offres'
import { Carte } from './ui/Carte'
import { Bouton } from './ui/Bouton'
import { StatutBadge } from './ui/StatutBadge'

// ── Tuile statistique ──────────────────────────────────────
function Tuile({
  valeur,
  label,
  icone,
  accent,
}: {
  valeur: number | string
  label: string
  icone: React.ReactNode
  accent: string
}) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.20), 0 16px 48px rgba(0,0,0,0.15)' }}
      className="rounded-2xl bg-surface-2 border border-bordure shadow-sm p-6 card-hover"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${accent}`}
        >
          {icone}
        </div>
        <p className="text-3xl font-bold text-white">{valeur}</p>
      </div>
      <p className="text-sm text-text-dim">{label}</p>
    </motion.div>
  )
}

// ── Animations stagger ─────────────────────────────────────
const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  },
}

// ── Composant principal ────────────────────────────────────
export default function OngletAccueil() {
  const offres = useStore((s) => s.offres)
  const profile = useStore((s) => s.profile)
  const settings = useStore((s) => s.settings)
  const setCurrentTab = useStore((s) => s.setCurrentTab)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const offresRecentes = offres.filter(
    (o) => o.dateAjout && new Date(o.dateAjout) >= sevenDaysAgo,
  )
  const offresTriees = [...offres].sort(
    (a, b) =>
      new Date(b.dateAjout || 0).getTime() - new Date(a.dateAjout || 0).getTime(),
  )

  const postulees = offres.filter((o) => o.statut === 'postulee').length
  const entretiens = offres.filter((o) => o.statut === 'entretien').length
  const sauvegardees = offres.filter((o) => o.statut === 'a_postuler').length

  // Pourcentage du profil complété
  const champsProfil: (keyof typeof profile)[] = [
    'nom', 'prenom', 'titre', 'email', 'telephone', 'resume', 'localisation',
  ]
  const remplis = champsProfil.filter((k) => profile[k]?.toString().trim() !== '').length
  const pctProfil = Math.round((remplis / champsProfil.length) * 100)

  // Dernière offre en cours (relancée ou avec le statut le plus avancé)
  const offreEnCours = offresTriees.find(
    (o) => o.statut === 'relancee' || o.statut === 'entretien',
  )

  const hasGuest = profile.nom === '' && offres.length === 0

  // Messages simulés à partir des offres avec lettre (proxy "messages récents")
  const offresAvecLettre = offres.filter((o) => o.lettre && o.statut === 'postulee')

  return (
    <motion.div
      className="space-y-10"
      variants={stagger.container}
      initial="initial"
      animate="animate"
    >
      {/* ── En-tête ──────────────────────────────────────── */}
      <motion.div
        variants={stagger.item}
        className="flex items-center gap-3 mb-1"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-action to-action-vif flex items-center justify-center shadow-md shadow-action/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white">Tableau de bord</h1>
          <p className="text-sm text-text-dim mt-0.5">
            Vue d'ensemble de ta recherche
          </p>
        </div>
      </motion.div>

      {/* ── Onboarding : checklist 3 étapes ──────────────── */}
      {hasGuest && (
        <motion.section
          variants={stagger.item}
          className="rounded-2xl bg-surface-2 border border-bordure shadow-md p-8"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <Target className="w-5 h-5 text-action" />
            <h2 className="text-lg font-semibold text-white">
              Pour commencer, 3 étapes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Bouton
              variant="secondaire"
              onClick={() => setCurrentTab('profil')}
              className="flex flex-col items-start gap-3 w-full p-5 h-auto"
            >
              <span className="w-8 h-8 rounded-full bg-action-deep text-white flex items-center justify-center shrink-0 text-sm font-bold">
                1
              </span>
              <div className="flex items-center gap-2 w-full">
                <span className="text-base text-white font-medium">
                  Compléter mon profil
                </span>
                {profile.nom !== '' && (
                  <CheckCircle className="w-5 h-5 text-vert shrink-0 ml-auto" />
                )}
              </div>
            </Bouton>
            <Bouton
              variant="secondaire"
              onClick={() => setCurrentTab('reglages')}
              className="flex flex-col items-start gap-3 w-full p-5 h-auto"
            >
              <span className="w-8 h-8 rounded-full bg-action-deep text-white flex items-center justify-center shrink-0 text-sm font-bold">
                2
              </span>
              <div className="flex items-center gap-2 w-full">
                <span className="text-base text-white font-medium">
                  Ajouter ma clé API
                </span>
                {settings.cleApi !== '' && (
                  <CheckCircle className="w-5 h-5 text-vert shrink-0 ml-auto" />
                )}
              </div>
            </Bouton>
            <Bouton
              variant="secondaire"
              onClick={() => setCurrentTab('offres')}
              className="flex flex-col items-start gap-3 w-full p-5 h-auto"
            >
              <span className="w-8 h-8 rounded-full bg-action-deep text-white flex items-center justify-center shrink-0 text-sm font-bold">
                3
              </span>
              <div className="flex items-center gap-2 w-full">
                <span className="text-base text-white font-medium">
                  Ajouter ma première offre
                </span>
                {offres.length > 0 && (
                  <CheckCircle className="w-5 h-5 text-vert shrink-0 ml-auto" />
                )}
              </div>
            </Bouton>
          </div>
        </motion.section>
      )}

      {/* ── Cartes statistiques ──────────────────────────── */}
      {offres.length > 0 && (
        <motion.div
          variants={stagger.item}
          className="grid grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <Tuile
            valeur={postulees + entretiens}
            label="Candidatures envoyées"
            icone={<Briefcase className="w-5 h-5 text-white" />}
            accent="bg-gradient-to-br from-action to-action-vif"
          />
          <Tuile
            valeur={entretiens}
            label="Entretiens"
            icone={<TrendingUp className="w-5 h-5 text-white" />}
            accent="bg-gradient-to-br from-electric to-electric/70"
          />
          <Tuile
            valeur={sauvegardees}
            label="Offres sauvegardées"
            icone={<Star className="w-5 h-5 text-white" />}
            accent="bg-gradient-to-br from-rose to-rose/70"
          />
          <Tuile
            valeur={`${pctProfil}%`}
            label="Profil complété"
            icone={<UserCheck className="w-5 h-5 text-white" />}
            accent="bg-gradient-to-br from-vert to-vert/70"
          />
        </motion.div>
      )}

      {/* ── Contenu principal (offres existantes) ────────── */}
      {offres.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Offre en cours */}
            <motion.div variants={stagger.item}>
              <Carte
                titre="Offre en cours"
                icone={<Briefcase className="w-5 h-5 text-action" />}
              >
                {offreEnCours ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-surface-3 border border-bordure shadow-sm">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-medium text-white truncate">
                          {offreEnCours.titre}
                        </p>
                        <p className="text-sm text-text-dim mt-0.5">
                          {offreEnCours.entreprise}
                        </p>
                        {offreEnCours.dateAjout && (
                          <p className="text-xs text-text-muted mt-1">
                            Ajoutée il y a {joursDepuis(offreEnCours.dateAjout)} jours
                          </p>
                        )}
                      </div>
                      <StatutBadge statut={offreEnCours.statut} />
                    </div>
                    {offreEnCours.notes && (
                      <p className="text-sm text-text bg-surface-3 rounded-xl p-3 border border-bordure">
                        {offreEnCours.notes}
                      </p>
                    )}
                    <Bouton
                      variant="primaire"
                      onClick={() => setCurrentTab('offres')}
                      className="w-full"
                    >
                      Voir toutes mes offres
                    </Bouton>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-2xl bg-action/10 flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-7 h-7 text-action" />
                    </div>
                    <p className="text-base text-text">Aucune offre en cours.</p>
                    <p className="text-sm text-text-muted mt-1">
                      Ajoute une offre pour commencer.
                    </p>
                    <Bouton
                      variant="primaire"
                      onClick={() => setCurrentTab('offres')}
                      className="mt-4"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Ajouter une offre
                    </Bouton>
                  </div>
                )}
              </Carte>
            </motion.div>

            {/* Messages récents */}
            <motion.div variants={stagger.item}>
              <Carte
                titre="Messages récents"
                icone={<MessageCircle className="w-5 h-5 text-action" />}
              >
                {offresAvecLettre.length > 0 ? (
                  <ul className="space-y-3">
                    {offresAvecLettre.slice(0, 5).map((o) => (
                      <li
                        key={o.id}
                        className="flex items-center gap-3 p-4 rounded-xl bg-surface-3 border border-bordure shadow-sm"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-vert shadow-sm shadow-vert/30 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-medium text-white truncate">
                            {o.titre}
                          </p>
                          <p className="text-sm text-text-dim">{o.entreprise}</p>
                        </div>
                        <span className="text-xs text-text-muted shrink-0">
                          {o.dateAjout ? joursDepuis(o.dateAjout) + 'j' : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-2xl bg-action/10 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-7 h-7 text-action" />
                    </div>
                    <p className="text-base text-text">Pas encore de messages.</p>
                    <p className="text-sm text-text-muted mt-1">
                      Configure ton email dans{' '}
                      <button
                        onClick={() => setCurrentTab('reglages')}
                        className="text-action font-medium hover:underline"
                      >
                        Réglages
                      </button>
                      .
                    </p>
                  </div>
                )}
              </Carte>
            </motion.div>

            {/* Suggestions / offres récentes */}
            <motion.div variants={stagger.item}>
              <Carte
                titre="Suggestions"
                icone={<Sparkles className="w-5 h-5 text-action" />}
              >
                {offresTriees.length > 0 ? (
                  <ul className="space-y-2">
                    {offresTriees.slice(0, 5).map((o) => (
                      <li
                        key={o.id}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-3 border border-bordure shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-lg bg-action/10 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-action" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base text-white truncate">
                            {o.titre}
                          </p>
                          <p className="text-sm text-text-dim">
                            {o.entreprise} · {o.dateAjout ? joursDepuis(o.dateAjout) + 'j' : ''}
                          </p>
                        </div>
                        {!o.lettre && o.statut === 'a_postuler' && (
                          <button
                            onClick={() => setCurrentTab('postuler')}
                            className="text-sm text-action font-semibold hover:underline shrink-0"
                          >
                            Postuler
                          </button>
                        )}
                      </li>
                    ))}
                    {offresTriees.length > 5 && (
                      <button
                        onClick={() => setCurrentTab('offres')}
                        className="text-sm text-action font-medium hover:underline text-center w-full block mt-2"
                      >
                        Voir toutes les offres ({offres.length})
                      </button>
                    )}
                  </ul>
                ) : (
                  <p className="text-base text-text-dim py-6 text-center">
                    Aucune offre pour l'instant.
                  </p>
                )}
              </Carte>
            </motion.div>

            {/* Prochaines actions / calendrier */}
            <motion.div variants={stagger.item}>
              <Carte
                titre="Prochaines actions"
                icone={<Calendar className="w-5 h-5 text-action" />}
              >
                {offresRecentes.length > 0 ? (
                  <ul className="space-y-2">
                    {offresRecentes.slice(0, 5).map((o) => (
                      <li
                        key={o.id}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-3 border border-bordure shadow-sm"
                      >
                        <Calendar className="w-4 h-4 text-text-muted flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-base text-white truncate">
                            {o.titre}
                          </p>
                          <p className="text-sm text-text-dim">
                            {o.entreprise} ·{' '}
                            {o.dateAjout ? joursDepuis(o.dateAjout) + 'j' : ''}
                          </p>
                        </div>
                        {!o.lettre && (
                          <button
                            onClick={() => setCurrentTab('postuler')}
                            className="text-sm text-action font-semibold hover:underline shrink-0"
                          >
                            Postuler
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base text-text-dim py-6 text-center">
                    Rien de prévu aujourd'hui.
                  </p>
                )}
              </Carte>
            </motion.div>
          </div>

          {/* ── Actions rapides ────────────────────────────── */}
          <motion.div
            variants={stagger.item}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <Bouton
              onClick={() => setCurrentTab('offres')}
              className="py-5 text-lg shadow-md shadow-action/20"
            >
              <PlusCircle className="w-6 h-6" />
              Ajouter une offre
            </Bouton>
            <Bouton
              variant="secondaire"
              onClick={() => setCurrentTab('postuler')}
              className="py-5 text-lg"
            >
              <FileEdit className="w-6 h-6" />
              Générer une lettre
            </Bouton>
          </motion.div>

          {/* ── Vue d'ensemble / récapitulatif ────────────── */}
          <motion.div variants={stagger.item}>
            <Carte
              titre="Récapitulatif"
              icone={<BarChart3 className="w-5 h-5 text-action" />}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-surface-3 border border-bordure p-4 text-center">
                  <p className="text-2xl font-bold text-white">
                    {offres.length}
                  </p>
                  <p className="text-xs text-text-dim mt-1">Total offres</p>
                </div>
                <div className="rounded-xl bg-surface-3 border border-bordure p-4 text-center">
                  <p className="text-2xl font-bold text-electric">{postulees}</p>
                  <p className="text-xs text-text-dim mt-1">Postulées</p>
                </div>
                <div className="rounded-xl bg-surface-3 border border-bordure p-4 text-center">
                  <p className="text-2xl font-bold text-vert">{entretiens}</p>
                  <p className="text-xs text-text-dim mt-1">Entretiens</p>
                </div>
                <div className="rounded-xl bg-surface-3 border border-bordure p-4 text-center">
                  <p className="text-2xl font-bold text-rose">
                    {offres.filter((o) => o.statut === 'refus').length}
                  </p>
                  <p className="text-xs text-text-dim mt-1">Refus</p>
                </div>
              </div>
            </Carte>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
