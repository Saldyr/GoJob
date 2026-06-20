import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { Eye, EyeOff, Sparkles, Check, X, RefreshCw, Mail, Database, Settings } from 'lucide-react'

const PRESETS = [
  { nom: 'DeepSeek', endpoint: 'https://api.deepseek.com/v1', modele: 'deepseek-chat', icone: '🟡', gratuit: true },
  { nom: 'Groq', endpoint: 'https://api.groq.com/openai/v1', modele: 'llama-3.3-70b-versatile', icone: '🟢', gratuit: true },
  { nom: 'OpenAI', endpoint: 'https://api.openai.com/v1', modele: 'gpt-4o-mini', icone: '🔵', gratuit: false },
]

function Carte({ titre, icone, children }: { titre: string; icone?: React.ReactNode; children: React.ReactNode }) {
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

function Champ({ valeur, onChange, placeholder, type, rows }: {
  valeur: string; onChange: (v: string) => void; placeholder: string; type?: string; rows?: number
}) {
  const cls = "w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all"
  if (rows) return <textarea value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${cls} resize-y`} />
  return <input value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type || 'text'} className={cls} />
}

export default function OngletReglages() {
  const { settings, updateSettings } = useStore()
  const [showKey, setShowKey] = useState(false)
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [imapResult, setImapResult] = useState('')
  const [ftResult, setFtResult] = useState('')
  const [secretsLoaded, setSecretsLoaded] = useState(false)

  // Charger les secrets depuis safeStorage
  useEffect(() => {
    const loadSecrets = async () => {
      if (!window.electronAPI?.chargerSecrets) { setSecretsLoaded(true); return }
      try {
        const secrets = await window.electronAPI.chargerSecrets()
        if (secrets.cleApi) updateSettings({ cleApi: secrets.cleApi })
        if (secrets.franceTravailClientId) updateSettings({ franceTravailClientId: secrets.franceTravailClientId })
        if (secrets.franceTravailClientSecret) updateSettings({ franceTravailClientSecret: secrets.franceTravailClientSecret })
        if (secrets.imap) {
          updateSettings({ imapHost: secrets.imap.host || '', imapPort: secrets.imap.port || 993, imapUser: secrets.imap.user || '', imapPassword: secrets.imap.password || '', imapTLS: secrets.imap.tls ?? true })
        }
      } catch { /* safeStorage absent */ }
      setSecretsLoaded(true)
    }
    loadSecrets()
  }, [])

  const sauvegarderSecrets = useCallback(async () => {
    if (!window.electronAPI?.sauvegarderSecrets) return
    await window.electronAPI.sauvegarderSecrets({
      cleApi: settings.cleApi, franceTravailClientId: settings.franceTravailClientId,
      franceTravailClientSecret: settings.franceTravailClientSecret,
      imap: { host: settings.imapHost, port: settings.imapPort, user: settings.imapUser, password: settings.imapPassword, tls: settings.imapTLS },
    })
  }, [settings])

  useEffect(() => {
    if (secretsLoaded) {
      const timer = setTimeout(() => sauvegarderSecrets(), 2000)
      return () => clearTimeout(timer)
    }
  }, [settings.cleApi, settings.franceTravailClientId, settings.franceTravailClientSecret, settings.imapHost, settings.imapPort, settings.imapUser, settings.imapPassword, secretsLoaded])

  const appliquerPreset = (p: typeof PRESETS[0]) => updateSettings({ endpoint: p.endpoint, modele: p.modele })

  const testerCle = async () => {
    if (!settings.cleApi) { setTestResult('error'); setTestMessage('Copie d\'abord ta clé API.'); return }
    setTestResult('testing'); setTestMessage('')
    try {
      if (window.electronAPI?.testerCle) {
        const result = await window.electronAPI.testerCle({ endpoint: settings.endpoint, modele: settings.modele, cleApi: settings.cleApi })
        setTestResult(result.ok ? 'ok' : 'error')
        setTestMessage(result.ok ? 'Clé API valide ✓' : (result.erreur || 'Échec de la connexion'))
      } else {
        setTestResult('ok'); setTestMessage('Clé enregistrée (test disponible dans l\'app desktop)')
      }
    } catch (err) { setTestResult('error'); setTestMessage((err as Error).message) }
  }

  const testerIMAP = async () => {
    if (!settings.imapHost || !settings.imapUser || !settings.imapPassword) { setImapResult('Remplis le serveur, l\'utilisateur et le mot de passe IMAP.'); return }
    setImapResult('Connexion en cours...')
    try {
      if (window.electronAPI?.imapConnect) {
        const result = await window.electronAPI.imapConnect({ host: settings.imapHost, port: settings.imapPort || 993, user: settings.imapUser, password: settings.imapPassword, tlsEnabled: settings.imapTLS })
        setImapResult(result.ok ? '✓ ' + result.message : '✗ ' + (result.erreur || 'Échec'))
      } else { setImapResult('Disponible dans l\'app desktop uniquement.') }
    } catch (err) { setImapResult('✗ ' + (err as Error).message) }
  }

  const testerFranceTravail = async () => {
    if (!settings.franceTravailClientId || !settings.franceTravailClientSecret) { setFtResult('Remplis le Client ID et le Client Secret.'); return }
    setFtResult('Connexion en cours...')
    try {
      if (window.electronAPI?.franceTravailConnect) {
        const result = await window.electronAPI.franceTravailConnect({ clientId: settings.franceTravailClientId, clientSecret: settings.franceTravailClientSecret, scope: 'api_offresdemploiv2' })
        setFtResult(result.ok ? '✓ Connecté à France Travail' : '✗ ' + (result.erreur || 'Échec OAuth'))
      } else { setFtResult('Disponible dans l\'app desktop uniquement.') }
    } catch (err) { setFtResult('✗ ' + (err as Error).message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Settings className="w-7 h-7 text-ambre" />
        <h1 className="text-2xl font-bold text-cacao">Réglages</h1>
        <p className="text-sm text-taupe ml-auto">Les secrets sont chiffrés sur ton ordinateur</p>
      </div>

      {/* LLM */}
      <Carte titre="Générateur de lettres (LLM)" icone={<Sparkles className="w-5 h-5" />}>
        {!settings.cleApi && (
          <div className="bg-ambre/5 border border-ambre/30 rounded-xl p-4 text-sm text-cacao flex items-start gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-ambre flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Bienvenue !</p>
              <p className="text-sm text-taupe mt-1">Pour générer des lettres, il te faut une clé API. Choisis un fournisseur gratuit ci-dessous, crée un compte et colle ta clé.</p>
            </div>
          </div>
        )}

        <label className="block text-sm font-medium text-cacao mb-2">Fournisseur</label>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {PRESETS.map((p) => (
            <button key={p.nom} onClick={() => appliquerPreset(p)}
              className={`px-4 py-3 rounded-xl text-base text-left transition-all ${
                settings.endpoint === p.endpoint
                  ? 'bg-ambre/10 border-2 border-ambre text-cacao font-medium'
                  : 'bg-creme border border-bordure text-taupe hover:bg-sable/20'
              }`}
            >
              <span className="text-lg">{p.icone}</span>
              <span className="block mt-1">{p.nom}</span>
              {p.gratuit && <span className="text-xs text-vert-success">gratuit</span>}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-cacao mb-2">Clé API</label>
        <div className="relative mb-3">
          <input type={showKey ? 'text' : 'password'} value={settings.cleApi}
            onChange={(e) => updateSettings({ cleApi: e.target.value })}
            placeholder="sk-..."
            className="w-full px-4 py-3 pr-12 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30"
          />
          <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-cacao transition-colors">
            {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <button onClick={testerCle} disabled={testResult === 'testing'}
            className="bg-sable text-cacao rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-all"
          >
            {testResult === 'testing' ? <><RefreshCw className="w-4 h-4 animate-spin" /> Test en cours...</> : 'Tester la connexion'}
          </button>
          {testResult === 'ok' && <Check className="w-5 h-5 text-vert-success" />}
          {testResult === 'error' && <X className="w-5 h-5 text-rouge-error" />}
          {testMessage && <span className={`text-sm ${testResult === 'ok' ? 'text-vert-success' : 'text-rouge-error'}`}>{testMessage}</span>}
        </div>

        <p className="text-sm text-taupe/60">La clé est chiffrée via safeStorage d'Electron et n'est jamais écrite en clair.</p>
      </Carte>

      {/* France Travail */}
      <Carte titre="France Travail — API" icone={<Database className="w-5 h-5" />}>
        <p className="text-sm text-taupe mb-3">Récupère les offres automatiquement. Tu as besoin d'un compte partenaire France Travail (API gratuite).</p>
        <div className="space-y-3">
          <Champ valeur={settings.franceTravailClientId || ''} onChange={(v) => updateSettings({ franceTravailClientId: v })} placeholder="Client ID France Travail" />
          <input type="password" value={settings.franceTravailClientSecret || ''} onChange={(e) => updateSettings({ franceTravailClientSecret: e.target.value })}
            placeholder="Client Secret France Travail"
            className="w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30"
          />
          <div className="flex items-center gap-3">
            <button onClick={testerFranceTravail} className="bg-sable text-cacao rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-all">Connecter France Travail</button>
            {ftResult && <span className={`text-sm ${ftResult.startsWith('✓') ? 'text-vert-success' : 'text-rouge-error'}`}>{ftResult}</span>}
          </div>
        </div>
      </Carte>

      {/* IMAP */}
      <Carte titre="Alertes email (IMAP)" icone={<Mail className="w-5 h-5" />}>
        <p className="text-sm text-taupe mb-3">Reçois automatiquement les offres des plateformes qui t'envoient des alertes par email.</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Champ valeur={settings.imapHost || ''} onChange={(v) => updateSettings({ imapHost: v })} placeholder="Serveur IMAP (ex: imap.gmail.com)" />
          <input type="number" value={settings.imapPort || ''} onChange={(e) => updateSettings({ imapPort: parseInt(e.target.value) || 143 })}
            placeholder="Port (143 ou 993)"
            className="px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30"
          />
        </div>
        <div className="space-y-3 mb-3">
          <Champ valeur={settings.imapUser || ''} onChange={(v) => updateSettings({ imapUser: v })} placeholder="Adresse email" />
          <input type="password" value={settings.imapPassword || ''} onChange={(e) => updateSettings({ imapPassword: e.target.value })}
            placeholder="Mot de passe ou mot de passe d'application"
            className="w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base placeholder:text-taupe/40 focus:outline-none focus:ring-2 focus:ring-ambre/30"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-cacao mb-3 cursor-pointer">
          <input type="checkbox" checked={settings.imapTLS} onChange={(e) => updateSettings({ imapTLS: e.target.checked })}
            className="w-4 h-4 rounded border-bordure text-ambre focus:ring-ambre/30"
          />
          Utiliser TLS/SSL (port 993)
        </label>
        <div className="flex items-center gap-3">
          <button onClick={testerIMAP} className="bg-sable text-cacao rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-all">Tester la connexion IMAP</button>
          {imapResult && <span className={`text-sm ${imapResult.startsWith('✓') ? 'text-vert-success' : 'text-rouge-error'}`}>{imapResult}</span>}
        </div>
        <p className="text-sm text-taupe/60 mt-2">Pour Gmail : active l'authentification à 2 facteurs et crée un mot de passe d'application.</p>
      </Carte>

      {/* Langue */}
      <Carte titre="Langue des lettres">
        <select value={settings.langue} onChange={(e) => updateSettings({ langue: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao text-base focus:outline-none focus:ring-2 focus:ring-ambre/30"
        >
          <option value="fr">Français</option>
          <option value="es">Español (América Latina)</option>
        </select>
        <p className="text-sm text-taupe/60 mt-2">Les lettres de motivation seront générées dans cette langue.</p>
      </Carte>

      {/* Sécurité */}
      <div className="rounded-2xl bg-creme border border-bordure shadow-sm p-6">
        <p className="text-lg font-semibold text-cacao mb-3">🔒 Sécurité</p>
        <ul className="space-y-2 text-base text-taupe">
          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-vert-success mt-1 flex-shrink-0" /> Clé API, identifiants IMAP et France Travail sont chiffrés via Electron safeStorage</li>
          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-vert-success mt-1 flex-shrink-0" /> Aucun secret n'est stocké en localStorage clair</li>
          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-vert-success mt-1 flex-shrink-0" /> L'export de données ne contient JAMAIS les secrets</li>
          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-vert-success mt-1 flex-shrink-0" /> Les lettres sont envoyées directement au LLM (pas de serveur intermédiaire)</li>
        </ul>
      </div>
    </div>
  )
}
