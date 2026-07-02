import { useState } from 'react'
import { useStore } from '../store/useStore'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  RefreshCw,
} from 'lucide-react'
import { ancienneteCourt, origineOffre, familleSource, canalOffre, canalActif, offreActive, PLATEFORMES, type CanalOffre } from '../utils/offres'
import { Carte } from './ui/Carte'
import { Bouton } from './ui/Bouton'
import { DonutPlateformes } from './ui/DonutPlateformes'
import PageHeader from './ui/PageHeader'
import { useT } from '../i18n/useT'

export default function OngletAccueil() {
  const offresBrutes = useStore((s) => s.offres)
  const addOffre = useStore((s) => s.addOffre)
  const searchMotsCles = useStore((s) => s.searchMotsCles)
  const settings = useStore((s) => s.settings)
  const setCurrentTab = useStore((s) => s.setCurrentTab)
  const setOffresFiltre = useStore((s) => s.setOffresFiltre)
  const { t } = useT()
  // Offres visibles = uniquement celles des plateformes activées dans les Réglages.
  // (les offres restent stockées : réactiver une plateforme les réaffiche instantanément)
  const offres = offresBrutes.filter((o) => offreActive(o, settings))
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'ok' | 'erreur'>('idle')
  const [importMessage, setImportMessage] = useState('')
  // Quelle plateforme est en cours de rafraîchissement ('all' = bouton global). null = aucune.
  const [loadingCible, setLoadingCible] = useState<string | null>(null)

  // ── Import boîte mail (IMAP) ───────────────────────────
  const importerDepuisIMAP = async () => {
    if (!window.electronAPI?.imapFetchRecent) {
      setImportStatus('erreur')
      setImportMessage('API Electron non disponible (lance l\'app avec npm run electron:dev)')
      return
    }
    setImportStatus('loading')
    setImportMessage(t('dashboard.import.status.loading'))

    try {
      const result = await window.electronAPI.imapFetchRecent({
        host: settings.imapHost,
        port: settings.imapPort || 993,
        user: settings.imapUser,
        password: settings.imapPassword,
        tlsEnabled: settings.imapTLS !== false,
        maxEmails: 150,
      })

      if (result.ok) {
        const recues = result.offres || []
        const urlsExistantes = new Set(useStore.getState().offres.map((o) => o.url).filter(Boolean))
        const nouvelles = recues.filter((o) => o.url && !urlsExistantes.has(o.url))
        for (const o of nouvelles) addOffre(o)
        setImportStatus('ok')
        if (nouvelles.length > 0) {
          setImportMessage(`${nouvelles.length} offre${nouvelles.length > 1 ? 's' : ''} importée${nouvelles.length > 1 ? 's' : ''}`)
        } else if (recues.length > 0) {
          setImportMessage('Aucune nouvelle offre (toutes déjà importées).')
        } else if ((result.total || 0) === 0) {
          setImportMessage('Aucune alerte emploi trouvée (LinkedIn, Indeed, Meteojob…) dans les 30 derniers jours.')
        } else {
          setImportMessage('Alertes trouvées, mais aucun lien d\'offre détecté dedans.')
        }
      } else {
        setImportStatus('erreur')
        setImportMessage(result.erreur || t('dashboard.import.status.error'))
      }
    } catch (e) {
      setImportStatus('erreur')
      setImportMessage(e instanceof Error ? e.message : 'Erreur inconnue')
    }
  }

  // ── Import France Travail ──────────────────────────────
  const importerDepuisFT = async () => {
    if (!settings.franceTravailClientId || !settings.franceTravailClientSecret) {
      setImportStatus('erreur')
      setImportMessage(t('dashboard.import.status.noFTConfig'))
      return
    }
    if (!window.electronAPI?.franceTravailConnect) {
      setImportStatus('erreur')
      setImportMessage(t('dashboard.import.status.ftSearchError'))
      return
    }
    setImportStatus('loading')
    setImportMessage(t('dashboard.import.status.loading'))

    try {
      const connect = await window.electronAPI.franceTravailConnect({
        clientId: settings.franceTravailClientId,
        clientSecret: settings.franceTravailClientSecret,
      })
      if (!connect.ok) {
        setImportStatus('erreur')
        setImportMessage(connect.erreur || t('dashboard.import.status.ftError'))
        return
      }

      setImportMessage(t('dashboard.import.status.loading'))
      const result = await window.electronAPI.franceTravailOffres({
        motsCles: searchMotsCles.join(' ').trim(),
        localisation: '',
      })

      if (result.ok) {
        const nouvellesOffres = result.offres || []
        for (const o of nouvellesOffres) {
          addOffre(o)
        }
        setImportStatus('ok')
        setImportMessage(t('dashboard.import.status.ok', { count: nouvellesOffres.length }))
      } else {
        setImportStatus('erreur')
        setImportMessage(result.erreur || t('dashboard.import.status.ftSearchError'))
      }
    } catch (e) {
      setImportStatus('erreur')
      setImportMessage(e instanceof Error ? e.message : 'Erreur inconnue')
    }
  }

  // ── Import d'une seule plateforme en ligne (Adzuna / Jooble / Reed) ──
  const importerEnLigneCible = async (cible: 'Adzuna' | 'Jooble' | 'Reed') => {
    if (!window.electronAPI?.chercherEnLigne) {
      setImportStatus('erreur')
      setImportMessage('API Electron non disponible.')
      return
    }
    setImportStatus('loading')
    setImportMessage(`Recherche ${cible}…`)
    try {
      const cfg: {
        motsCles: string; localisation: string
        adzunaAppId?: string; adzunaAppKey?: string; joobleKey?: string; reedKey?: string
      } = { motsCles: searchMotsCles.join(' ').trim(), localisation: '' }
      if (cible === 'Adzuna') { cfg.adzunaAppId = settings.adzunaAppId; cfg.adzunaAppKey = settings.adzunaAppKey }
      if (cible === 'Jooble') cfg.joobleKey = settings.joobleKey
      if (cible === 'Reed') cfg.reedKey = settings.reedKey

      const r = await window.electronAPI.chercherEnLigne(cfg)
      if (r.ok) {
        const recues = r.offres || []
        const urls = new Set(useStore.getState().offres.map((o) => o.url).filter(Boolean))
        const nouvelles = recues.filter((o) => o.url && !urls.has(o.url))
        for (const o of nouvelles) addOffre(o)
        setImportStatus('ok')
        setImportMessage(
          nouvelles.length > 0
            ? `${cible} : ${nouvelles.length} offre${nouvelles.length > 1 ? 's' : ''} importée${nouvelles.length > 1 ? 's' : ''}`
            : r.erreurs && r.erreurs.length ? r.erreurs[0] : `${cible} : aucune nouvelle offre.`
        )
      } else {
        setImportStatus('erreur')
        setImportMessage(`Échec de la recherche ${cible}.`)
      }
    } catch (e) {
      setImportStatus('erreur')
      setImportMessage(e instanceof Error ? e.message : 'Erreur inconnue')
    }
  }

  // Lance un import en marquant la plateforme active (spinner sur son bouton).
  const lancerImport = async (key: string, fn: () => Promise<void>) => {
    if (loadingCible) return
    setLoadingCible(key)
    try { await fn() } finally { setLoadingCible(null) }
  }

  // Rafraîchit toutes les plateformes d'un coup.
  const toutRafraichir = async () => {
    if (loadingCible) return
    setLoadingCible('all')
    try {
      if (settings.imapEnabled) await importerDepuisIMAP()
      if (settings.franceTravailEnabled) await importerDepuisFT()
      if (settings.adzunaEnabled) await importerEnLigneCible('Adzuna')
      if (settings.joobleEnabled) await importerEnLigneCible('Jooble')
      if (settings.reedEnabled) await importerEnLigneCible('Reed')
    } finally { setLoadingCible(null) }
  }

  // ── Données dérivées ───────────────────────────────────
  const nbFT = offres.filter((o) => origineOffre(o) === 'france-travail').length
  const nbMail = offres.filter((o) => origineOffre(o) === 'email').length
  const trier = (liste: typeof offres, limite = 10) =>
    [...liste]
      .sort((a, b) => new Date(b.dateAjout || 0).getTime() - new Date(a.dateAjout || 0).getTime())
      .slice(0, limite)
  const dernieresMail = trier(offres.filter((o) => origineOffre(o) === 'email'), 100)
  const dernieresFT = trier(offres.filter((o) => origineOffre(o) === 'france-travail'), 100)
  const offresPlateforme = offres.filter((o) => origineOffre(o) === 'plateforme')
  // Cartes dédiées (plateformes activées) + toute autre plateforme activée ayant des offres
  const famillesAffichees = [
    ...new Set([...PLATEFORMES, ...offresPlateforme.map((o) => familleSource(o.source))]),
  ].filter((fam) => canalActif(fam as Exclude<CanalOffre, 'tout'>, settings))

  const ouvrirOffres = (filtre: CanalOffre) => {
    setOffresFiltre(filtre)
    setCurrentTab('offres')
  }

  const renderListe = (liste: typeof offres, videMsg: string) =>
    liste.length > 0 ? (
      <div className="space-y-2">
        {liste.map((o) => (
          <div
            key={o.id}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-3 border border-bordure cursor-pointer hover:bg-surface-3/80 transition-colors"
            onClick={() => (o.url ? window.electronAPI?.openUrl?.(o.url) : setCurrentTab('offres'))}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate font-medium">{o.titre}</p>
              <p className="text-xs text-text-dim truncate">
                {o.entreprise || o.source}{o.ville ? ` · ${o.ville}` : ''}
              </p>
            </div>
            <span className="text-xs text-text-muted whitespace-nowrap shrink-0">{o.dateAjout ? ancienneteCourt(o.dateAjout) : ''}</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-text-dim text-center py-6">{videMsg}</p>
    )

  // Une couleur propre par plateforme (palette Nebula cohérente et distincte)
  const COULEURS_PLATEFORME: Record<string, string> = {
    'france-travail': '#22d3ee', // cyan
    email: '#f472b6',            // rose
    Adzuna: '#a855f7',           // violet
    Jooble: '#3b82f6',           // bleu
    Reed: '#e879f9',             // fuchsia
  }
  const segmentsPlateforme = [
    { key: 'france-travail', label: 'France Travail', value: nbFT },
    { key: 'email', label: 'Boîte mail', value: nbMail },
    ...PLATEFORMES.map((p) => ({ key: p, label: p, value: offres.filter((o) => canalOffre(o) === p).length })),
  ]
    .filter((s) => canalActif(s.key as Exclude<CanalOffre, 'tout'>, settings))
    .map((s) => ({ ...s, color: COULEURS_PLATEFORME[s.key] || '#6d5cff' }))

  // Boutons de rafraîchissement — un par plateforme, couleur = celle du donut
  const IMPORTS: { key: string; label: string; color: string; run: () => Promise<void> }[] = [
    { key: 'email', label: 'Boîte mail', color: COULEURS_PLATEFORME.email, run: importerDepuisIMAP },
    { key: 'france-travail', label: 'France Travail', color: COULEURS_PLATEFORME['france-travail'], run: importerDepuisFT },
    { key: 'Adzuna', label: 'Adzuna', color: COULEURS_PLATEFORME.Adzuna, run: () => importerEnLigneCible('Adzuna') },
    { key: 'Jooble', label: 'Jooble', color: COULEURS_PLATEFORME.Jooble, run: () => importerEnLigneCible('Jooble') },
    { key: 'Reed', label: 'Reed', color: COULEURS_PLATEFORME.Reed, run: () => importerEnLigneCible('Reed') },
  ]

  // Pastille de couleur (comme la légende du donut) pour les en-têtes de carte plateforme
  const pastille = (color: string) => (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
    />
  )

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* En-tête */}
      <PageHeader
        icon={<LayoutDashboard className="w-5 h-5 text-white" />}
        title="Tableau de bord"
        subtitle={offres.length === 0 ? 'Importez vos offres pour démarrer' : `${offres.length} offre${offres.length > 1 ? 's' : ''} au total`}
      />

      {/* Répartition des offres par plateforme — donut (couleur + longueur ∝ nombre) */}
      <div className="rounded-2xl bg-surface-2 border border-bordure shadow-sm p-6 sm:p-8">
        <DonutPlateformes
          segments={segmentsPlateforme}
          total={offres.length}
          centerLabel={offres.length > 1 ? 'offres' : 'offre'}
          onSelect={(k) => ouvrirOffres(k as CanalOffre)}
        />
      </div>

      {/* Rafraîchir les offres */}
      <Carte titre="Rafraîchir les offres" icone={<RefreshCw className="w-5 h-5" />}>
        {/* Explication + bouton global */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <p className="text-sm text-text-dim max-w-xl">
            Clique sur une plateforme pour récupérer ses dernières offres.
          </p>
          <Bouton variant="primaire" taille="sm" onClick={toutRafraichir} disabled={loadingCible !== null} className="shrink-0">
            {loadingCible === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Tout rafraîchir
          </Bouton>
        </div>

        {/* Un bouton par plateforme */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {IMPORTS.filter((p) => canalActif(p.key as Exclude<CanalOffre, 'tout'>, settings)).map((p) => {
            const loading = loadingCible === p.key
            return (
              <Bouton
                key={p.key}
                variant="secondaire"
                taille="sm"
                onClick={() => lancerImport(p.key, p.run)}
                disabled={loadingCible !== null}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: p.color }} />
                ) : (
                  <span className="truncate">{p.label}</span>
                )}
              </Bouton>
            )
          })}
        </div>

        {importStatus !== 'idle' && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
              importStatus === 'loading'
                ? 'bg-electric/10 text-electric border border-electric/20'
                : importStatus === 'ok'
                ? 'bg-vert/10 text-vert border border-vert/20'
                : 'bg-rose/10 text-rose border border-rose/20'
            }`}
          >
            {importStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            {importStatus === 'ok' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {importStatus === 'erreur' && <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{importMessage}</span>
          </div>
        )}

        {importStatus === 'idle' && !settings.imapHost && (
          <p className="mt-3 text-xs text-text-dim text-center">
            Configurez votre boîte mail et/ou France Travail dans l'onglet Paramètres.
          </p>
        )}
      </Carte>

      {/* Toutes les cartes plateformes — même grille, même taille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {settings.imapEnabled && (
          <Carte titre="Boîte mail" icone={pastille(COULEURS_PLATEFORME.email)}>
            <div className="max-h-[440px] overflow-y-auto pr-1">
              {renderListe(dernieresMail, 'Aucune offre importée par mail.')}
            </div>
            {dernieresMail.length > 0 && (
              <button
                onClick={() => ouvrirOffres('email')}
                className="text-sm text-action font-medium hover:underline text-center w-full block mt-5"
              >
                Voir toutes les offres mail
              </button>
            )}
          </Carte>
        )}

        {settings.franceTravailEnabled && (
          <Carte titre="France Travail" icone={pastille(COULEURS_PLATEFORME['france-travail'])}>
            <div className="max-h-[440px] overflow-y-auto pr-1">
              {renderListe(dernieresFT, 'Aucune offre France Travail.')}
            </div>
            {dernieresFT.length > 0 && (
              <button
                onClick={() => ouvrirOffres('france-travail')}
                className="text-sm text-action font-medium hover:underline text-center w-full block mt-5"
              >
                Voir toutes les offres France Travail
              </button>
            )}
          </Carte>
        )}

        {famillesAffichees.map((fam) => {
          const liste = trier(offresPlateforme.filter((o) => familleSource(o.source) === fam), 100)
          return (
            <Carte key={fam} titre={fam} icone={pastille(COULEURS_PLATEFORME[fam] || '#6d5cff')}>
              <div className="max-h-[440px] overflow-y-auto pr-1">
                {renderListe(liste, 'Configure la clé dans Paramètres, puis lance une recherche.')}
              </div>
              {liste.length > 0 && (
                <button
                  onClick={() => ouvrirOffres(fam as CanalOffre)}
                  className="text-sm text-action font-medium hover:underline text-center w-full block mt-5"
                >
                  Voir toutes les offres {fam}
                </button>
              )}
            </Carte>
          )
        })}
      </div>
    </div>
  )
}
