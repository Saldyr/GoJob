import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, KeyRound, Rocket, ArrowRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { LogoMark } from './ui/LogoMark'
import { Bouton } from './ui/Bouton'

const SLIDES = [
  {
    Icon: Sparkles,
    titre: 'Bienvenue sur GoJob',
    texte:
      "Ton dénicheur d'opportunités. GoJob réunit les offres de France Travail, Adzuna, Jooble, ta boîte mail et bien d'autres — au même endroit.",
  },
  {
    Icon: KeyRound,
    titre: 'Connecte tes sources',
    texte:
      "Ajoute tes clés API gratuites dans Paramètres (France Travail, Adzuna, Jooble, Reed…). Chaque source activée alimente ton tableau de bord.",
  },
  {
    Icon: Rocket,
    titre: 'Lance-toi',
    texte:
      'Rafraîchis, filtre par mots-clés, contrat ou localisation, et retrouve toutes tes offres réunies. Bonne chasse !',
  },
]

export default function Onboarding() {
  const updateSettings = useStore((s) => s.updateSettings)
  const setCurrentTab = useStore((s) => s.setCurrentTab)
  const [i, setI] = useState(0)
  const dernier = i === SLIDES.length - 1
  const slide = SLIDES[i]
  const Icon = slide.Icon

  const terminer = (versReglages: boolean) => {
    updateSettings({ onboardingVu: true })
    if (versReglages) setCurrentTab('reglages')
  }

  return (
    <div className="fixed inset-0 z-50 nebula-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-3xl border border-border-glass bg-surface-2 bg-gradient-to-br from-surface-glass-2 to-surface-glass shadow-glass p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <LogoMark size={52} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-action/15 border border-action/30 flex items-center justify-center">
              <Icon className="w-7 h-7 text-action" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{slide.titre}</h2>
            <p className="text-sm text-text-dim leading-relaxed">{slide.texte}</p>
          </motion.div>
        </AnimatePresence>

        {/* Points de progression */}
        <div className="flex items-center justify-center gap-2 my-7">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? 'w-6 bg-gradient-to-r from-[#9b35ff] to-[#00d9ff]' : 'w-1.5 bg-white/15'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => terminer(false)}
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            Passer
          </button>
          {dernier ? (
            <Bouton variant="primaire" onClick={() => terminer(true)} className="justify-center">
              Configurer mes sources <ArrowRight className="w-4 h-4" />
            </Bouton>
          ) : (
            <Bouton variant="primaire" onClick={() => setI(i + 1)} className="justify-center">
              Suivant <ArrowRight className="w-4 h-4" />
            </Bouton>
          )}
        </div>
      </motion.div>
    </div>
  )
}
