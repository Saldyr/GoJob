import { create } from 'zustand'
import type { CanalOffre } from '../utils/offres'

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

export type TypeContrat = 'cdi' | 'cdd' | 'freelance' | 'stage' | 'alternance' | 'interim' | ''

export interface Offre {
  id: string
  titre: string
  entreprise: string
  description: string
  url: string
  source: string
  dateAjout: string
  notes: string
  ville?: string
  typeContrat?: TypeContrat
  remote?: boolean
  tags?: string[]
  salaire?: string
}

export interface AppState {
  profile: Profile
  offres: Offre[]
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
    adzunaAppId: string
    adzunaAppKey: string
    joobleKey: string
    reedKey: string
    careerjetAffid: string
    // Activation par plateforme (une source désactivée n'est pas utilisée)
    franceTravailEnabled: boolean
    imapEnabled: boolean
    adzunaEnabled: boolean
    joobleEnabled: boolean
    reedEnabled: boolean
    // Sources sans clé (remote/dev + généraliste) — activées par défaut
    arbeitnowEnabled: boolean
    remotiveEnabled: boolean
    remoteokEnabled: boolean
    museEnabled: boolean
    careerjetEnabled: boolean
    // Onboarding : true une fois l'accueil du 1er lancement passé
    onboardingVu: boolean
  }
  setProfile: (p: Profile) => void
  updateProfile: (p: Partial<Profile>) => void
  addOffre: (o: Offre) => void
  updateOffre: (id: string, data: Partial<Offre>) => void
  removeOffre: (id: string) => void
  updateSettings: (s: Partial<AppState['settings']>) => void
  currentTab: string
  setCurrentTab: (tab: string) => void
  searchMotsCles: string[]
  setSearchMotsCles: (mots: string[]) => void
  offresFiltre: CanalOffre
  setOffresFiltre: (o: CanalOffre) => void
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

const DEFAULT_SETTINGS: AppState['settings'] = {
  cleApi: '',
  endpoint: 'https://api.groq.com/openai/v1',
  modele: 'llama-3.3-70b-versatile',
  langue: 'fr',
  franceTravailClientId: '',
  franceTravailClientSecret: '',
  imapHost: '',
  imapPort: 993,
  imapUser: '',
  imapPassword: '',
  imapTLS: true,
  adzunaAppId: '',
  adzunaAppKey: '',
  joobleKey: '',
  reedKey: '',
  careerjetAffid: '',
  franceTravailEnabled: true,
  imapEnabled: true,
  adzunaEnabled: true,
  joobleEnabled: true,
  reedEnabled: true,
  arbeitnowEnabled: true,
  remotiveEnabled: true,
  remoteokEnabled: true,
  museEnabled: true,
  careerjetEnabled: true,
  onboardingVu: false,
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
  // Version 0 → 1 : ajout ville/notes sur chaque offre si manquant
  if (parsed._schemaVersion === 1) return parsed
  const offres = (parsed.offres || []) as Array<Record<string, unknown>>
  parsed.offres = offres.map((o) => ({
    ...o,
    ville: o.ville || '',
    notes: o.notes || '',
  }))
  parsed._schemaVersion = SCHEMA_VERSION
  return parsed
}

export const useStore = create<AppState>((set, get) => ({
  profile: { ...DEFAULT_PROFILE },
  offres: [],
  settings: { ...DEFAULT_SETTINGS },

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
  searchMotsCles: [],
  setSearchMotsCles: (mots) => set({ searchMotsCles: mots }),
  offresFiltre: 'tout',
  setOffresFiltre: (o) => set({ offresFiltre: o }),

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
            settings: { ...DEFAULT_SETTINGS },
          })
          return
        }

        const migre = migrerDepuisLegacy(parsed)
        // On ne lit QUE les settings non-secrets depuis localStorage.
        // Les secrets (cleApi, imapUser, imapPassword, franceTravailClientId/Secret)
        // sont chargés depuis safeStorage côté OngletReglages au montage.
        const lsSettings = (migre.settings as Record<string, unknown>) || {}
        const safeSettings: AppState['settings'] = {
          cleApi: '',
          franceTravailClientId: '',
          franceTravailClientSecret: '',
          imapUser: '',
          imapPassword: '',
          adzunaAppId: '',
          adzunaAppKey: '',
          joobleKey: '',
          reedKey: '',
          careerjetAffid: '',
          imapHost: (lsSettings.imapHost as string) || '',
          imapPort: (lsSettings.imapPort as number) ?? 993,
          imapTLS: (lsSettings.imapTLS as boolean) ?? true,
          endpoint: (lsSettings.endpoint as string) || DEFAULT_SETTINGS.endpoint,
          modele: (lsSettings.modele as string) || DEFAULT_SETTINGS.modele,
          langue: (lsSettings.langue as string) || 'fr',
          franceTravailEnabled: (lsSettings.franceTravailEnabled as boolean) ?? true,
          imapEnabled: (lsSettings.imapEnabled as boolean) ?? true,
          adzunaEnabled: (lsSettings.adzunaEnabled as boolean) ?? true,
          joobleEnabled: (lsSettings.joobleEnabled as boolean) ?? true,
          reedEnabled: (lsSettings.reedEnabled as boolean) ?? true,
          arbeitnowEnabled: (lsSettings.arbeitnowEnabled as boolean) ?? true,
          remotiveEnabled: (lsSettings.remotiveEnabled as boolean) ?? true,
          remoteokEnabled: (lsSettings.remoteokEnabled as boolean) ?? true,
          museEnabled: (lsSettings.museEnabled as boolean) ?? true,
          careerjetEnabled: (lsSettings.careerjetEnabled as boolean) ?? true,
          onboardingVu: (lsSettings.onboardingVu as boolean) ?? false,
        }
        set({
          profile: (migre.profile as Profile) || { ...DEFAULT_PROFILE },
          offres: ((migre.offres as Array<Record<string, unknown>>) || []).map((o) => ({
            ...o,
            ville: (o.ville as string) || '',
            notes: (o.notes as string) || '',
            typeContrat: (o.typeContrat as string) || '',
            remote: (o.remote as boolean) || false,
            tags: Array.isArray(o.tags) ? o.tags : [],
            salaire: (o.salaire as string) || '',
          } as Offre)),
          settings: safeSettings,
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
    const s = get()
    // On ne persiste que les settings NON secrets dans localStorage.
    // cleApi, imapUser, imapPassword, franceTravailClientId/Secret
    // sont gérés exclusivement par safeStorage via sauvegarderSecrets IPC.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cleApi, imapUser, imapPassword, franceTravailClientId, franceTravailClientSecret, adzunaAppId, adzunaAppKey, joobleKey, reedKey, careerjetAffid, ...safeSettings } = s.settings
    // On ne persiste PAS le champ `description` (souvent plusieurs Ko pour France Travail,
    // jamais affiché dans l'UI) : avec des milliers d'offres il ferait exploser le quota
    // localStorage (~5 Mo) → la sauvegarde échouerait et on perdrait les offres.
    const offresLight = s.offres.map((o) => ({ ...o, description: '' }))
    const ecrire = (offres: typeof offresLight) =>
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ _schemaVersion: SCHEMA_VERSION, profile: s.profile, offres, settings: safeSettings })
      )
    try {
      ecrire(offresLight)
    } catch {
      // Quota dépassé malgré tout : on conserve les 2000 offres les plus récentes plutôt que de tout perdre.
      try {
        const recentes = [...offresLight]
          .sort((a, b) => new Date(b.dateAjout || 0).getTime() - new Date(a.dateAjout || 0).getTime())
          .slice(0, 2000)
        ecrire(recentes)
      } catch (e) {
        console.warn('Erreur sauvegarde data (quota):', e)
      }
    }
  },
}))

// Chargement auto + sauvegarde auto (debounce 1s)
const store = useStore.getState()
store.loadFromDisk()

let saveTimer: ReturnType<typeof setTimeout> | null = null
useStore.subscribe(() => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    useStore.getState().saveToDisk()
  }, 1000)
})
