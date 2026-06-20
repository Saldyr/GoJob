// StatutBadge : badge de statut coloré (utilisé par OngletSuivi)
import type { Offre } from '../../store/useStore'

const styles: Record<string, string> = {
  postulee: 'bg-sable/20 text-cacao',
  relancee: 'bg-ambre/10 text-action',
  entretien: 'bg-vert-success/10 text-vert-success',
  refus: 'bg-rouge-error/10 text-rouge-error',
  acceptee: 'bg-vert-success/20 text-vert-success',
  a_postuler: 'bg-taupe/10 text-taupe',
}

const labels: Record<string, string> = {
  postulee: 'Postulée', relancee: 'Relancée', entretien: 'Entretien',
  refus: 'Refus', acceptee: 'Acceptée', a_postuler: 'À postuler',
}

export function StatutBadge({ statut }: { statut: Offre['statut'] }) {
  return (
    <span className={`text-sm px-3 py-1 rounded-lg font-medium ${styles[statut] || ''}`}>
      {labels[statut] || statut}
    </span>
  )
}
