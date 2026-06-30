import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import Logo from './Logo'

/* ── Icônes custom (pas Lucide) ── */

function IconDashboard({ active }: { active: boolean }) {
  const color = active ? '#A855F7' : 'currentColor'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="8" height="8" rx="2" />
      <rect x="12" y="2" width="8" height="8" rx="2" />
      <rect x="2" y="12" width="8" height="8" rx="2" />
      <rect x="12" y="12" width="8" height="8" rx="2" fill={active ? '#A855F7' : 'none'} fillOpacity="0.1" />
    </svg>
  )
}

function IconOffres({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? '#A855F7' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="16" height="18" rx="3" />
      <line x1="7" y1="7" x2="15" y2="7" opacity="0.6" />
      <line x1="7" y1="11" x2="15" y2="11" opacity="0.4" />
      <line x1="7" y1="15" x2="12" y2="15" opacity="0.4" />
      {active && (
        <circle cx="17" cy="17" r="4" fill="#A855F7" fillOpacity="0.15" stroke="none" />
      )}
    </svg>
  )
}

function IconReglages({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? '#A855F7' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="3" />
      <path d="M11 1.5V4" opacity="0.5" />
      <path d="M11 18V20.5" opacity="0.5" />
      <path d="M4.5 11H2" opacity="0.5" />
      <path d="M20 11H17.5" opacity="0.5" />
      <path d="M5.5 5.5L4 4" opacity="0.4" />
      <path d="M18 18L16.5 16.5" opacity="0.4" />
      <path d="M16.5 5.5L18 4" opacity="0.4" />
      <path d="M5.5 16.5L4 18" opacity="0.4" />
    </svg>
  )
}

const NAV_ITEMS: { id: string; labelKey: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'accueil', labelKey: 'sidebar.dashboard', Icon: IconDashboard },
  { id: 'offres', labelKey: 'sidebar.offers', Icon: IconOffres },
  { id: 'reglages', labelKey: 'sidebar.settings', Icon: IconReglages },
]

export default function Sidebar() {
  const currentTab = useStore((s) => s.currentTab)
  const setCurrentTab = useStore((s) => s.setCurrentTab)
  const { t } = useT()

  return (
    <aside className="w-72 shrink-0 h-screen flex flex-col overflow-hidden nebula-bg">
      {/* Glass overlay pour la sidebar */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-glass-2 via-transparent to-surface-glass pointer-events-none" />

      {/* Logo + titre */}
      <div className="relative z-10 flex items-center gap-3 px-6 pt-7 pb-8">
        <Logo />
        <div>
          <span className="text-xl font-bold text-white tracking-tight">
            GoJob
          </span>
          <span className="block text-xs text-text-dim font-medium mt-0.5 tracking-wide">
            Agrégateur d'offres
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-4 space-y-1.5">
        {NAV_ITEMS.map(({ id, labelKey, Icon }) => {
          const active = currentTab === id
          return (
            <button
              key={id}
              onClick={() => setCurrentTab(id)}
              className={`
                group relative w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-300
                ${active
                  ? 'text-white'
                  : 'text-text-dim hover:text-text'
                }
              `}
            >
              {/* Fond actif avec glass */}
              {active && (
                <span className="absolute inset-0 rounded-xl glass-card animate-scaleIn" />
              )}

              {/* Hover fill */}
              {!active && (
                <span className="absolute inset-0 rounded-xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}

              {/* Indicateur latéral actif */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-nebula-2 to-nebula-3 shadow-glow-violet" />
              )}

              {/* Icône */}
              <span className="relative shrink-0 w-[22px] h-[22px] flex items-center justify-center">
                <Icon active={active} />
              </span>

              {/* Label */}
              <span className="relative">{t(labelKey)}</span>

              {/* Badge "actif" subtil */}
              {active && (
                <span className="relative ml-auto w-1.5 h-1.5 rounded-full bg-nebula-2 shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Signature discrète en bas */}
      <div className="relative z-10 px-6 pb-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border-glass to-transparent mb-4" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-nebula-2 to-nebula-3 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 96 96" fill="none">
              <path d="M32 48C32 35 42 25 55 25C62 25 68 27.5 73 32L66 39C62.5 36 59 34 55 34C47.5 34 41 40 41 48C41 56 47.5 62 55 62C60 62 64 60 67 57H55V49H74V56C70 63 63 68 55 68C42 68 32 58 32 48Z" fill="white" />
            </svg>
          </div>
          <span className="text-[11px] text-text-dim tracking-wider uppercase font-medium">GoJob v1.0</span>
        </div>
      </div>
    </aside>
  )
}
