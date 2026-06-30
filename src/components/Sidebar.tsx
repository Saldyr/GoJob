import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import Logo from './Logo'

/* ── Icônes GoJob v2 — style néon line-gradient ── */

function IconDashboard({ active }: { active: boolean }) {
  const gradId = 'dash-grad'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="22" y2="22">
          <stop offset="0%" stopColor="#9b35ff" />
          <stop offset="60%" stopColor="#315cff" />
          <stop offset="100%" stopColor="#00d9ff" />
        </linearGradient>
      </defs>
      {/* Fenêtre navigateur */}
      <rect x="2" y="4" width="18" height="14" rx="2" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      {/* Points navigateur */}
      <circle cx="5.5" cy="6.5" r="0.8" fill={active ? '#9b35ff' : 'currentColor'} stroke="none" />
      <circle cx="8" cy="6.5" r="0.8" fill={active ? '#315cff' : 'currentColor'} stroke="none" />
      <circle cx="10.5" cy="6.5" r="0.8" fill={active ? '#00d9ff' : 'currentColor'} stroke="none" />
      {/* Donut chart */}
      <path d="M7 15A3.5 3.5 0 0 1 7 8" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      <path d="M7 15A3.5 3.5 0 0 0 10.5 11.5" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      <circle cx="7" cy="11.5" r="1" fill={active ? '#00d9ff' : 'currentColor'} stroke="none" />
      {/* Barres */}
      <rect x="13" y="12" width="2" height="5" rx="0.5" fill={active ? '#9b35ff' : 'currentColor'} stroke="none" />
      <rect x="16" y="9" width="2" height="8" rx="0.5" fill={active ? '#315cff' : 'currentColor'} stroke="none" />
      {/* Lignes texte */}
      <line x1="13" y1="6" x2="18" y2="6" stroke={active ? `url(#${gradId})` : 'currentColor'} opacity="0.3" />
    </svg>
  )
}

function IconOffres({ active }: { active: boolean }) {
  const gradId = 'offre-grad'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="22" y2="22">
          <stop offset="0%" stopColor="#9b35ff" />
          <stop offset="60%" stopColor="#315cff" />
          <stop offset="100%" stopColor="#00d9ff" />
        </linearGradient>
      </defs>
      {/* Mallette / document */}
      <rect x="3" y="6" width="14" height="12" rx="2" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      <path d="M7 6V4.5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 15 4.5V6" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      {/* Lignes d'offres */}
      <line x1="6.5" y1="10" x2="13.5" y2="10" stroke={active ? `url(#${gradId})` : 'currentColor'} opacity="0.5" />
      <line x1="6.5" y1="13" x2="11" y2="13" stroke={active ? `url(#${gradId})` : 'currentColor'} opacity="0.4" />
      {/* Loupe superposée */}
      <circle cx="15" cy="14" r="3.5" stroke={active ? `url(#${gradId})` : 'currentColor'} strokeWidth="1.3" />
      <path d="M17.5 16.5L19 18" stroke={active ? `url(#${gradId})` : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconReglages({ active }: { active: boolean }) {
  const gradId = 'regl-grad'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="22" y2="22">
          <stop offset="0%" stopColor="#9b35ff" />
          <stop offset="60%" stopColor="#315cff" />
          <stop offset="100%" stopColor="#00d9ff" />
        </linearGradient>
      </defs>
      {/* Cercle engrenage extérieur */}
      <circle cx="11" cy="11" r="6" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      {/* 8 dents d'engrenage */}
      <path d="M11 2.5V4" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      <path d="M11 18V19.5" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      <path d="M4.5 4.5L5.5 5.5" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      <path d="M16.5 16.5L17.5 17.5" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      <path d="M2.5 11H4" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      <path d="M18 11H19.5" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      <path d="M4.5 17.5L5.5 16.5" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      <path d="M16.5 5.5L17.5 4.5" stroke={active ? `url(#${gradId})` : 'currentColor'} />
      {/* Anneau intérieur (progression) */}
      <circle cx="11" cy="11" r="3.5" stroke={active ? `url(#${gradId})` : 'currentColor'} strokeDasharray="14 4" opacity="0.5" />
      <circle cx="11" cy="11" r="1.5" fill={active ? '#00d9ff' : 'currentColor'} fillOpacity={active ? '0.4' : '0.2'} stroke="none" />
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
            Dénicheur d'opportunités
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

              {/* Indicateur latéral actif — dégradé violet→bleu→cyan */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-[#9b35ff] via-[#315cff] to-[#00d9ff] shadow-[0_0_8px_rgba(0,217,255,0.35)]" />
              )}

              {/* Icône */}
              <span className="relative shrink-0 w-[22px] h-[22px] flex items-center justify-center">
                <Icon active={active} />
              </span>

              {/* Label */}
              <span className="relative">{t(labelKey)}</span>

              {/* Badge "actif" subtil — glow cyan */}
              {active && (
                <span className="relative ml-auto w-1.5 h-1.5 rounded-full bg-[#00d9ff] shadow-[0_0_8px_rgba(0,217,255,0.6)]" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Signature discrète en bas */}
      <div className="relative z-10 px-6 pb-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border-glass to-transparent mb-4" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9b35ff] to-[#00d9ff] flex items-center justify-center">
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
