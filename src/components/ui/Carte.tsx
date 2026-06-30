export function Carte({
  titre,
  icone,
  children,
  className = '',
  hover = false,
}: {
  titre?: string
  icone?: React.ReactNode
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <section
      className={`
        relative rounded-2xl
        bg-gradient-to-br from-surface-glass-2 to-surface-glass
        backdrop-blur-[16px]
        border border-border-glass
        shadow-glass
        p-6 lg:p-8
        ${hover ? 'transition-all duration-300 hover:border-border-glass-hover hover:shadow-glass-lg hover:shadow-glow-violet hover:-translate-y-[1px]' : ''}
        ${className}
      `}
    >
      {/* Subtle top shine */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent rounded-t-2xl pointer-events-none" />

      {titre && (
        <div className="flex items-center gap-2.5 mb-5">
          {icone && <span className="text-nebula-2">{icone}</span>}
          <h2>{titre}</h2>
        </div>
      )}
      {children}
    </section>
  )
}
