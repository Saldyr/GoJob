import { useId } from 'react'

// Champ de formulaire (input ou textarea)
export function Champ({ valeur, onChange, placeholder, type, rows, label }: {
  valeur: string; onChange: (v: string) => void; placeholder: string; type?: string; rows?: number; label?: string
}) {
  const id = useId()
  const cls = "w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/70 focus:outline-none focus:ring-2 focus:ring-action/50 transition-all"
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-cacao mb-1.5">{label}</label>}
      {rows
        ? <textarea id={id} value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${cls} resize-y`} />
        : <input id={id} value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type || 'text'} className={cls} />
      }
    </div>
  )
}
