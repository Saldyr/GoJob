export default function Logo({
  className = 'w-11 h-11',
  glow = true,
}: {
  className?: string
  glow?: boolean
}) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_18px_rgba(177,78,255,0.20)] drop-shadow-[0_0_22px_rgba(34,211,238,0.15)]' : ''}`}
    >
      <defs>
        <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111322" />
          <stop offset="100%" stopColor="#090A12" />
        </linearGradient>
        <linearGradient id="g-grad" x1="0.15" y1="0.0" x2="0.85" y2="1.0">
          <stop offset="0%" stopColor="#B14EFF" />
          <stop offset="35%" stopColor="#7C3AED" />
          <stop offset="60%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <filter id="logo-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#B14EFF" floodOpacity="0.20" />
          <feDropShadow dx="0" dy="0" stdDeviation="11" floodColor="#22D3EE" floodOpacity="0.15" />
        </filter>
      </defs>

      <rect x="0" y="0" width="96" height="96" rx="21" fill="url(#bg-grad)" />
      <rect x="1" y="1" width="94" height="94" rx="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      <g filter={glow ? 'url(#logo-glow)' : undefined}>
        <line x1="79.9" y1="69.4"
              x2="66.0" y2="59.6"
              stroke="url(#g-grad)" strokeWidth="7" strokeLinecap="round" />

        <path d="M 66.0 59.6
                 A 22 22 0 1 1 69.7 50.8"
              stroke="url(#g-grad)" strokeWidth="7" strokeLinecap="round" />

        <line x1="69.7" y1="50.8"
              x2="53.7" y2="50.8"
              stroke="url(#g-grad)" strokeWidth="7" strokeLinecap="round" />
      </g>
    </svg>
  )
}
