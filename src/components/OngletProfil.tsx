import { useState } from 'react'
import { useStore } from '../store/useStore'
import { User, Briefcase, GraduationCap, Languages, Plus } from 'lucide-react'
import { Carte } from './ui/Carte'
import { Bouton } from './ui/Bouton'
import { Champ } from './ui/Champ'
import { Chip } from './ui/Chip'

const NIVEAUX = ['Débutant', 'Intermédiaire', 'Courant', 'Natif']

export default function OngletProfil() {
  const profile = useStore((s) => s.profile)
  const updateProfile = useStore((s) => s.updateProfile)

  const [compInput, setCompInput] = useState('')
  const [langueInput, setLangueInput] = useState('')
  const [niveauInput, setNiveauInput] = useState(NIVEAUX[0])

  const ajouterCompetence = () => {
    if (compInput.trim() && !profile.competences.includes(compInput.trim())) {
      updateProfile({ competences: [...profile.competences, compInput.trim()] })
      setCompInput('')
    }
  }

  const ajouterLangue = () => {
    if (langueInput.trim() && !profile.langues.find((l) => l.langue === langueInput.trim())) {
      updateProfile({ langues: [...profile.langues, { langue: langueInput.trim(), niveau: niveauInput }] })
      setLangueInput('')
    }
  }

  const set = (field: string, value: any) => updateProfile({ [field]: value })

  const champsRemplis = [
    profile.nom, profile.prenom, profile.email, profile.telephone,
    profile.titre, profile.resume,
    ...profile.competences, ...profile.langues,
  ].filter(Boolean).length

  const totalChamps = 20
  const pourcentage = Math.round((champsRemplis / totalChamps) * 100)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-action to-action-vif flex items-center justify-center shadow-lg shadow-action-glow">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1>Mon profil</h1>
          <p className="text-text-dim text-sm">{pourcentage}% complété</p>
        </div>
        <div className="w-24 h-2 rounded-full bg-surface-3 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-action to-action-vif transition-all" style={{ width: `${pourcentage}%` }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Infos perso */}
        <Carte titre="Informations personnelles" icone={<User className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Champ label="Prénom" valeur={profile.prenom} onChange={(v) => set('prenom', v)} placeholder="Votre prénom" />
              <Champ label="Nom" valeur={profile.nom} onChange={(v) => set('nom', v)} placeholder="Votre nom" />
            </div>
            <Champ label="Email" valeur={profile.email} onChange={(v) => set('email', v)} placeholder="email@exemple.com" type="email" />
            <Champ label="Téléphone" valeur={profile.telephone} onChange={(v) => set('telephone', v)} placeholder="06 12 34 56 78" type="tel" />
            <Champ label="Localisation" valeur={profile.ville} onChange={(v) => set('ville', v)} placeholder="Paris, Lyon..." />
          </div>
        </Carte>

        {/* Poste */}
        <Carte titre="Poste recherché" icone={<Briefcase className="w-5 h-5" />}>
          <div className="space-y-4">
            <Champ label="Intitulé du poste" valeur={profile.titre} onChange={(v) => set('titre', v)} placeholder="Développeur React, Designer UX..." />
            <Champ label="CV / Résumé" valeur={profile.resume} onChange={(v) => set('resume', v)} placeholder="Décrivez votre profil en quelques lignes..." rows={5} />
          </div>
        </Carte>

        {/* Compétences */}
        <Carte titre="Compétences" icone={<GraduationCap className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                value={compInput}
                onChange={(e) => setCompInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ajouterCompetence()}
                placeholder="React, Node.js, Figma..."
                className="flex-1 px-4 py-3 rounded-xl border border-bordure bg-surface-3 text-text text-sm placeholder:text-text-muted/60 focus:border-action focus:ring-1 focus:ring-action/30 transition-all"
              />
              <Bouton variant="secondaire" onClick={ajouterCompetence}><Plus className="w-4 h-4" /></Bouton>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.competences.map((c, i) => (
                <Chip key={i} label={c} onRemove={() => updateProfile({ competences: profile.competences.filter((_, j) => j !== i) })} />
              ))}
              {profile.competences.length === 0 && <p className="text-text-muted text-sm">Ajoutez vos compétences</p>}
            </div>
          </div>
        </Carte>

        {/* Langues */}
        <Carte titre="Langues" icone={<Languages className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                value={langueInput}
                onChange={(e) => setLangueInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ajouterLangue()}
                placeholder="Anglais, Espagnol..."
                className="flex-1 px-4 py-3 rounded-xl border border-bordure bg-surface-3 text-text text-sm placeholder:text-text-muted/60 focus:border-action focus:ring-1 focus:ring-action/30 transition-all"
              />
              <select
                value={niveauInput}
                onChange={(e) => setNiveauInput(e.target.value)}
                className="px-3 py-3 rounded-xl border border-bordure bg-surface-3 text-text text-sm focus:border-action focus:ring-1 focus:ring-action/30 transition-all"
              >
                {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <Bouton variant="secondaire" onClick={ajouterLangue}><Plus className="w-4 h-4" /></Bouton>
            </div>
            <div className="space-y-2">
              {profile.langues.map((l, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-3 border border-bordure">
                  <span className="text-sm text-text">{l.langue}</span>
                  <span className="text-xs text-text-dim">{l.niveau}</span>
                </div>
              ))}
              {profile.langues.length === 0 && <p className="text-text-muted text-sm">Ajoutez les langues que vous parlez</p>}
            </div>
          </div>
        </Carte>
      </div>
    </div>
  )
}
