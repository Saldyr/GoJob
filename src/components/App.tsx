import { useStore } from '../store/useStore'
import Sidebar from './Sidebar'
import Onboarding from './Onboarding'
import OngletAccueil from './OngletAccueil'
import OngletOffres from './OngletOffres'
import OngletCandidater from './OngletCandidater'
import OngletSuivi from './OngletSuivi'
import OngletProfil from './OngletProfil'
import OngletReglages from './OngletReglages'

export default function App() {
  const currentTab = useStore((s) => s.currentTab)
  const onboardingDone = useStore((s) => s.onboardingDone)

  return (
    <div className="flex h-screen bg-creme">
      {!onboardingDone && <Onboarding />}
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {currentTab === 'accueil' && <OngletAccueil />}
          {currentTab === 'offres' && <OngletOffres />}
          {currentTab === 'postuler' && <OngletCandidater />}
          {currentTab === 'suivi' && <OngletSuivi />}
          {currentTab === 'profil' && <OngletProfil />}
          {currentTab === 'reglages' && <OngletReglages />}
        </div>
      </main>
    </div>
  )
}
