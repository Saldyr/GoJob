import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Settings, Key, Download, Upload, CheckCircle, Server } from 'lucide-react'
import { Carte } from './ui/Carte'
import { Bouton } from './ui/Bouton'
import { Champ } from './ui/Champ'

export default function OngletReglages() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const offres = useStore((s) => s.offres)
  const profile = useStore((s) => s.profile)

  const [saved, setSaved] = useState(false)

  const set = (field: string, value: any) => {
    updateSettings({ [field]: value })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exporter = () => {
    const data = JSON.stringify({ profile, offres, settings }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gojob-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importer = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const data = JSON.parse(text)
        if (data.profile) useStore.getState().updateProfile(data.profile)
        if (data.settings) useStore.getState().updateSettings(data.settings)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch {
        alert('Fichier JSON invalide')
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-action to-action-vif flex items-center justify-center shadow-lg shadow-action-glow">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1>Paramètres</h1>
            <p className="text-text-dim text-sm">Configurez votre assistant de recherche d'emploi</p>
          </div>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-vert text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Enregistré
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuration API */}
        <Carte titre="Configuration API" icone={<Key className="w-5 h-5" />}>
          <div className="space-y-4">
            <p className="text-sm text-text-dim">Configurez votre clé API pour la génération de lettres de motivation.</p>
            <Champ label="Clé API" valeur={settings.cleApi} onChange={(v) => set('cleApi', v)} placeholder="sk-..." type="password" />
            <div className="grid grid-cols-2 gap-4">
              <Champ label="Endpoint" valeur={settings.endpoint} onChange={(v) => set('endpoint', v)} placeholder="https://api.openai.com/v1" />
              <Champ label="Modèle" valeur={settings.modele} onChange={(v) => set('modele', v)} placeholder="gpt-4" />
            </div>
          </div>
        </Carte>

        {/* Configuration IMAP */}
        <Carte titre="Connexion IMAP" icone={<Server className="w-5 h-5" />}>
          <div className="space-y-4">
            <p className="text-sm text-text-dim">Connectez votre boîte mail pour détecter automatiquement les réponses.</p>
            <Champ label="Serveur" valeur={settings.imapHost} onChange={(v) => set('imapHost', v)} placeholder="imap.gmail.com" />
            <div className="grid grid-cols-2 gap-4">
              <Champ label="Port" valeur={String(settings.imapPort)} onChange={(v) => set('imapPort', parseInt(v) || 993)} placeholder="993" />
              <Champ label="Utilisateur" valeur={settings.imapUser} onChange={(v) => set('imapUser', v)} placeholder="email@exemple.com" />
            </div>
            <Champ label="Mot de passe" valeur={settings.imapPassword} onChange={(v) => set('imapPassword', v)} placeholder="Mot de passe ou token" type="password" />
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.imapTLS}
                onChange={(e) => set('imapTLS', e.target.checked)}
                className="w-5 h-5 rounded-lg border border-bordure bg-surface-3 text-action focus:ring-action/30"
              />
              <span className="text-sm text-text">Utiliser TLS</span>
            </label>
          </div>
        </Carte>

        {/* France Travail */}
        <Carte titre="API France Travail" icone={<Key className="w-5 h-5" />}>
          <div className="space-y-4">
            <p className="text-sm text-text-dim">Connectez-vous à l'API France Travail pour importer des offres automatiquement.</p>
            <Champ label="Client ID" valeur={settings.franceTravailClientId} onChange={(v) => set('franceTravailClientId', v)} placeholder="..." />
            <Champ label="Client Secret" valeur={settings.franceTravailClientSecret} onChange={(v) => set('franceTravailClientSecret', v)} placeholder="..." type="password" />
          </div>
        </Carte>

        {/* Données */}
        <Carte titre="Export / Import" icone={<Download className="w-5 h-5" />}>
          <div className="space-y-4">
            <p className="text-sm text-text-dim">Sauvegardez ou restaurez vos données (offres, profil, paramètres).</p>
            <div className="flex gap-3">
              <Bouton variant="primaire" onClick={exporter}>
                <Download className="w-4 h-4" /> Exporter
              </Bouton>
              <Bouton variant="secondaire" onClick={importer}>
                <Upload className="w-4 h-4" /> Importer
              </Bouton>
            </div>
          </div>
        </Carte>
      </div>
    </div>
  )
}
