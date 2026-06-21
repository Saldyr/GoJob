import { useState } from 'react'
import { useStore } from '../store/useStore'
import { FileText, Send, Settings, ArrowRight, Check, Sparkles } from 'lucide-react'

const ETAPES = [
  {
    titre: 'Bienvenue sur GoJob',
    icone: <Sparkles className="w-12 h-12 text-action" />,
    texte: `GoJob t'aide à gérer ta recherche d'emploi :
• Importe ton CV et suis tes candidatures
• Rédige des lettres de motivation personnalisées avec l'IA
• Reçois des offres par email (France Travail, Gmail…)

Commençons par les bases.`,
  },
  {
    titre: 'Étape 1 — Ton profil',
    icone: <FileText className="w-12 h-12 text-action" />,
    texte: `Renseigne ton profil dans l'onglet Profil :
• Ton nom, titre et compétences
• Importe ton CV (PDF ou copie-colle)
• Ajoute tes langues et ta localisation

Ces infos servent à générer des lettres adaptées.`,
  },
  {
    titre: 'Étape 2 — Ta clé API',
    icone: <Settings className="w-12 h-12 text-action" />,
    texte: `Dans l'onglet Réglages :
1. Colle ta clé API DeepSeek (ou Groq, OpenAI)
2. Clique sur « Tester la clé »
3. Configure IMAP si tu veux recevoir les réponses par email
4. Configure France Travail pour importer les offres

Ta clé est chiffrée sur ton ordinateur.`,
  },
  {
    titre: 'Prêt·e à postuler ?',
    icone: <Send className="w-12 h-12 text-action" />,
    texte: `Le tableau de bord est prêt :

• **Offres** : ajoute des offres manuellement
• **Postuler** : génère une lettre de motivation
• **Suivi** : suis l'avancement de tes candidatures
• **Profil** : gère ton CV et tes documents

Ajoute ta première offre et lance-toi !`,
  },
]

export default function Onboarding() {
  const [etape, setEtape] = useState(0)
  const setOnboardingDone = useStore((s) => s.setOnboardingDone)
  const e = ETAPES[etape]
  const isLast = etape === ETAPES.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-surface-2 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border-t-4 border-action"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-action/10">
            {e.icone}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{e.titre}</h2>
            <p className="text-sm text-text-dim">Étape {etape + 1} sur {ETAPES.length}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-text leading-relaxed whitespace-pre-line">{e.texte}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 px-6 py-2">
          {ETAPES.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === etape ? 'bg-action' : i < etape ? 'bg-action/50' : 'bg-bordure'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center px-6 py-4 bg-surface-3 border-t border-bordure/50">
          <button
            onClick={() => setOnboardingDone(true)}
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            Passer
          </button>

          <div className="flex gap-3">
            {etape > 0 && (
              <button
                onClick={() => setEtape(etape - 1)}
                className="px-4 py-2 text-sm rounded-lg border border-bordure text-text-dim hover:bg-action/10 transition-colors"
              >
                Retour
              </button>
            )}

            {isLast ? (
              <button
                onClick={() => setOnboardingDone(true)}
                className="flex items-center gap-2 px-5 py-2 text-sm text-white rounded-lg bg-action-deep hover:opacity-90 transition-all"
              >
                <Check className="w-4 h-4" />
                Commencer
              </button>
            ) : (
              <button
                onClick={() => setEtape(etape + 1)}
                className="flex items-center gap-2 px-5 py-2 text-sm text-white rounded-lg bg-action-deep hover:opacity-90 transition-all"
              >
                Suivant
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
