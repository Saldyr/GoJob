// Types pour l'API exposée par electron/preload.js
// window.electronAPI = contextBridge.exposeInMainWorld('electronAPI', ...)

interface ElectronAPI {
  genererLettre: (params: {
    offre: { titre: string; entreprise: string; description: string; url: string; source: string }
    cvText: string
    competences: string[]
    nom: string
    endpoint: string
    modele: string
    cleApi: string
    titreMetier: string
    langue: string
  }) => Promise<{ ok: boolean; contenu?: string; erreur?: string }>

  copierPressePapier: (texte: string) => Promise<boolean>

  importerCv: () => Promise<{ ok: boolean; nom: string; texte: string; chemin?: string; erreur?: string }>

  detecterSource: (url: string) => Promise<{ source: string; freelance: boolean; detection?: string }>

  chiffrerCleApi: (cle: string) => Promise<string>
  dechiffrerCleApi: (cleChiffree: string) => Promise<string>

  chargerSecrets: () => Promise<{
    cleApi: string
    franceTravailClientId: string
    franceTravailClientSecret: string
    imap: { host: string; port: number; user: string; password: string; tls: boolean } | null
  }>

  sauvegarderSecrets: (secrets: {
    cleApi: string
    franceTravailClientId: string
    franceTravailClientSecret: string
    imap: { host: string; port: number; user: string; password: string; tls: boolean }
  }) => Promise<boolean>

  testerCle: (params: { endpoint: string; modele: string; cleApi: string }) => Promise<{ ok: boolean; erreur?: string }>

  imapConnect: (params: { host: string; port: number; user: string; password: string; tlsEnabled: boolean }) => Promise<{ ok: boolean; message?: string; erreur?: string }>

  franceTravailConnect: (params: { clientId: string; clientSecret: string; scope: string }) => Promise<{ ok: boolean; token?: string; erreur?: string }>

  exporterDonnees: () => Promise<string>
  importerDonnees: () => Promise<{ ok: boolean; erreur?: string }>
}

interface Window {
  electronAPI?: ElectronAPI
}
