import type { Offre } from '../../store/useStore'

const styles: Record<string, string> = {
  a_postuler: 'bg-action/10 text-action-vif border border-action/15',
  postulee: 'bg-electric/10 text-electric border border-electric/15',
  relancee: 'bg-ambre-warn/10 text-ambre-warn border border-ambre-warn/15',
  entretien: 'bg-vert/10 text-vert border border-vert/15',
  refus: 'bg-rouge-error/10 text-rouge-error border border-rouge-error/15',
  acceptee: 'bg-vert/15 text-vert border border-vert/20',
}

const labels: Record<string, string> = {
  a_postuler: 'À postuler', postulee: 'Postulée', relancee: 'Relancée',
  entretien: 'Entretien', refus: 'Refus', acceptee: 'Acceptée',
}

export function StatutBadge({ statut }: { statut: Offre['statut'] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${styles[statut] || styles.a_postuler}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statut === 'acceptee' ? 'bg-vert' : statut === 'refus' ? 'bg-rouge-error' : 'bg-current'}`} />
      {labels[statut] || statut}
    </span>
  )
}
