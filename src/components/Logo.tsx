export default function Logo({ className = 'w-11 h-11', glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_12px_rgba(124,58,237,0.35)]' : ''}`}
    >
      <defs>
        <linearGradient id="g-bg" x1="0" y1="0" x2="96" y2="96">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="45%" stopColor="#A855F7" />
          <stop offset="80%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="g-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="logo-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#7C3AED" floodOpacity="0.4" />
        </filter>
        <clipPath id="g-clip">
          <rect width="96" height="96" rx="24" />
        </clipPath>
      </defs>

      {/* Base glass card */}
      <rect width="96" height="96" rx="24" fill="url(#g-bg)" />

      {/* Inner glass overlay */}
      <rect width="96" height="96" rx="24" fill="url(#g-shine)" opacity="0.3" />

      {/* Border glow filter */}
      <rect
        x="1.5"
        y="1.5"
        width="93"
        height="93"
        rx="22.5"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />

      {/* G letter */}
      <g filter="url(#logo-glow)">
        <path
          d="M32 48C32 35 42 25 55 25C61.5 25 67.5 27.5 72 31.5L66 38.5C62.5 35.5 59 34 55 34C47.5 34 41 40 41 48C41 56 47.5 62 55 62C59.5 62 63.5 60 66.5 57.5L55 57V49H73.5V56C69.5 63 62.5 68 55 68C42 68 32 58 32 48Z"
          fill="white"
        />
      </g>

      {/* Trajectory arc */}
      <path
        d="M28 24L12 10"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
        filter="url(#logo-glow)"
      />
      <circle cx="12" cy="10" r="3" fill="#06B6D4" opacity="0.8" />
      <circle cx="12" cy="10" r="6" fill="#06B6D4" opacity="0.15" />

      {/* Inner sparkle */}
      <circle cx="63" cy="33" r="2" fill="white" opacity="0.6" />
      <circle cx="68" cy="29" r="1.2" fill="white" opacity="0.4" />
    </svg>
  )
}
