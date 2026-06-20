import React from 'react'
import { useStore } from '../store/useStore'
import {
  Home, Briefcase, FileEdit, ClipboardList,
  User, Settings, Info, Sparkles
} from 'lucide-react'

const NAV_ITEMS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: 'accueil', label: 'Accueil', icon: Home },
  { id: 'offres', label: 'Mes offres', icon: Briefcase },
  { id: 'postuler', label: 'Postuler', icon: FileEdit },
  { id: 'suivi', label: 'Suivi', icon: ClipboardList },
  { id: 'profil', label: 'Mon profil', icon: User },
  { id: 'reglages', label: 'Réglages', icon: Settings },
]

export default function Sidebar() {
  const currentTab = useStore((s) => s.currentTab)
  const setCurrentTab = useStore((s) => s.setCurrentTab)
  const [showInfo, setShowInfo] = React.useState(false)

  return (
    <>
      <aside className="w-64 min-w-[256px] h-screen bg-[#f0e7d8] flex flex-col border-r border-bordure shadow-sm">
        {/* Logo + titre */}
        <div className="px-6 pt-7 pb-5 border-b border-bordure">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-action" />
            <h1 className="text-2xl font-bold text-cacao tracking-tight">GoJob</h1>
          </div>
          <p className="text-sm text-taupe mt-1">Assistant de recherche d'emploi</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all
                ${currentTab === id
                  ? 'bg-action text-white shadow-sm'
                  : 'text-cacao/70 hover:bg-white/60 hover:text-cacao'
                }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Bas de la sidebar */}
        <div className="px-4 pb-5 space-y-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-taupe hover:bg-white/60 transition-colors"
          >
            <Info size={20} />
            <span>Comment ça marche</span>
          </button>
          <p className="px-4 text-xs text-taupe/40">GoJob v0.1</p>
        </div>
      </aside>

      {/* Panneau d'info latéral */}
      {showInfo && (
        <div className="fixed inset-0 z-10" onClick={() => setShowInfo(false)}>
          <div
            className="absolute left-64 top-0 bottom-0 w-96 bg-white shadow-2xl p-8 overflow-y-auto z-20 border-r border-bordure"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-cacao mb-5">Comment ça marche</h3>
            <ol className="space-y-5 text-base text-cacao/80">
              <li className="bg-creme rounded-xl p-4 border border-bordure">
                <strong className="text-cacao block mb-1">1. Trouve des offres</strong>
                <p>Colle le lien d'une annonce ou configure l'email pour recevoir les réponses automatiquement.</p>
              </li>
              <li className="bg-creme rounded-xl p-4 border border-bordure">
                <strong className="text-cacao block mb-1">2. Génère une lettre</strong>
                <p>Choisis une offre, clique sur « Générer la lettre ». Une lettre sur-mesure est écrite pour toi.</p>
              </li>
              <li className="bg-creme rounded-xl p-4 border border-bordure">
                <strong className="text-cacao block mb-1">3. Postule</strong>
                <p>Copie la lettre, adapte-la si besoin, et postule sur le site de l'annonce.</p>
              </li>
              <li className="bg-creme rounded-xl p-4 border border-bordure">
                <strong className="text-cacao block mb-1">4. Suis tes réponses</strong>
                <p>L'app détecte les réponses dans ta boîte mail et te les montre. Relance automatique si besoin.</p>
              </li>
            </ol>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-5 w-full bg-action text-white rounded-xl px-5 py-3 text-base font-medium hover:opacity-90 transition-all"
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  )
}
