import { useState } from 'react'
import { useStore } from '../store/useStore'
import { User, Brain, Globe, GraduationCap, Plus, X, File, Upload, Save } from 'lucide-react'

export default function OngletProfil() {
  const { profile, updateProfile, documents, addDocument, removeDocument } = useStore()
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

  const handleImporter = async () => {
    if (!window.electronAPI?.importerCv) { setImportMessage('Fonction disponible uniquement dans l\'application desktop.'); return }
    setImportMessage('')
    const result = await window.electronAPI.importerCv()
    if (result.ok) {
      addDocument({ id: '', nom: result.nom, type: 'cv', texte: result.texte, dateAjout: new Date().toISOString(), chemin: result.chemin })
      updateProfile({ cvText: result.texte })
      setImportMessage('✓ CV importé : ' + result.nom)
    } else { setImportMessage('✗ ' + (result.erreur || 'Échec de l\'import')) }
  }

  function Chip({ label, onRetirer }: { label: string; onRetirer: () => void }) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-sable/20 text-cacao rounded-lg px-3 py-1.5 text-sm">
        {label}
        <button onClick={onRetirer} className="text-taupe hover:text-cacao transition-colors"><X className="w-3.5 h-3.5" /></button>
      </span>
    )
  }

  function Section({ titre, icone, children }: { titre: string; icone?: React.ReactNode; children: React.ReactNode }) {
    return (
      <section className="rounded-2xl bg-white border border-bordure shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          {icone && <span className="text-ambre">{icone}</span>}
          <h2 className="text-lg font-semibold text-cacao">{titre}</h2>
        </div>
        {children}
      </section>
    )
  }

  function Champ({ valeur, onChange, placeholder, type }: { valeur: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
    return <input value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type || 'text'}
      className="w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all" />
  }

  const niveaux = ['Débutant', 'Intermédiaire', 'Courant', 'Bilingue']

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <User className="w-7 h-7 text-ambre" />
        <h1 className="text-2xl font-bold text-cacao">Mon profil</h1>
      </div>

      {/* Identité */}
      <Section titre="Identité" icone={<User className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-taupe mb-1">Nom complet</label>
            <Champ valeur={profile.nom} onChange={(v) => updateProfile({ nom: v })} placeholder="Prénom Nom" /></div>
          <div><label className="block text-sm text-taupe mb-1">Email</label>
            <Champ valeur={profile.email || ''} onChange={(v) => updateProfile({ email: v })} placeholder="email@exemple.com" type="email" /></div>
          <div><label className="block text-sm text-taupe mb-1">Localisation</label>
            <Champ valeur={profile.localisation || ''} onChange={(v) => updateProfile({ localisation: v })} placeholder="Ville, Pays" /></div>
        </div>
      </Section>

      {/* Titre */}
      <Section titre="Titre recherché" icone={<GraduationCap className="w-5 h-5" />}>
        <Champ valeur={profile.titre || ''} onChange={(v) => updateProfile({ titre: v })} placeholder="Ex: Architecte BIM, Chef de projet..." />
        <p className="text-sm text-taupe/60 mt-2">Ce titre est repris dans les lettres de motivation générées.</p>
      </Section>

      {/* Compétences */}
      <Section titre="Compétences" icone={<Brain className="w-5 h-5" />}>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.competences.map((c, i) => <Chip key={i} label={c} onRetirer={() => retirerCompetence(i)} />)}
        </div>
        <div className="flex gap-2">
          <input value={nouvelleCompetence} onChange={(e) => setNouvelleCompetence(e.target.value)}
            placeholder="Ajouter une compétence..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30"
            onKeyDown={(e) => e.key === 'Enter' && ajouterCompetence()} />
          <button onClick={ajouterCompetence} className="bg-ambre text-white rounded-xl px-4 py-2.5 flex items-center gap-1.5 hover:opacity-90 transition-all font-medium">
            <Plus className="w-4 h-4" /> Ajouter</button>
        </div>
        <p className="text-sm text-taupe/60 mt-2">Appuie sur Entrée ou clique sur Ajouter.</p>
      </Section>

      {/* Langues */}
      <Section titre="Langues" icone={<Globe className="w-5 h-5" />}>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.langues.map((l, i) => <Chip key={i} label={`${l.langue} · ${l.niveau}`} onRetirer={() => retirerLangue(i)} />)}
        </div>
        <div className="flex gap-2 flex-wrap">
          <input value={ajoutLangue} onChange={(e) => setAjoutLangue(e.target.value)} placeholder="Langue..."
            className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30"
            onKeyDown={(e) => e.key === 'Enter' && ajouterLangue()} />
          <select value={ajoutNiveau} onChange={(e) => setAjoutNiveau(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-bordure bg-white text-cacao text-base focus:outline-none focus:ring-2 focus:ring-ambre/30">
            {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button onClick={ajouterLangue} className="bg-ambre text-white rounded-xl px-4 py-2.5 flex items-center gap-1.5 hover:opacity-90 transition-all font-medium">
            <Plus className="w-4 h-4" /> Ajouter</button>
        </div>
      </Section>

      {/* Postes visés */}
      <Section titre="Postes visés" icone={<GraduationCap className="w-5 h-5" />}>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.typesPostes.map((p, i) => <Chip key={i} label={p} onRetirer={() => retirerTypePoste(i)} />)}
        </div>
        <div className="flex gap-2">
          <input value={nouveauPoste} onChange={(e) => setNouveauPoste(e.target.value)} placeholder="Ex: Architecte BIM, Coordinateur..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30"
            onKeyDown={(e) => e.key === 'Enter' && ajouterTypePoste()} />
          <button onClick={ajouterTypePoste} className="bg-ambre text-white rounded-xl px-4 py-2.5 flex items-center gap-1.5 hover:opacity-90 transition-all font-medium">
            <Plus className="w-4 h-4" /> Ajouter</button>
        </div>
      </Section>

      {/* CV texte */}
      <Section titre="CV (texte)" icone={<File className="w-5 h-5" />}>
        <textarea value={profile.cvText} onChange={(e) => updateProfile({ cvText: e.target.value })}
          placeholder="Colle ici le texte de ton CV (parcours, expériences, formations)..."
          className="w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30 resize-y" rows={8} />
        <p className="text-sm text-taupe/60 mt-2">Ce texte est utilisé pour personnaliser les lettres de motivation.</p>
      </Section>

      {/* Documents */}
      <Section titre="Documents importés" icone={<Upload className="w-5 h-5" />}>
        <button onClick={handleImporter} className="bg-ambre text-white rounded-xl px-5 py-2.5 flex items-center gap-2 hover:opacity-90 transition-all font-medium text-base mb-4">
          <Upload className="w-4 h-4" /> Importer un CV</button>
        {importMessage && <p className={`text-sm mb-3 ${importMessage.startsWith('✓') ? 'text-vert-success' : 'text-rouge-error'}`}>{importMessage}</p>}
        {documents.length === 0 ? <p className="text-sm text-taupe/60">Aucun document importé.</p> : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-creme border border-bordure">
                <div className="flex items-center gap-2 min-w-0">
                  <File className="w-4 h-4 text-taupe flex-shrink-0" />
                  <span className="text-base text-cacao truncate">{doc.nom}</span>
                </div>
                <button onClick={() => removeDocument(doc.id)} className="text-taupe hover:text-rouge-error transition-colors flex-shrink-0 ml-2">
                  <X className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="flex justify-end pt-2">
        <button className="bg-ambre text-white rounded-xl px-8 py-3 text-base font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-2">
          <Save className="w-5 h-5" /> Enregistrer</button>
      </div>
    </div>
  )
}
