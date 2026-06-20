const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Presse-papier
  copierPressePapier: (texte) => ipcRenderer.invoke('copier-presse-papier', texte),

  // LLM
  genererLettre: (params) => ipcRenderer.invoke('generer-lettre', params),
  testerCle: (params) => ipcRenderer.invoke('tester-cle', params),

  // SafeStorage (E1)
  safeChiffrer: (plaintext) => ipcRenderer.invoke('safe-chiffrer', plaintext),
  safeDechiffrer: (encrypted) => ipcRenderer.invoke('safe-dechiffrer', encrypted),
  sauvegarderSecrets: (secrets) => ipcRenderer.invoke('sauvegarder-secrets', secrets),
  chargerSecrets: () => ipcRenderer.invoke('charger-secrets'),

  // Import CV (5)
  importerCv: () => ipcRenderer.invoke('importer-cv'),

  // France Travail
  franceTravailConnect: (params) => ipcRenderer.invoke('france-travail-connect', params),
  franceTravailOffres: (params) => ipcRenderer.invoke('france-travail-offres', params),

  // IMAP réel (C3)
  imapConnect: (params) => ipcRenderer.invoke('imap-connect', params),

  // Détection source (7)
  detecterSource: (url) => ipcRenderer.invoke('detecter-source', url),

  // Export (H2) — ne contient jamais les secrets
  exporterDonnees: (donnees) => ipcRenderer.invoke('exporter-donnees', donnees),
})
