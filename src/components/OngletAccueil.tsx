import { useState } from 'react'
import { useStore } from '../store/useStore'
import {
  Building2,
  Mail,
  Globe,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Layers,
} from 'lucide-react'
import { joursDepuis, origineOffre, familleSource, canalOffre, PLATEFORMES, type CanalOffre } from '../utils/offres'
import { Carte } from './ui/Carte'
import { Bouton } from './ui/Bouton'
import PageHeader from './ui/PageHeader'
import { useT } from '../i18n/useT'

export default function OngletAccueil() {
  const offres = useStore((s) => s.offres)
  const addOffre = useStore((s) => s.addOffre)
  const searchMotsCles = useStore((s) => s.searchMotsCles)
  const settings = useStore((s) => s.settings)
  const setCurrentTab = useStore((s) => s.setCurrentTab)
  const setOffresFiltre = useStore((s) => s.setOffresFiltre)
  const { t } = useT()
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'ok' | 'erreur'>('idle')
  const [importMessage, setImportMessage] = useState('')

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

  // ── Import plateformes en ligne (Adzuna) ───────────────
  const importerEnLigne = async () => {
    if (!window.electronAPI?.chercherEnLigne) {
      setImportStatus('erreur')
      setImportMessage('API Electron non disponible.')
      return
    }
    setImportStatus('loading')
    setImportMessage('Recherche en ligne…')
    try {
      const r = await window.electronAPI.chercherEnLigne({
        motsCles: searchMotsCles.join(' ').trim(),
        localisation: '',
        adzunaAppId: settings.adzunaAppId,
        adzunaAppKey: settings.adzunaAppKey,
        joobleKey: settings.joobleKey,
        reedKey: settings.reedKey,
      })
      if (r.ok) {
        const recues = r.offres || []
        const urls = new Set(useStore.getState().offres.map((o) => o.url).filter(Boolean))
        const nouvelles = recues.filter((o) => o.url && !urls.has(o.url))
        for (const o of nouvelles) addOffre(o)
        setImportStatus('ok')
        setImportMessage(
          nouvelles.length > 0
            ? `${nouvelles.length} offre${nouvelles.length > 1 ? 's' : ''} importée${nouvelles.length > 1 ? 's' : ''}`
            : r.erreurs && r.erreurs.length ? r.erreurs[0] : 'Aucune nouvelle offre en ligne.'
        )
      } else {
        setImportStatus('erreur')
        setImportMessage('Échec de la recherche en ligne.')
      }
    } catch (e) {
      setImportStatus('erreur')
      setImportMessage(e instanceof Error ? e.message : 'Erreur inconnue')
    }
  }

  // ── Données dérivées ───────────────────────────────────
  const nbFT = offres.filter((o) => origineOffre(o) === 'france-travail').length
  const nbMail = offres.filter((o) => origineOffre(o) === 'email').length
  const trier = (liste: typeof offres, limite = 10) =>
    [...liste]
      .sort((a, b) => new Date(b.dateAjout || 0).getTime() - new Date(a.dateAjout || 0).getTime())
      .slice(0, limite)
  const dernieresMail = trier(offres.filter((o) => origineOffre(o) === 'email'))
  const dernieresFT = trier(offres.filter((o) => origineOffre(o) === 'france-travail'))
  const offresPlateforme = offres.filter((o) => origineOffre(o) === 'plateforme')
  // Cartes dédiées toujours affichées + toute autre plateforme ayant des offres
  const famillesAffichees = [
    ...new Set([...PLATEFORMES, ...offresPlateforme.map((o) => familleSource(o.source))]),
  ]

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
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-text-muted whitespace-nowrap">{o.dateAjout ? `${joursDepuis(o.dateAjout)}j` : ''}</span>
              {o.url && <ExternalLink className="w-3.5 h-3.5 text-text-muted" />}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-text-muted text-center py-6">{videMsg}</p>
    )

  // Un dégradé distinct par plateforme (ordre = PLATEFORMES)
  const ACCENTS_PLATEFORME = ['from-vert to-vert/70', 'from-orange-500 to-orange-400', 'from-cyan-500 to-cyan-400']
  const compteurs: { filtre: CanalOffre; label: string; valeur: number; icone: React.ReactNode; accent: string }[] = [
    { filtre: 'tout', label: 'Total des offres', valeur: offres.length, icone: <Layers className="w-5 h-5 text-white" />, accent: 'from-action to-action-vif' },
    { filtre: 'france-travail', label: 'France Travail', valeur: nbFT, icone: <Building2 className="w-5 h-5 text-white" />, accent: 'from-electric to-electric/70' },
    { filtre: 'email', label: 'Boîte mail', valeur: nbMail, icone: <Mail className="w-5 h-5 text-white" />, accent: 'from-rose to-rose/70' },
    ...PLATEFORMES.map((p, i) => ({
      filtre: p as CanalOffre,
      label: p,
      valeur: offres.filter((o) => canalOffre(o) === p).length,
      icone: <Globe className="w-5 h-5 text-white" />,
      accent: ACCENTS_PLATEFORME[i % ACCENTS_PLATEFORME.length],
    })),
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* En-tête */}
      <PageHeader
        icon={<LayoutDashboard className="w-5 h-5 text-white" />}
        title="Tableau de bord"
        subtitle={offres.length === 0 ? 'Importez vos offres pour démarrer' : `${offres.length} offre${offres.length > 1 ? 's' : ''} au total`}
      />

      {/* Compteurs cliquables (filtrent l'onglet Offres) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {compteurs.map((c) => (
          <button
            key={c.filtre}
            onClick={() => ouvrirOffres(c.filtre)}
            className="text-left rounded-2xl bg-surface-2 border border-bordure shadow-sm p-6 card-hover"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br ${c.accent}`}>
                {c.icone}
              </div>
              <p className="text-3xl font-bold text-white">{c.valeur}</p>
            </div>
            <p className="text-sm text-text-dim">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Import des offres */}
      <Carte titre={t('dashboard.import.title')} icone={<Mail className="w-5 h-5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Bouton variant="secondaire" onClick={importerDepuisIMAP} disabled={importStatus === 'loading'} className="py-4 text-base">
            {importStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            {t('dashboard.import.fromMail')}
          </Bouton>
          <Bouton variant="secondaire" onClick={importerDepuisFT} disabled={importStatus === 'loading'} className="py-4 text-base">
            <Building2 className="w-5 h-5" />
            {t('dashboard.import.fromFT')}
          </Bouton>
          <Bouton variant="secondaire" onClick={importerEnLigne} disabled={importStatus === 'loading'} className="py-4 text-base">
            <Globe className="w-5 h-5" />
            Plateformes (Adzuna · Jooble · Reed)
          </Bouton>
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
          <p className="mt-3 text-xs text-text-muted text-center">
            Configurez votre boîte mail et/ou France Travail dans l'onglet Paramètres.
          </p>
        )}
      </Carte>

      {/* Dernières offres : Boîte mail / France Travail */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Carte titre="Dernières — Boîte mail" icone={<Mail className="w-5 h-5" />}>
          {renderListe(dernieresMail, 'Aucune offre importée par mail.')}
          {dernieresMail.length > 0 && (
            <button
              onClick={() => ouvrirOffres('email')}
              className="text-sm text-action font-medium hover:underline text-center w-full block mt-3"
            >
              Voir toutes les offres mail
            </button>
          )}
        </Carte>

        <Carte titre="Dernières — France Travail" icone={<Building2 className="w-5 h-5" />}>
          {renderListe(dernieresFT, 'Aucune offre France Travail.')}
          {dernieresFT.length > 0 && (
            <button
              onClick={() => ouvrirOffres('france-travail')}
              className="text-sm text-action font-medium hover:underline text-center w-full block mt-3"
            >
              Voir toutes les offres France Travail
            </button>
          )}
        </Carte>
      </div>

      {/* Une carte dédiée par plateforme — 100 dernières offres */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {famillesAffichees.map((fam) => {
          const liste = trier(offresPlateforme.filter((o) => familleSource(o.source) === fam), 100)
          return (
            <Carte key={fam} titre={fam} icone={<Globe className="w-5 h-5" />}>
              <p className="text-xs text-text-muted mb-2">
                {liste.length > 0 ? `${liste.length} offre${liste.length > 1 ? 's' : ''}` : 'Non configurée / aucune offre'}
              </p>
              <div className="max-h-[420px] overflow-y-auto pr-1">
                {renderListe(liste, 'Configure la clé dans Paramètres, puis lance une recherche.')}
              </div>
              {liste.length > 0 && (
                <button
                  onClick={() => ouvrirOffres(fam as CanalOffre)}
                  className="text-sm text-action font-medium hover:underline text-center w-full block mt-3"
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
