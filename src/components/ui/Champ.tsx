import { useId } from 'react'

export function Champ({ valeur, onChange, placeholder, type, rows, label }: {
  valeur: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  rows?: number
  label?: string
}) {
  const id = useId()
  const base = 'w-full px-4 py-3 rounded-xl border border-bordure bg-surface-3 text-text text-sm placeholder:text-text-muted/60 focus:border-action focus:ring-1 focus:ring-action/30 transition-all'

  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-text-dim mb-1.5">{label}</label>}
      {rows ? (
        <textarea id={id} value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${base} resize-y min-h-[100px]`} />
      ) : (
        <input id={id} value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type || 'text'} className={base} />
      )}
    </div>
  )
}
