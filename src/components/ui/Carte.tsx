export function Carte({
  titre,
  icone,
  actions,
  children,
  className = '',
  hover = false,
  footer,
}: {
  titre?: string
  icone?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  hover?: boolean
  footer?: React.ReactNode
}) {
  return (
    <section
      className={`
        relative rounded-2xl
        bg-surface-2 bg-gradient-to-br from-surface-glass-2 to-surface-glass
        border border-border-glass
        shadow-glass
        p-6 lg:p-8
        flex flex-col h-full
        ${hover ? 'transition-all duration-150 hover:border-border-glass-hover hover:shadow-glass-lg hover:shadow-glow-violet hover:-translate-y-[1px]' : ''}
        ${className}
      `}
    >
      {/* Subtle top shine */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent rounded-t-2xl pointer-events-none" />

      {(titre || actions) && (
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5 min-w-0">
            {icone && <span className="text-nebula-2">{icone}</span>}
            {titre && <h2 className="truncate">{titre}</h2>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className="flex-1">{children}</div>
      {footer && <div className="mt-auto pt-4">{footer}</div>}
    </section>
  )
}
