import { create } from 'zustand'

export interface Profile {
  nom: string
  titre: string
  competences: string[]
  langues: { langue: string; niveau: string }[]
  typesPostes: string[]
  cvText: string
  localisation: string
  email: string
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
  titre: '',
  competences: [],
  langues: [],
  typesPostes: [],
  cvText: '',
  localisation: '',
  email: '',
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

const STORAGE_KEY = 'gojob-data'

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
        // RESTE : on ne lit QUE les settings non-secrets depuis localStorage.
        // Les secrets (cleApi, imapUser, imapPassword, franceTravailClientId/Secret)
        // sont chargés depuis safeStorage côté OngletReglages au montage.
        const lsSettings = parsed.settings || {}
        const safeSettings = {
          cleApi: '',
          franceTravailClientId: '',
          franceTravailClientSecret: '',
          imapUser: '',
          imapPassword: '',
          imapHost: lsSettings.imapHost || '',
          imapPort: lsSettings.imapPort ?? 993,
          imapTLS: lsSettings.imapTLS ?? true,
          endpoint: lsSettings.endpoint || 'https://api.deepseek.com/v1',
          modele: lsSettings.modele || 'deepseek-chat',
          langue: lsSettings.langue || 'fr',
        }
        set({
          profile: parsed.profile || { ...DEFAULT_PROFILE },
          offres: (parsed.offres || []).map((o: Record<string, unknown>) => ({
            ...o,
            lettre: o.lettre || '',
            ville: o.ville || '',
            notes: o.notes || '',
          })),
          documents: parsed.documents || [],
          settings: safeSettings,
          onboardingDone: parsed.onboardingDone || false,
        })
      }
    } catch (e) {
      console.warn('Erreur chargement data:', e)
    }
  },

  saveToDisk: () => {
    try {
      const s = get()
      // On ne persiste que les settings NON secrets dans localStorage.
      // cleApi, imapUser, imapPassword, franceTravailClientId/Secret
      // sont gérés exclusivement par safeStorage via sauvegarderSecrets IPC.
      const { cleApi, imapUser, imapPassword, franceTravailClientId, franceTravailClientSecret, ...safeSettings } = s.settings
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
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
