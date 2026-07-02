import { motion } from 'framer-motion'

export type SegmentPlateforme = {
  key: string
  label: string
  value: number
  color: string
}

/**
 * Donut des plateformes : chaque plateforme = un arc dont la couleur lui est propre
 * et la longueur est proportionnelle au nombre d'offres. Bords nets + petit écart
 * régulier = bandes de couleur bien séparées. Tri décroissant (gros arcs d'abord).
 * Total au centre, légende cliquable (pastille · nom · % · nombre) à droite.
 */
export function DonutPlateformes({
  segments,
  total,
  onSelect,
  centerLabel = 'offres',
}: {
  segments: SegmentPlateforme[]
  total: number
  onSelect?: (key: string) => void
  centerLabel?: string
}) {
  const ordered = [...segments].sort((a, b) => b.value - a.value)
  const sum = ordered.reduce((a, s) => a + s.value, 0) || 1
  const GAP = 1.8 // écart net (en %) entre deux arcs
  const MIN = 1.2 // longueur minimale visible d'un segment non-nul
  const R = 64
  const STROKE = 12

  let acc = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-10">
      {/* Donut */}
      <motion.div
        className="relative shrink-0"
        style={{ width: 200, height: 200 }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <svg viewBox="0 0 160 160" width={200} height={200} style={{ transform: 'rotate(-90deg)' }}>
          {/* Piste de fond */}
          <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth={STROKE} />
          {ordered.map((s, i) => {
            const pct = (s.value / sum) * 100
            const offset = -acc
            acc += pct
            if (s.value <= 0) return null
            // longueur = part - écart, au moins MIN (visible) et jamais plus que sa part (pas de chevauchement)
            const seg = Math.min(Math.max(pct - GAP, MIN), pct)
            return (
              <motion.circle
                key={s.key}
                cx="80"
                cy="80"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeLinecap="butt"
                pathLength={100}
                strokeDasharray={`${seg} ${100 - seg}`}
                initial={{ strokeDashoffset: offset + 10 }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: [0.4, 0, 0.2, 1] }}
                style={{ filter: `drop-shadow(0 0 4px ${s.color}44)` }}
              />
            )
          })}
        </svg>
        {/* Centre : total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-white leading-none tabular-nums">{total}</span>
          <span className="text-xs text-text-dim mt-1.5">{centerLabel}</span>
        </div>
      </motion.div>

      {/* Légende — triée décroissante, alignée */}
      <div className="flex-1 w-full flex flex-col gap-0.5">
        {ordered.map((s) => {
          const pct = Math.round((s.value / sum) * 100)
          return (
            <button
              key={s.key}
              onClick={() => onSelect?.(s.key)}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.04] transition-colors text-left"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }}
              />
              <span className="text-sm text-text-dim group-hover:text-text transition-colors flex-1 truncate">
                {s.label}
              </span>
              <span className="text-xs text-text-muted w-11 text-right tabular-nums">{pct}%</span>
              <span className="text-sm font-semibold text-white w-14 text-right tabular-nums">{s.value}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
