import { useStore } from '../store/useStore'
import { Home, Briefcase, Settings } from 'lucide-react'
import { useT } from '../i18n/useT'
import Logo from './Logo'

const NAV_ITEMS: { id: string; labelKey: string; icon: React.ElementType }[] = [
  { id: 'accueil', labelKey: 'sidebar.dashboard', icon: Home },
  { id: 'offres', labelKey: 'sidebar.offers', icon: Briefcase },
  { id: 'reglages', labelKey: 'sidebar.settings', icon: Settings },
]

export default function Sidebar() {
  const currentTab = useStore((s) => s.currentTab)
  const setCurrentTab = useStore((s) => s.setCurrentTab)
  const { t } = useT()

  return (
    <aside className="w-72 shrink-0 h-screen flex flex-col border-r border-bordure bg-surface-2 overflow-y-auto">
      <div className="flex items-center gap-3 px-6 pt-6 pb-10">
        <Logo />
        <div>
          <span className="text-xl font-bold text-white tracking-tight">GoJob</span>
          <span className="block text-xs text-text-dim font-medium mt-0.5">Agrégateur d'offres</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map(({ id, labelKey, icon: Icon }) => {
          const active = currentTab === id
          return (
            <button
              key={id}
              onClick={() => setCurrentTab(id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                active
                  ? 'bg-action/15 text-white shadow-sm border border-action/20'
                  : 'text-text-dim hover:text-text hover:bg-surface-3'
              }`}
            >
              <Icon className={`w-6 h-6 shrink-0 ${active ? 'text-action' : ''}`} />
              <span>{t(labelKey)}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
