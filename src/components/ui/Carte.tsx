// Carte : section avec titre et icône optionnelle
export function Carte({ titre, icone, children }: { titre: string; icone?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border border-bordure shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        {icone && <span className="text-action">{icone}</span>}
        <h2 className="text-lg font-semibold text-cacao">{titre}</h2>
      </div>
      {children}
    </section>
  )
}
