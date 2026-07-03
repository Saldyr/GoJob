import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { IconDashboard, IconOffres, IconParametres } from './ui/NavIcons'
import { LogoMark } from './ui/LogoMark'

type NavItem = { id: string; labelKey: string; Icon: React.FC<{ active?: boolean; size?: number }> }

// Navigation principale (haut) et réglages (bas)
const NAV_TOP: NavItem[] = [
  { id: 'accueil', labelKey: 'sidebar.dashboard', Icon: IconDashboard },
  { id: 'offres', labelKey: 'sidebar.offers', Icon: IconOffres },
]
const NAV_REGLAGES: NavItem = { id: 'reglages', labelKey: 'sidebar.settings', Icon: IconParametres }

export default function Sidebar() {
  const currentTab = useStore((s) => s.currentTab)
  const setCurrentTab = useStore((s) => s.setCurrentTab)
  const { t } = useT()

  const renderNav = ({ id, labelKey, Icon }: NavItem) => {
    const active = currentTab === id
    return (
      <button
        key={id}
        onClick={() => setCurrentTab(id)}
        className={`
          group relative w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm
          transition-all duration-150
          ${active ? 'text-white font-semibold' : 'text-text-dim font-medium hover:text-text'}
        `}
      >
        {/* Fond actif — glass */}
        {active && <span className="absolute inset-0 rounded-xl glass-card animate-scaleIn" />}

        {/* Hover fill (inactif) */}
        {!active && (
          <span className="absolute inset-0 rounded-xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        )}

        {/* Indicateur latéral actif — dégradé violet→cyan */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-[#9b35ff] to-[#00d9ff] shadow-[0_0_8px_rgba(0,217,255,0.35)]" />
        )}

        {/* Icône (dégradé si actif, gris discret sinon) */}
        <span className="relative shrink-0 w-6 h-6 flex items-center justify-center">
          <Icon active={active} size={22} />
        </span>

        {/* Label */}
        <span className="relative">{t(labelKey)}</span>
      </button>
    )
  }

  return (
    <aside className="w-72 shrink-0 h-full flex flex-col overflow-hidden">

      {/* Logo + titre — padding haut réduit : la bande de titre (40px) fournit déjà l'espace du haut */}
      <div className="relative z-10 flex items-center gap-3 px-6 pt-2 pb-6">
        <LogoMark size={40} className="shrink-0" />
        <div>
          <span className="text-xl font-bold tracking-tight text-white">
            Go<span className="bg-gradient-to-r from-[#9b35ff] to-[#00d9ff] bg-clip-text text-transparent">Job</span>
          </span>
          <span className="block text-xs text-text-dim font-medium mt-0.5 tracking-wide">
            Dénicheur d'opportunités
          </span>
        </div>
      </div>

      {/* Navigation principale (haut) — flex-1 pousse Paramètres + signature en bas */}
      <nav className="relative z-10 flex-1 px-4 space-y-1.5">
        {NAV_TOP.map(renderNav)}
      </nav>

      {/* Paramètres — descendu en bas, au-dessus de la signature (avec de l'espace) */}
      <nav className="relative z-10 px-4 pb-4">
        {renderNav(NAV_REGLAGES)}
      </nav>

      {/* Signature discrète en bas */}
      <div className="relative z-10 px-6 pb-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border-glass to-transparent mb-5" />
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#9b35ff] to-[#00d9ff] shadow-[0_0_8px_rgba(155,53,255,0.6)] shrink-0" />
          <span className="text-[11px] text-text-dim tracking-[0.2em] uppercase font-medium">GoJob v1.0</span>
        </div>
      </div>
    </aside>
  )
}
