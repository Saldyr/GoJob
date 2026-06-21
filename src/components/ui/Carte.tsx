export function Carte({ titre, icone, children, className = '' }: { titre: string; icone?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-bordure bg-surface-2 p-6 lg:p-8 shadow-sm card-hover ${className}`}>
      {titre && (
        <div className="flex items-center gap-2.5 mb-5">
          {icone && <span className="text-action">{icone}</span>}
          <h2>{titre}</h2>
        </div>
      )}
      {children}
    </section>
  )
}
