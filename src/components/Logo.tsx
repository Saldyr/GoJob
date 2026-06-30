export default function Logo({ className = 'w-11 h-11' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="96" y2="96">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="24" fill="url(#logo-bg)" />
      <path
        d="M32 48C32 35 42 25 55 25C62 25 68 27.5 73 32L66 39C62.5 36 59 34 55 34C47.5 34 41 40 41 48C41 56 47.5 62 55 62C60 62 64 60 67 57H55V49H74V56C70 63 63 68 55 68C42 68 32 58 32 48Z"
        fill="white"
      />
      <path
        d="M28 26L14 14"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="14" cy="14" r="2.5" fill="white" opacity="0.4" />
    </svg>
  )
}
