import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import Sidebar from './Sidebar'
import OngletAccueil from './OngletAccueil'
import OngletOffres from './OngletOffres'
import OngletReglages from './OngletReglages'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
}

const composants: Record<string, React.ElementType> = {
  accueil: OngletAccueil, offres: OngletOffres, reglages: OngletReglages,
}

export default function App() {
  const currentTab = useStore((s) => s.currentTab)
  const updateSettings = useStore((s) => s.updateSettings)

  // Charger les secrets + auto-connexion FT (dans l'ordre)
  useEffect(() => {
    ;(async () => {
      // 1. Charger les secrets depuis safeStorage
      if (window.electronAPI?.chargerSecrets) {
        try {
          const secrets = await window.electronAPI.chargerSecrets()
          if (secrets && typeof secrets === 'object') {
            const toUpdate: Record<string, string> = {}
            if (secrets.cleApi) toUpdate.cleApi = secrets.cleApi
            if (secrets.franceTravailClientId) toUpdate.franceTravailClientId = secrets.franceTravailClientId
            if (secrets.franceTravailClientSecret) toUpdate.franceTravailClientSecret = secrets.franceTravailClientSecret
            if (secrets.imapUser) toUpdate.imapUser = secrets.imapUser
            if (secrets.imapPassword) toUpdate.imapPassword = secrets.imapPassword
            if (secrets.adzunaAppId) toUpdate.adzunaAppId = secrets.adzunaAppId
            if (secrets.adzunaAppKey) toUpdate.adzunaAppKey = secrets.adzunaAppKey
            if (secrets.joobleKey) toUpdate.joobleKey = secrets.joobleKey
            if (secrets.reedKey) toUpdate.reedKey = secrets.reedKey
            if (Object.keys(toUpdate).length) updateSettings(toUpdate)
          }
        } catch { /* silencieux */ }
      }

      // 2. Auto-connexion France Travail (après chargement des secrets)
      const s = useStore.getState().settings
      if (s.franceTravailClientId && s.franceTravailClientSecret && window.electronAPI?.franceTravailConnect) {
        try {
          await window.electronAPI.franceTravailConnect({
            clientId: s.franceTravailClientId,
            clientSecret: s.franceTravailClientSecret,
          })
        } catch { /* silencieux */ }
      }
    })()
    // Effet de montage uniquement (chargement initial des secrets + auto-connexion)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const Composant = composants[currentTab] || OngletAccueil

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
          <AnimatePresence mode="wait">
            <motion.div key={currentTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Composant />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
