import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import Sidebar from './Sidebar'
import Onboarding from './Onboarding'
import OngletAccueil from './OngletAccueil'
import OngletOffres from './OngletOffres'
import OngletCandidater from './OngletCandidater'
import OngletSuivi from './OngletSuivi'
import OngletProfil from './OngletProfil'
import OngletReglages from './OngletReglages'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
}

const composants: Record<string, React.ElementType> = {
  accueil: OngletAccueil, offres: OngletOffres, postuler: OngletCandidater,
  suivi: OngletSuivi, profil: OngletProfil, reglages: OngletReglages,
}

export default function App() {
  const currentTab = useStore((s) => s.currentTab)
  const onboardingDone = useStore((s) => s.onboardingDone)

  if (!onboardingDone) return <Onboarding />

  const Composant = composants[currentTab] || OngletAccueil

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 2xl:p-10 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div key={currentTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Composant />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
