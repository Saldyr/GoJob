// Types pour l'API exposée par electron/preload.cjs
// window.electronAPI = contextBridge.exposeInMainWorld('electronAPI', ...)

interface ElectronAPI {
  chargerSecrets: () => Promise<{
    cleApi?: string
    franceTravailClientId?: string
    franceTravailClientSecret?: string
    imapUser?: string
    imapPassword?: string
    adzunaAppId?: string
    adzunaAppKey?: string
    joobleKey?: string
    reedKey?: string
  }>

  sauvegarderSecrets: (secrets: {
    cleApi?: string
    franceTravailClientId?: string
    franceTravailClientSecret?: string
    imapUser?: string
    imapPassword?: string
    adzunaAppId?: string
    adzunaAppKey?: string
    joobleKey?: string
    reedKey?: string
  }) => Promise<{ ok: boolean; erreur?: string }>

  imapConnect: (params: { host: string; port: number; user: string; password: string; tlsEnabled: boolean }) => Promise<{ ok: boolean; message?: string; erreur?: string }>

  imapFetchRecent: (params: {
    host: string; port: number; user: string; password: string
    tlsEnabled: boolean; maxEmails?: number
  }) => Promise<{ ok: boolean; offres?: import('./store/useStore').Offre[]; total?: number; uids?: number[]; erreur?: string }>

  franceTravailConnect: (params: { clientId: string; clientSecret: string; scope?: string }) => Promise<{ ok: boolean; token?: string; erreur?: string }>

  franceTravailOffres: (params: { motsCles?: string; localisation?: string }) => Promise<{ ok: boolean; offres?: import('./store/useStore').Offre[]; erreur?: string }>

  chercherEnLigne: (params: { motsCles?: string; localisation?: string; adzunaAppId?: string; adzunaAppKey?: string; joobleKey?: string; reedKey?: string }) => Promise<{ ok: boolean; offres?: import('./store/useStore').Offre[]; erreurs?: string[]; total?: number }>

  testerCle: (params: { plateforme: 'adzuna' | 'jooble' | 'reed'; adzunaAppId?: string; adzunaAppKey?: string; joobleKey?: string; reedKey?: string }) => Promise<{ ok: boolean; count?: number; erreur?: string }>

  openUrl: (url: string) => Promise<void>
}

interface Window {
  electronAPI?: ElectronAPI
}
