// Diccionario español (Latinoamérica, es-419) — GoJob
// Tratamiento formal "usted". Solo contiene las claves realmente utilizadas.

import type { Dict } from './fr'

const es: Dict = {
  /* ── Sidebar ── */
  "sidebar.dashboard": "Panel de control",
  "sidebar.offers": "Ofertas de empleo",
  "sidebar.settings": "Configuración",

  /* ── Panel (OngletAccueil) ── */
  dashboard: {
    import: {
      title: "Importar ofertas",
      fromMail: "Importar desde mi correo",
      fromFT: "France Travail",
      status: {
        loading: "Conectando...",
        ok: ({ count }) => `${count} oferta${count > 1 ? "s" : ""} importada${count > 1 ? "s" : ""}`,
        error: "Error de importación",
        noFTConfig: "Configure sus credenciales de France Travail en Ajustes primero.",
        ftError: "Conexión France Travail fallida",
        ftSearchError: "Error en búsqueda France Travail",
      },
    },
  },

  /* ── Ofertas (OngletOffres) ── */
  offers: {
    title: "Ofertas de empleo",
    withCount: ({ count }) => `${count} oferta${count > 1 ? "s" : ""} seguida${count > 1 ? "s" : ""}`,
    search: "Buscar una oferta...",
    contractLabels: {
      cdi: "CDI",
      cdd: "CDD",
      freelance: "Freelance",
      stage: "Prácticas",
      alternance: "Alternancia",
      interim: "Temporal",
    },
    empty: "Sin ofertas por ahora",
    noResults: "Ninguna oferta encontrada",
    viewOffer: "Ver oferta",
  },

  /* ── Configuración (OngletReglages) ── */
  settings: {
    title: "Configuración",
    saved: "Guardado",
    language: "Idioma",
    languages: {
      fr: "Français",
      es: "Español (Latinoamérica)",
    },
  },
}

export default es
