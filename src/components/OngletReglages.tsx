import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Settings, CheckCircle } from 'lucide-react'
import { Carte } from './ui/Carte'
import { Bouton } from './ui/Bouton'
import { Champ } from './ui/Champ'
import { Interrupteur } from './ui/Interrupteur'
import PageHeader from './ui/PageHeader'
import { useT } from '../i18n/useT'

export default function OngletReglages() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const { t } = useT()

  const [saved, setSaved] = useState(false)
  const [imapTest, setImapTest] = useState<{ status: 'idle' | 'testing' | 'ok' | 'err'; msg: string }>({ status: 'idle', msg: '' })
  type TestEtat = { status: 'idle' | 'testing' | 'ok' | 'err'; msg: string }
  const [ftConnect, setFtConnect] = useState<TestEtat>({ status: 'idle', msg: '' })
  const [cleTest, setCleTest] = useState<Record<'adzuna' | 'jooble' | 'reed', TestEtat>>({
    adzuna: { status: 'idle', msg: '' },
    jooble: { status: 'idle', msg: '' },
    reed: { status: 'idle', msg: '' },
  })

  const testerCle = async (plateforme: 'adzuna' | 'jooble' | 'reed') => {
    setCleTest((e) => ({ ...e, [plateforme]: { status: 'testing', msg: 'Test en cours…' } }))
    try {
      const s = useStore.getState().settings
      const r = await window.electronAPI?.testerCle?.({
        plateforme,
        adzunaAppId: s.adzunaAppId, adzunaAppKey: s.adzunaAppKey,
        joobleKey: s.joobleKey, reedKey: s.reedKey,
      })
      if (r?.ok) {
        setCleTest((e) => ({ ...e, [plateforme]: { status: 'ok', msg: `Clé valide — ${r.count ?? 0} offre(s) au test.` } }))
      } else {
        setCleTest((e) => ({ ...e, [plateforme]: { status: 'err', msg: r?.erreur || 'Échec du test.' } }))
      }
    } catch (err) {
      setCleTest((e) => ({ ...e, [plateforme]: { status: 'err', msg: err instanceof Error ? err.message : String(err) } }))
    }
  }

  // Charger les secrets safeStorage au montage
  useEffect(() => {
    (async () => {
      if (!window.electronAPI?.chargerSecrets) return
      const secrets = await window.electronAPI.chargerSecrets()
      if (secrets && typeof secrets === 'object') {
        const toUpdate: Record<string, string> = {}
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
    })()
    // Effet de montage uniquement (chargement des secrets safeStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (field: string, value: string | number | boolean) => {
    updateSettings({ [field]: value } as Partial<typeof settings>)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Persister les secrets via safeStorage
    if (['imapUser', 'imapPassword', 'franceTravailClientId', 'franceTravailClientSecret', 'adzunaAppId', 'adzunaAppKey', 'joobleKey', 'reedKey'].includes(field)) {
      const s = useStore.getState().settings
      window.electronAPI?.sauvegarderSecrets?.({
        imapUser: s.imapUser || undefined,
        imapPassword: s.imapPassword || undefined,
        franceTravailClientId: s.franceTravailClientId || undefined,
        franceTravailClientSecret: s.franceTravailClientSecret || undefined,
        adzunaAppId: s.adzunaAppId || undefined,
        adzunaAppKey: s.adzunaAppKey || undefined,
        joobleKey: s.joobleKey || undefined,
        reedKey: s.reedKey || undefined,
      }).catch(() => {})
    }
  }

  // Bouton « Tester la clé » + message de résultat, pour Adzuna / Jooble / Reed
  const renderTestCle = (p: 'adzuna' | 'jooble' | 'reed') => {
    const etat = cleTest[p]
    return (
      <div className="space-y-2">
        <Bouton variant="primaire" disabled={etat.status === 'testing'} onClick={() => testerCle(p)} className="w-full justify-center">
          {etat.status === 'testing' ? 'Test en cours…' : 'Tester la connexion'}
        </Bouton>
        {etat.status !== 'idle' && (
          <div className={`p-3 rounded-xl text-sm border break-words ${
            etat.status === 'ok' ? 'bg-vert/10 text-vert border-vert/20'
            : etat.status === 'testing' ? 'bg-electric/10 text-electric border-electric/20'
            : 'bg-rouge-error/10 text-rouge-error border-rouge-error/20'
          }`}>
            {etat.msg}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* En-tête */}
      <PageHeader
        icon={<Settings className="w-5 h-5 text-white" />}
        title={t('settings.title')}
        subtitle="Connecte tes sources d'offres"
        actions={saved && (
          <span className="flex items-center gap-1.5 text-vert text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> {t('settings.saved')}
          </span>
        )}
      />

      <div className="columns-1 lg:columns-2 gap-6 [&>*]:mb-6 [&>*]:break-inside-avoid">
        {/* France Travail */}
        <Carte
          className="!h-auto"
          titre="France Travail"
          actions={<Interrupteur actif={settings.franceTravailEnabled} onChange={(v) => set('franceTravailEnabled', v)} label="Activer France Travail" />}
          footer={
            <>
              <Bouton
                variant="primaire"
                disabled={ftConnect.status === 'testing'}
                onClick={async () => {
                  setFtConnect({ status: 'testing', msg: 'Connexion…' })
                  try {
                    const result = await window.electronAPI?.franceTravailConnect?.({
                      clientId: settings.franceTravailClientId,
                      clientSecret: settings.franceTravailClientSecret,
                    })
                    if (result?.ok) setFtConnect({ status: 'ok', msg: 'Connecté à France Travail ✓' })
                    else setFtConnect({ status: 'err', msg: result?.erreur || 'Erreur de connexion' })
                  } catch (e) {
                    setFtConnect({ status: 'err', msg: e instanceof Error ? e.message : String(e) })
                  }
                }}
                className="w-full justify-center"
              >
                {ftConnect.status === 'testing' ? 'Connexion…' : 'Tester la connexion'}
              </Bouton>
              {ftConnect.status !== 'idle' && (
                <div className={`p-3 rounded-xl text-sm border break-words ${
                  ftConnect.status === 'ok' ? 'bg-vert/10 text-vert border-vert/20'
                  : ftConnect.status === 'testing' ? 'bg-electric/10 text-electric border-electric/20'
                  : 'bg-rouge-error/10 text-rouge-error border-rouge-error/20'
                }`}>
                  {ftConnect.msg}
                </div>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <Champ label="Clé API" valeur={settings.franceTravailClientId} onChange={(v) => set('franceTravailClientId', v)} placeholder="..." />
            <Champ label="Clé secret" valeur={settings.franceTravailClientSecret} onChange={(v) => set('franceTravailClientSecret', v)} placeholder="..." type="password" />
          </div>
        </Carte>

        {/* Configuration IMAP */}
        <Carte
          titre="Boîte mail (IMAP)"
          actions={<Interrupteur actif={settings.imapEnabled} onChange={(v) => set('imapEnabled', v)} label="Activer la boîte mail" />}
          footer={
            <>
              <Bouton
                variant="primaire"
                disabled={imapTest.status === 'testing'}
                onClick={async () => {
                  setImapTest({ status: 'testing', msg: 'Connexion en cours…' })
                  try {
                    const r = await window.electronAPI?.imapConnect?.({
                      host: settings.imapHost,
                      port: settings.imapPort || 993,
                      user: settings.imapUser,
                      password: settings.imapPassword,
                      tlsEnabled: settings.imapTLS !== false,
                    })
                    if (r?.ok) setImapTest({ status: 'ok', msg: r.message || 'Connexion réussie !' })
                    else setImapTest({ status: 'err', msg: r?.erreur || 'Échec de connexion' })
                  } catch (e) {
                    setImapTest({ status: 'err', msg: e instanceof Error ? e.message : String(e) })
                  }
                }}
                className="w-full justify-center"
              >
                {imapTest.status === 'testing' ? 'Test en cours…' : 'Tester la connexion'}
              </Bouton>
              {imapTest.status !== 'idle' && (
                <div className={`p-3 rounded-xl text-sm border break-words ${
                  imapTest.status === 'ok' ? 'bg-vert/10 text-vert border-vert/20'
                  : imapTest.status === 'testing' ? 'bg-electric/10 text-electric border-electric/20'
                  : 'bg-rouge-error/10 text-rouge-error border-rouge-error/20'
                }`}>
                  {imapTest.msg}
                </div>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <Champ label="Hôte" valeur={settings.imapHost} onChange={(v) => set('imapHost', v)} placeholder="imap.gmail.com" />
            <div className="grid grid-cols-2 gap-4">
              <Champ label="Port" valeur={String(settings.imapPort)} onChange={(v) => set('imapPort', parseInt(v) || 993)} placeholder="993" />
              <Champ label="Identifiant" valeur={settings.imapUser} onChange={(v) => set('imapUser', v)} placeholder="email@exemple.com" />
            </div>
            <Champ label="Mot de passe" valeur={settings.imapPassword} onChange={(v) => set('imapPassword', v)} placeholder="********" type="password" />
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.imapTLS}
                onChange={(e) => set('imapTLS', e.target.checked)}
                className="w-5 h-5 rounded-lg border border-bordure bg-surface-3 text-action focus:ring-action/30"
              />
              <span className="text-sm text-text">TLS</span>
            </label>
          </div>
        </Carte>

        {/* Adzuna — offres en ligne (Indeed FR/UK/ES/DE + job boards) */}
        <Carte
          className="!h-auto"
          titre="Adzuna"
          actions={<Interrupteur actif={settings.adzunaEnabled} onChange={(v) => set('adzunaEnabled', v)} label="Activer Adzuna" />}
          footer={renderTestCle('adzuna')}
        >
          <div className="space-y-4">
            <Champ label="Clé API" valeur={settings.adzunaAppId} onChange={(v) => set('adzunaAppId', v)} placeholder="ex : 1a2b3c4d" />
            <Champ label="Clé secret" valeur={settings.adzunaAppKey} onChange={(v) => set('adzunaAppKey', v)} placeholder="..." type="password" />
          </div>
        </Carte>

        {/* Jooble — agrégateur multi-pays */}
        <Carte
          className="!h-auto"
          titre="Jooble"
          actions={<Interrupteur actif={settings.joobleEnabled} onChange={(v) => set('joobleEnabled', v)} label="Activer Jooble" />}
          footer={renderTestCle('jooble')}
        >
          <div className="space-y-4">
            <Champ label="Clé API" valeur={settings.joobleKey} onChange={(v) => set('joobleKey', v)} placeholder="..." type="password" />
          </div>
        </Carte>

        {/* Reed — UK */}
        <Carte
          className="!h-auto"
          titre="Reed"
          actions={<Interrupteur actif={settings.reedEnabled} onChange={(v) => set('reedEnabled', v)} label="Activer Reed" />}
          footer={renderTestCle('reed')}
        >
          <div className="space-y-4">
            <Champ label="Clé API" valeur={settings.reedKey} onChange={(v) => set('reedKey', v)} placeholder="..." type="password" />
          </div>
        </Carte>

        {/* Langue */}
        <Carte className="!h-auto" titre={t('settings.language')}>
          <div className="space-y-4">
            <select
              value={settings.langue}
              onChange={(e) => set('langue', e.target.value)}
              aria-label={t('settings.language')}
              className="w-full px-4 py-3 rounded-xl border border-bordure bg-surface-3 text-text text-sm focus:border-action focus:ring-1 focus:ring-action/30 transition-all"
            >
              <option value="fr">{t('settings.languages.fr')}</option>
              <option value="es">{t('settings.languages.es')}</option>
            </select>
          </div>
        </Carte>
      </div>
    </div>
  )
}
