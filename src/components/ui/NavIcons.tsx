/**
 * Icônes de navigation GoJob — style Nebula.
 * `active` → dégradé violet→cyan. Sinon → couleur héritée (currentColor), pour un état discret.
 */
interface IconProps {
  size?: number
  active?: boolean
  className?: string
}

const GRAD = (id: string) => (
  <defs>
    <linearGradient id={id} x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
      <stop stopColor="#9b35ff" />
      <stop offset="1" stopColor="#00d9ff" />
    </linearGradient>
  </defs>
)

function svgProps(size: number, active: boolean, id: string, className: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: active ? `url(#${id})` : 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }
}

export function IconDashboard({ size = 22, active = false, className = '' }: IconProps) {
  return (
    <svg {...svgProps(size, active, 'grad-dash', className)}>
      {GRAD('grad-dash')}
      {/* fenêtre + donut + barres (comme l'icône fournie) */}
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <path d="M2.5 8h19" />
      <circle cx="5.3" cy="6" r="0.55" />
      <circle cx="7.3" cy="6" r="0.55" />
      <circle cx="9.3" cy="6" r="0.55" />
      <circle cx="7.5" cy="14" r="2.9" />
      <path d="M13 12h6" />
      <path d="M13 14.3h4" />
      <path d="M13.5 18v-1.6" />
      <path d="M16 18v-3.2" />
      <path d="M18.5 18v-2.2" />
    </svg>
  )
}

export function IconOffres({ size = 22, active = false, className = '' }: IconProps) {
  return (
    <svg {...svgProps(size, active, 'grad-offres', className)}>
      {GRAD('grad-offres')}
      <rect x="2.5" y="7" width="19" height="13" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2.5 12h19" />
    </svg>
  )
}

export function IconParametres({ size = 22, active = false, className = '' }: IconProps) {
  return (
    <svg {...svgProps(size, active, 'grad-params', className)}>
      {GRAD('grad-params')}
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
