// Chip : tag avec bouton de suppression
export function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-ambre/10 text-action text-sm px-3 py-1 rounded-xl font-medium">
      {label}
      <button type="button" onClick={onRemove} className="hover:text-rouge-error transition-colors ml-1 text-xs">&times;</button>
    </span>
  )
}
