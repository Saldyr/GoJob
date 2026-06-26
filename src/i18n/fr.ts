// Dictionnaire français — GoJob
// Vouvoiement (vous) partout. Ne contient que les clés réellement utilisées.

export type DictValue = string | ((params: { count: number }) => string)
export type Dict = { [key: string]: DictValue | Dict }

const fr: Dict = {
  /* ── Sidebar ── */
  "sidebar.dashboard": "Tableau de bord",
  "sidebar.offers": "Offres d'emploi",
  "sidebar.settings": "Paramètres",

  /* ── Tableau de bord (OngletAccueil) ── */
  dashboard: {
    import: {
      title: "Importer des offres",
      fromMail: "Importer depuis ma boîte mail",
      fromFT: "France Travail",
      status: {
        loading: "Connexion en cours...",
        ok: ({ count }) => `${count} offre${count > 1 ? "s" : ""} importée${count > 1 ? "s" : ""}`,
        error: "Échec de l'import",
        noFTConfig: "Configurez vos identifiants France Travail dans Réglages d'abord.",
        ftError: "Connexion France Travail échouée",
        ftSearchError: "Échec recherche France Travail",
      },
    },
  },

  /* ── Offres (OngletOffres) ── */
  offers: {
    title: "Offres d'emploi",
    withCount: ({ count }) => `${count} offre${count > 1 ? "s" : ""} suivie${count > 1 ? "s" : ""}`,
    search: "Rechercher une offre...",
    contractLabels: {
      cdi: "CDI",
      cdd: "CDD",
      freelance: "Freelance",
      stage: "Stage",
      alternance: "Alternance",
      interim: "Intérim",
    },
    empty: "Aucune offre pour le moment",
    noResults: "Aucune offre trouvée",
    viewOffer: "Voir l'offre",
  },

  /* ── Réglages (OngletReglages) ── */
  settings: {
    title: "Paramètres",
    saved: "Enregistré",
    language: "Langue",
    languages: {
      fr: "Français",
      es: "Español (Latinoamérica)",
    },
  },
}

export default fr
