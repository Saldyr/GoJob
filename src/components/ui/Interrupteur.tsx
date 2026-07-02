import { motion } from 'framer-motion'

/** Interrupteur on/off — libellé d'état lisible + piste dégradée Nebula quand actif. */
export function Interrupteur({
  actif,
  onChange,
  label,
}: {
  actif: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <span className={`text-xs font-semibold ${actif ? 'text-electric' : 'text-text-muted'}`}>
        {actif ? 'Activé' : 'Désactivé'}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        aria-label={label}
        onClick={() => onChange(!actif)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
          actif
            ? 'bg-[linear-gradient(120deg,#9b35ff,#6d5cff,#00d9ff)] shadow-[0_0_10px_rgba(123,60,255,0.35)]'
            : 'bg-white/[0.06] border border-white/15'
        }`}
      >
        <motion.span
          className={`absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full shadow-sm ${actif ? 'bg-white' : 'bg-white/55'}`}
          animate={{ x: actif ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}
