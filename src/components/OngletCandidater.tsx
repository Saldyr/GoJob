import { useState } from 'react'
import { useStore } from '../store/useStore'
import { FileText, Sparkles, RefreshCw, Copy } from 'lucide-react'
import { Carte } from './ui/Carte'
import { Bouton } from './ui/Bouton'
import { Champ } from './ui/Champ'

export default function OngletCandidater() {
  const offres = useStore((s) => s.offres)
  const profile = useStore((s) => s.profile)

  const [offreId, setOffreId] = useState('')
  const [personnalisation, setPersonnalisation] = useState('')
  const [lettre, setLettre] = useState('')
  const [loading, setLoading] = useState(false)

  const offre = offres.find((o) => o.id === offreId)

  const generer = async () => {
    if (!offre) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLettre(`Objet : Candidature au poste de ${offre.titre}

Bonjour,

Je me permets de vous adresser ma candidature pour le poste de ${offre.titre} au sein de ${offre.entreprise}.

${profile.resume ? profile.resume + '\n\n' : ''}${personnalisation ? personnalisation + '\n\n' : ''}Je reste à votre disposition pour un éventuel entretien afin de vous exposer plus en détail mes motivations.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${profile.prenom} ${profile.nom}`)
    setLoading(false)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-action to-action-vif flex items-center justify-center shadow-lg shadow-action-glow">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1>Lettre de motivation</h1>
          <p className="text-text-dim text-sm">Générez une lettre personnalisée en un clic</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Carte titre="Générer une lettre" icone={<Sparkles className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dim mb-1.5">Offre cible</label>
              <select
                value={offreId}
                onChange={(e) => setOffreId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-bordure bg-surface-3 text-text text-sm focus:border-action focus:ring-1 focus:ring-action/30 transition-all"
              >
                <option value="">Sélectionnez une offre</option>
                {offres.map((o) => (
                  <option key={o.id} value={o.id}>{o.titre} — {o.entreprise}</option>
                ))}
              </select>
            </div>

            {offre && (
              <div className="p-4 rounded-xl bg-surface-3 border border-bordure">
                <p className="font-medium text-white">{offre.titre}</p>
                <p className="text-sm text-text-dim">{offre.entreprise}</p>
                {offre.ville && <p className="text-xs text-text-muted mt-1">{offre.ville}</p>}
              </div>
            )}

            <Champ
              label="Personnalisation"
              valeur={personnalisation}
              onChange={setPersonnalisation}
              placeholder="Ajoutez des éléments spécifiques à l'entreprise..."
              rows={4}
            />

            <Bouton variant="primaire" onClick={generer} disabled={!offre || loading} className="w-full">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Génération...</> : <><Sparkles className="w-4 h-4" /> Générer la lettre</>}
            </Bouton>
          </div>
        </Carte>

        <Carte titre="Aperçu" icone={<FileText className="w-5 h-5" />}>
          {lettre ? (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-surface-3 border border-bordure whitespace-pre-wrap text-text text-sm leading-relaxed">
                {lettre}
              </div>
              <Bouton variant="primaire" onClick={() => navigator.clipboard.writeText(lettre)} className="w-full">
                <Copy className="w-4 h-4" /> Copier la lettre
              </Bouton>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7 text-text-muted" />
              </div>
              <p className="text-text-dim">Générez une lettre pour voir l'aperçu</p>
            </div>
          )}
        </Carte>
      </div>
    </div>
  )
}
