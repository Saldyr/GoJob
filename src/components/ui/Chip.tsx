export function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-action/10 text-action-vif text-sm px-3 py-1.5 rounded-xl font-medium border border-action/15">
      {label}
      <button onClick={onRemove} className="hover:text-rouge-error transition-colors ml-0.5 text-text-dim hover:text-text">&times;</button>
    </span>
  )
}
