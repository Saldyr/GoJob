import { useStore } from '../store/useStore'
import { Home, Briefcase, FileEdit, ClipboardList, User, Settings, Sparkles, Star } from 'lucide-react'

const NAV_ITEMS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: 'accueil', label: 'Tableau de bord', icon: Home },
  { id: 'offres', label: "Offres d'emploi", icon: Briefcase },
  { id: 'postuler', label: 'Candidater', icon: FileEdit },
  { id: 'suivi', label: 'Suivi', icon: ClipboardList },
  { id: 'profil', label: 'Mon profil', icon: User },
  { id: 'reglages', label: 'Paramètres', icon: Settings },
]

export default function Sidebar() {
  const currentTab = useStore((s) => s.currentTab)
  const setCurrentTab = useStore((s) => s.setCurrentTab)
  const offres = useStore((s) => s.offres)
  const profil = useStore((s) => s.profile)

  const postulees = offres.filter((o) => o.statut === 'postulee').length

  return (
    <aside className="w-64 shrink-0 h-screen flex flex-col border-r border-bordure bg-surface-2 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-action to-action-vif flex items-center justify-center shadow-lg shadow-action-glow">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight">GoJob</span>
          <span className="block text-xs text-text-dim font-medium">Recherche d'emploi</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = currentTab === id
          return (
            <button
              key={id}
              onClick={() => setCurrentTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-action/15 text-white shadow-sm border border-action/20'
                  : 'text-text-dim hover:text-text hover:bg-surface-3'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-action' : ''}`} />
              <span>{label}</span>
              {id === 'offres' && postulees > 0 && (
                <span className="ml-auto text-xs bg-action/20 text-action-vif px-2 py-0.5 rounded-full font-semibold">
                  {postulees}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Premium upsell */}
      <div className="mx-3 mb-4 p-4 rounded-2xl bg-gradient-to-br from-surface-3 to-surface-2 border border-bordure">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-ambre-warn" />
          <span className="text-sm font-semibold text-white">Passez Premium</span>
        </div>
        <p className="text-xs text-text-muted mb-3">Débloquez les statistiques avancées et le suivi automatique.</p>
        <button className="w-full py-2 rounded-xl bg-gradient-to-r from-action-deep to-action text-white text-xs font-semibold shadow-glow-action hover:opacity-90 transition-opacity">
          Découvrir
        </button>
      </div>

      {/* User profile */}
      <div className="px-4 py-4 border-t border-bordure flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric to-action flex items-center justify-center text-white text-xs font-bold shrink-0">
          {profil.prenom?.[0] || profil.nom?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{profil.prenom || 'Invité'}</p>
          <p className="text-xs text-text-muted">Candidat</p>
        </div>
      </div>
    </aside>
  )
}
