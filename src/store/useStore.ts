import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

export interface Profile {
  nom: string
  prenom: string
  titre: string
  competences: string[]
  langues: { langue: string; niveau: string }[]
  typesPostes: string[]
  cvText: string
  localisation: string
  ville: string
  codePostal: string
  email: string
  telephone: string
  adresse: string
  resume: string
  formation: string
}

export type StatutOffre = 'a_postuler' | 'postulee' | 'relancee' | 'entretien' | 'refus' | 'acceptee'

export interface Document {
  id: string
  nom: string
  type: 'cv' | 'portfolio' | 'lettre' | 'autre'
  texte: string
  dateAjout: string
  chemin?: string
}

export interface Offre {
  id: string
  titre: string
  entreprise: string
  description: string
  url: string
  source: string
  dateAjout: string
  statut: StatutOffre
  datePostulation?: string
  dateRelance?: string
  notes: string
  lettre?: string           // H4 : lettre sauvegardée attachée à l'offre
  ville?: string
}

export interface AppState {
  profile: Profile
  offres: Offre[]
  documents: Document[]
  settings: {
    cleApi: string
    endpoint: string
    modele: string
    langue: string
    franceTravailClientId: string
    franceTravailClientSecret: string
    imapHost: string
    imapPort: number
    imapUser: string
    imapPassword: string
    imapTLS: boolean
  }
  onboardingDone: boolean
  setProfile: (p: Profile) => void
  updateProfile: (p: Partial<Profile>) => void
  addOffre: (o: Offre) => void
  updateOffre: (id: string, data: Partial<Offre>) => void
  removeOffre: (id: string) => void
  updateSettings: (s: Partial<AppState['settings']>) => void
  currentTab: string
  setCurrentTab: (tab: string) => void
  addDocument: (d: Document) => void
  removeDocument: (id: string) => void
  updateDocument: (id: string, data: Partial<Document>) => void
  setOnboardingDone: (done: boolean) => void
  loadFromDisk: () => void
  saveToDisk: () => void
}

const DEFAULT_PROFILE: Profile = {
  nom: '',
  prenom: '',
  titre: '',
  competences: [],
  langues: [],
  typesPostes: [],
  cvText: '',
  localisation: '',
  ville: '',
  codePostal: '',
  email: '',
  telephone: '',
  adresse: '',
  resume: '',
  formation: '',
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

const STORAGE_KEY = 'gojob-data'
const BACKUP_KEY = 'gojob-data-backup'
const SCHEMA_VERSION = 1

function safeParse(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return typeof d.profile === 'object' && Array.isArray(d.offres)
}

function migrerDepuisLegacy(parsed: Record<string, unknown>): Record<string, unknown> {
  // Version 0 → 1 : ajout ville/notes/lettre sur chaque offre si manquant
  if (parsed._schemaVersion === 1) return parsed
  const offres = (parsed.offres || []) as Array<Record<string, unknown>>
  parsed.offres = offres.map((o) => ({
    ...o,
    ville: o.ville || '',
    notes: o.notes || '',
    lettre: o.lettre || '',
  }))
  parsed._schemaVersion = SCHEMA_VERSION
  return parsed
}

export const useStore = create<AppState>((set, get) => ({
  profile: { ...DEFAULT_PROFILE },
  offres: [],
  documents: [],
  settings: {
    cleApi: '',
    endpoint: 'https://api.deepseek.com/v1',
    modele: 'deepseek-chat',
    langue: 'fr',
    franceTravailClientId: '',
    franceTravailClientSecret: '',
    imapHost: '',
    imapPort: 993,
    imapUser: '',
    imapPassword: '',
    imapTLS: true,
  },
  onboardingDone: false,

  setProfile: (p) => set({ profile: p }),
  updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

  addOffre: (o) =>
    set((s) => ({
      offres: [
        { ...o, id: o.id || generateId(), dateAjout: o.dateAjout || new Date().toISOString() },
        ...s.offres,
      ],
    })),

  updateOffre: (id, data) =>
    set((s) => ({
      offres: s.offres.map((o) => (o.id === id ? { ...o, ...data } : o)),
    })),

  removeOffre: (id) =>
    set((s) => ({
      offres: s.offres.filter((o) => o.id !== id),
    })),

  updateSettings: (s) =>
    set((state) => ({
      settings: { ...state.settings, ...s },
    })),

  currentTab: 'accueil',
  setCurrentTab: (tab: string) => set({ currentTab: tab }),

  addDocument: (d) =>
    set((s) => ({
      documents: [{ ...d, id: d.id || generateId(), dateAjout: d.dateAjout || new Date().toISOString() }, ...s.documents],
    })),

  removeDocument: (id) =>
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
    })),

  updateDocument: (id, data) =>
    set((s) => ({
      documents: s.documents.map((d) => (d.id === id ? { ...d, ...data } : d)),
    })),

  setOnboardingDone: (done) => set({ onboardingDone: done }),

  loadFromDisk: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        // safeParse : vérifie que la structure est cohérente
        if (!safeParse(parsed)) {
          // Corrompu → backup, reset
          try {
            localStorage.setItem(BACKUP_KEY, data)
          } catch (e) {
            console.warn('Impossible de sauvegarder les données corrompues:', e)
          }
          console.warn('Données corrompues, sauvegarde faite dans', BACKUP_KEY)
          set({
            profile: { ...DEFAULT_PROFILE },
            offres: [],
            documents: [],
            settings: {
              cleApi: '', endpoint: 'https://api.deepseek.com/v1', modele: 'deepseek-chat',
              langue: 'fr', franceTravailClientId: '', franceTravailClientSecret: '',
              imapHost: '', imapPort: 993, imapUser: '', imapPassword: '', imapTLS: true,
            },
            onboardingDone: false,
          })
          return
        }

        const migre = migrerDepuisLegacy(parsed)
        // RESTE : on ne lit QUE les settings non-secrets depuis localStorage.
        // Les secrets (cleApi, imapUser, imapPassword, franceTravailClientId/Secret)
        // sont chargés depuis safeStorage côté OngletReglages au montage.
        const lsSettings = (migre.settings as Record<string, unknown>) || {}
        const safeSettings = {
          cleApi: '',
          franceTravailClientId: '',
          franceTravailClientSecret: '',
          imapUser: '',
          imapPassword: '',
          imapHost: (lsSettings.imapHost as string) || '',
          imapPort: (lsSettings.imapPort as number) ?? 993,
          imapTLS: (lsSettings.imapTLS as boolean) ?? true,
          endpoint: (lsSettings.endpoint as string) || 'https://api.deepseek.com/v1',
          modele: (lsSettings.modele as string) || 'deepseek-chat',
          langue: (lsSettings.langue as string) || 'fr',
        }
        set({
          profile: (migre.profile as Profile) || { ...DEFAULT_PROFILE },
          offres: ((migre.offres as Array<Record<string, unknown>>) || []).map((o) => ({
            ...o,
            lettre: (o.lettre as string) || '',
            ville: (o.ville as string) || '',
            notes: (o.notes as string) || '',
          } as Offre)),
          documents: (migre.documents as Document[]) || [],
          settings: safeSettings,
          onboardingDone: (migre.onboardingDone as boolean) || false,
        })
      }
    } catch (e) {
      // Si JSON.parse a échoué → backup brut
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) localStorage.setItem(BACKUP_KEY, raw)
      } catch (e) {
        console.warn('Impossible de sauvegarder le brut corrompu:', e)
      }
      console.warn('Erreur chargement data (reset vers défaut):', e)
    }
  },

  saveToDisk: () => {
    try {
      const s = get()
      // On ne persiste que les settings NON secrets dans localStorage.
      // cleApi, imapUser, imapPassword, franceTravailClientId/Secret
      // sont gérés exclusivement par safeStorage via sauvegarderSecrets IPC.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { cleApi, imapUser, imapPassword, franceTravailClientId, franceTravailClientSecret, ...safeSettings } = s.settings
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          _schemaVersion: SCHEMA_VERSION,
          profile: s.profile,
          offres: s.offres,
          documents: s.documents,
          settings: safeSettings,
          onboardingDone: s.onboardingDone,
        })
      )
    } catch (e) {
      console.warn('Erreur sauvegarde data:', e)
    }
  },
}))

// ── Sélecteurs atomiques Zustand ──────────────────────────
// Chaque sélecteur ne souscrit qu'à la propriété qu'il lit.
export const useProfile = () => useStore((s) => s.profile)
export const useOffres = () => useStore((s) => s.offres)
export const useDocuments = () => useStore((s) => s.documents)
export const useSettings = () => useStore((s) => s.settings)
export const useCurrentTab = () => useStore((s) => s.currentTab)
export const useOnboardingDone = () => useStore((s) => s.onboardingDone)

// Sélecteurs actions (les références fonctions ne changent jamais → pas de re-render)
export const useActions = () => useStore(
  useShallow((s) => ({
    setProfile: s.setProfile,
    updateProfile: s.updateProfile,
    addOffre: s.addOffre,
    updateOffre: s.updateOffre,
    removeOffre: s.removeOffre,
    updateSettings: s.updateSettings,
    setCurrentTab: s.setCurrentTab,
    addDocument: s.addDocument,
    removeDocument: s.removeDocument,
    updateDocument: s.updateDocument,
    setOnboardingDone: s.setOnboardingDone,
    loadFromDisk: s.loadFromDisk,
    saveToDisk: s.saveToDisk,
  }))
)

// Chargement auto + sauvegarde auto
const store = useStore.getState()
store.loadFromDisk()

let saveTimer: ReturnType<typeof setTimeout> | null = null
useStore.subscribe(() => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    useStore.getState().saveToDisk()
  }, 1000)
})
