export default function Logo({ className = 'w-11 h-11', glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_18px_rgba(155,53,255,0.45)] drop-shadow-[0_0_24px_rgba(0,217,255,0.25)]' : ''}`}
    >
      <defs>
        <linearGradient id="g-grad" x1="0" y1="0" x2="96" y2="96">
          <stop offset="0%" stopColor="#9b35ff" />
          <stop offset="55%" stopColor="#315cff" />
          <stop offset="100%" stopColor="#00d9ff" />
        </linearGradient>
        <linearGradient id="g-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="logo-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#9b35ff" floodOpacity="0.5" />
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#00d9ff" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Base squircle — fond très sombre */}
      <rect width="96" height="96" rx="24" fill="#111225" />

      {/* Inner glass shine */}
      <rect width="96" height="96" rx="24" fill="url(#g-shine)" />

      {/* Subtle border */}
      <rect x="1.5" y="1.5" width="93" height="93" rx="22.5" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {/* G + loupe */}
      <g filter="url(#logo-glow)">
        {/* Cercle principal — corps du G / lentille de la loupe */}
        <circle cx="46" cy="46" r="25" stroke="url(#g-grad)" strokeWidth="5.5" fill="none" />

        {/* Barre transversale du G (de la droite vers le centre) */}
        <line x1="46" y1="46" x2="69" y2="46" stroke="url(#g-grad)" strokeWidth="5.5" strokeLinecap="round" />

        {/* Poignée de la loupe (45°, séparée par un gap) */}
        <line x1="67" y1="67" x2="77" y2="77" stroke="url(#g-grad)" strokeWidth="4.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}
