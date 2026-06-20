import { useState } from 'react'
import { useStore } from '../store/useStore'
import { User, Brain, Globe, GraduationCap, Plus, X, File, Upload, Save } from 'lucide-react'
import { Carte, Champ } from './ui'

function Chip({ label, onRetirer }: { label: string; onRetirer: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-sable/20 text-cacao rounded-lg px-3 py-1.5 text-sm">
      {label}
      <button onClick={onRetirer} className="text-taupe hover:text-cacao transition-colors"><X className="w-3.5 h-3.5" /></button>
    </span>
  )
}

export default function OngletProfil() {
  const profile = useStore((s) => s.profile)
  const documents = useStore((s) => s.documents)
  const updateProfile = useStore((s) => s.updateProfile)
  const addDocument = useStore((s) => s.addDocument)
  const removeDocument = useStore((s) => s.removeDocument)
  const [importMessage, setImportMessage] = useState('')

  const [nouvelleCompetence, setNouvelleCompetence] = useState('')
  const [ajoutLangue, setAjoutLangue] = useState('')
  const [ajoutNiveau, setAjoutNiveau] = useState('Intermédiaire')
  const [nouveauPoste, setNouveauPoste] = useState('')

  const ajouterCompetence = () => {
    const val = nouvelleCompetence.trim()
    if (!val || profile.competences.includes(val)) return
    updateProfile({ competences: [...profile.competences, val] })
    setNouvelleCompetence('')
  }

  const retirerCompetence = (idx: number) => {
    updateProfile({ competences: profile.competences.filter((_, i) => i !== idx) })
  }

  const ajouterLangue = () => {
    const langue = ajoutLangue.trim()
    if (!langue) return
    updateProfile({ langues: [...profile.langues, { langue, niveau: ajoutNiveau }] })
    setAjoutLangue('')
    setAjoutNiveau('Intermédiaire')
  }

  const retirerLangue = (idx: number) => {
    updateProfile({ langues: profile.langues.filter((_, i) => i !== idx) })
  }

  const ajouterTypePoste = () => {
    const val = nouveauPoste.trim()
    if (!val || profile.typesPostes.includes(val)) return
    updateProfile({ typesPostes: [...profile.typesPostes, val] })
    setNouveauPoste('')
  }

  const retirerTypePoste = (idx: number) => {
    updateProfile({ typesPostes: profile.typesPostes.filter((_, i) => i !== idx) })
  }

  const handleImportDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!window.electronAPI?.importerCv) return
    const res = await window.electronAPI.importerCv()
    if (res.ok) {
      addDocument({ nom: res.nom || 'CV importé', texte: res.texte, type: 'cv', id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), dateAjout: new Date().toISOString() })
      setImportMessage('Importé !')
    } else {
      setImportMessage(`Erreur : ${res.erreur}`)
    }
    e.target.value = ''
    setTimeout(() => setImportMessage(''), 3000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <User className="w-7 h-7 text-action" />
        <h1 className="text-2xl font-bold text-cacao">Mon Profil</h1>
      </div>

      {/* Infos personnelles */}
      <Carte titre="Infos personnelles" icone={<User className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Champ valeur={profile.prenom} onChange={(v) => updateProfile({ prenom: v })} placeholder="Prénom" />
          <Champ valeur={profile.nom} onChange={(v) => updateProfile({ nom: v })} placeholder="Nom" />
          <Champ valeur={profile.email} onChange={(v) => updateProfile({ email: v })} placeholder="Email" type="email" />
          <Champ valeur={profile.telephone} onChange={(v) => updateProfile({ telephone: v })} placeholder="Téléphone" type="tel" />
        </div>
        <Champ valeur={profile.adresse} onChange={(v) => updateProfile({ adresse: v })} placeholder="Adresse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Champ valeur={profile.ville} onChange={(v) => updateProfile({ ville: v })} placeholder="Ville" />
          <Champ valeur={profile.codePostal} onChange={(v) => updateProfile({ codePostal: v })} placeholder="Code postal" />
        </div>
      </Carte>

      {/* Titre / poste */}
      <Carte titre="Poste recherché" icone={<Brain className="w-5 h-5" />}>
        <Champ valeur={profile.titre} onChange={(v) => updateProfile({ titre: v })} placeholder="Titre du poste (ex. Développeur Full-Stack)" />
        <Champ valeur={profile.resume} onChange={(v) => updateProfile({ resume: v })} placeholder="Résumé (2-3 lignes qui te définissent)" rows={3} />
        <div className="mt-4">
          <label className="block text-sm text-taupe mb-1">Types de postes</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.typesPostes.map((tp, i) => (
              <Chip key={`${tp}-${i}`} label={tp} onRetirer={() => retirerTypePoste(i)} />
            ))}
          </div>
          <div className="flex gap-2">
            <Champ valeur={nouveauPoste} onChange={setNouveauPoste} placeholder="Ajouter un type de poste" />
            <button onClick={ajouterTypePoste} className="bg-action text-white rounded-xl px-4 text-sm hover:opacity-90 transition-all font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Ajouter</button>
          </div>
        </div>
      </Carte>

      {/* Compétences */}
      <Carte titre="Compétences" icone={<Brain className="w-5 h-5" />}>
        <div className="flex flex-wrap gap-2 mb-2">
          {profile.competences.map((c, i) => (
            <Chip key={`${c}-${i}`} label={c} onRetirer={() => retirerCompetence(i)} />
          ))}
        </div>
        <div className="flex gap-2">
          <Champ valeur={nouvelleCompetence} onChange={setNouvelleCompetence} placeholder="Ajouter une compétence" />
          <button onClick={ajouterCompetence} className="bg-action text-white rounded-xl px-4 text-sm hover:opacity-90 transition-all font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Ajouter</button>
        </div>
      </Carte>

      {/* Langues */}
      <Carte titre="Langues" icone={<Globe className="w-5 h-5" />}>
        <div className="flex flex-wrap gap-2 mb-2">
          {profile.langues.map((l, i) => (
            <Chip key={`${l.langue}-${i}`} label={`${l.langue} — ${l.niveau}`} onRetirer={() => retirerLangue(i)} />
          ))}
        </div>
        <div className="flex gap-2 items-start">
          <Champ valeur={ajoutLangue} onChange={setAjoutLangue} placeholder="Langue" />
          <select value={ajoutNiveau} onChange={(e) => setAjoutNiveau(e.target.value)}
            className="px-3 py-3 rounded-xl border border-bordure bg-white text-cacao text-base focus:outline-none focus:ring-2 focus:ring-action/30">
            <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option><option>Natif</option>
          </select>
          <button onClick={ajouterLangue} className="bg-action text-white rounded-xl px-4 text-sm hover:opacity-90 transition-all font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Ajouter</button>
        </div>
      </Carte>

      {/* Formation */}
      <Carte titre="Formation" icone={<GraduationCap className="w-5 h-5" />}>
        <Champ valeur={profile.formation} onChange={(v) => updateProfile({ formation: v })} placeholder="Formation (ex. Licence Pro Dev Web)" rows={2} />
      </Carte>

      {/* Documents */}
      <Carte titre="Documents" icone={<File className="w-5 h-5" />}>
        <div className="space-y-2 mb-3">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-creme border border-bordure">
              <span className="text-base text-cacao truncate">{d.nom}</span>
              <button onClick={() => removeDocument(d.id)} className="text-taupe hover:text-rouge-error transition-colors"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-action text-white rounded-xl px-5 py-3 text-sm hover:opacity-90 transition-all font-medium flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> Importer un CV
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleImportDoc} className="hidden" />
          </label>
          {importMessage && <span className="text-sm text-vert-success">{importMessage}</span>}
        </div>
      </Carte>

      {/* Sauvegarder */}
      <div className="flex justify-end">
        <button onClick={() => {
          const s = useStore.getState()
          s.saveToDisk()
        }} className="bg-action text-white rounded-xl px-6 py-3 text-base hover:opacity-90 transition-all font-medium flex items-center gap-2">
          <Save className="w-5 h-5" /> Sauvegarder
        </button>
      </div>
    </div>
  )
}
