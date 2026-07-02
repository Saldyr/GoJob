import { motion } from 'framer-motion'
import { Building2, MapPin, Globe, Clock, ExternalLink } from 'lucide-react'
import type { Offre } from '../../store/useStore'
import { ancienneteLong } from '../../utils/offres'

function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/)
  if (mots.length >= 2) return (mots[0][0] + mots[1][0]).toUpperCase()
  return nom.slice(0, 2).toUpperCase()
}

interface CarteOffreProps {
  offre: Offre
  onOpen?: (url?: string) => void
  /** Résout le libellé du type de contrat (i18n). Fallback : la valeur brute. */
  contratLabel?: (type: string) => string
}

/** Chip neutre en verre — pour salaire, tags, méta. */
const chipNeutre =
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium ' +
  'bg-white/[0.04] text-text-dim border border-white/10'

export function CarteOffre({ offre, onOpen, contratLabel }: CarteOffreProps) {
  const label = (t: string) => (contratLabel ? contratLabel(t) : t)

  return (
    <motion.article
      onClick={() => onOpen?.(offre.url)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2 }}
      className="group relative cursor-pointer rounded-2xl p-5
                 bg-surface-2 border border-white/[0.08]
                 shadow-[0_8px_32px_rgba(0,0,0,0.45)]
                 transition-[border-color,box-shadow] duration-200
                 hover:border-white/[0.16]
                 hover:shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_28px_rgba(155,53,255,0.14)]"
    >
      {/* Liseré clair en haut (effet verre) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl
                      bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

      <div className="flex items-start gap-3.5">
        {/* Avatar entreprise — tuile verre unifiée + liseré Nebula (fini le RGB random) */}
        <div className="shrink-0 grid h-12 w-12 place-items-center rounded-xl
                        bg-[linear-gradient(135deg,rgba(155,53,255,0.18),rgba(0,217,255,0.12))]
                        border border-white/10 text-white font-bold text-base">
          {initiales(offre.entreprise)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-white font-semibold text-[17px] leading-tight truncate">
            {offre.titre}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-text-dim">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> {offre.entreprise}
            </span>
            {offre.ville && (
              <span className="inline-flex items-center gap-1.5 text-text-muted">
                <MapPin className="h-3.5 w-3.5" /> {offre.ville}
              </span>
            )}
          </div>
        </div>

        {offre.url && (
          <ExternalLink className="h-4 w-4 shrink-0 text-text-muted transition-colors
                                   group-hover:text-action-vif" />
        )}
      </div>

      {/* Badges — 2 accents seulement : violet (contrat) + cyan (remote), reste neutre */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {offre.typeContrat && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold
                           bg-action/15 text-action border border-action/25">
            {label(offre.typeContrat)}
          </span>
        )}
        {offre.remote && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium
                           bg-[rgba(0,217,255,0.12)] text-[#7fe9ff] border border-[rgba(0,217,255,0.25)]">
            <Globe className="h-3 w-3" /> Remote
          </span>
        )}
        {offre.salaire && <span className={chipNeutre}>{offre.salaire}</span>}
        {offre.tags?.slice(0, 4).map((tag) => (
          <span key={tag} className={chipNeutre}>{tag}</span>
        ))}
      </div>

      {/* Pied — méta discrète */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
        {offre.dateAjout && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {ancienneteLong(offre.dateAjout)}
          </span>
        )}
        {offre.source && <span className="opacity-70">· {offre.source}</span>}
        {offre.url && (
          <span className="ml-auto inline-flex items-center gap-1 font-medium text-text-dim
                           transition-colors group-hover:text-action-vif">
            Voir l'offre <ExternalLink className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </motion.article>
  )
}
