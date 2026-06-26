const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Secrets chiffrés (safeStorage)
  sauvegarderSecrets: (secrets) => ipcRenderer.invoke('sauvegarder-secrets', secrets),
  chargerSecrets: () => ipcRenderer.invoke('charger-secrets'),

  // France Travail
  franceTravailConnect: (params) => ipcRenderer.invoke('france-travail-connect', params),
  franceTravailOffres: (params) => ipcRenderer.invoke('france-travail-offres', params),

  // Recherche en ligne (Adzuna, Jooble, Reed)
  chercherEnLigne: (params) => ipcRenderer.invoke('chercher-en-ligne', params),

  // Test d'une clé API plateforme
  testerCle: (params) => ipcRenderer.invoke('tester-cle', params),

  // IMAP : test de connexion + import des alertes emploi
  imapConnect: (params) => ipcRenderer.invoke('imap-connect', params),
  imapFetchRecent: (params) => ipcRenderer.invoke('imap-fetch-recent', params),

  // Ouvrir une URL dans le navigateur par défaut
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
})
