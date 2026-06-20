// Champ de formulaire (input ou textarea)
export function Champ({ valeur, onChange, placeholder, type, rows }: {
  valeur: string; onChange: (v: string) => void; placeholder: string; type?: string; rows?: number
}) {
  const cls = "w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-action/30 transition-all"
  if (rows) return <textarea value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${cls} resize-y`} />
  return <input value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type || 'text'} className={cls} />
}
