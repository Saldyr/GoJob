import { useStore } from '../store/useStore'
import fr from './fr'
import es from './es'

const traductions: Record<string, typeof fr> = { fr, es }

/**
 * Hook de traduction — retourne la fonction t().
 * Usage : const t = useT() ; t('nav.accueil') → 'Accueil' ou 'Inicio'
 * Supporte les clés imbriquées (nav.accueil) et les paramètres ({message})
 */
export function useT() {
  const langue = useStore((s) => s.settings.langue) || 'fr'

  function t(key: string, params?: Record<string, string>): string {
    const keys = key.split('.')
    let val: unknown = traductions[langue] || fr

    for (const k of keys) {
      if (val && typeof val === 'object' && k in (val as Record<string, unknown>)) {
        val = (val as Record<string, unknown>)[k]
      } else {
        return key // fallback : retourne la clé
      }
    }

    if (typeof val === 'string') {
      if (params) {
        return val.replace(/\{(\w+)\}/g, (_, p) => params[p] ?? `{${p}}`)
      }
      return val
    }

    return key // fallback : pas une string
  }

  return t
}

/** Version non-hook pour usage hors React */
export function tfrom(langue: string): (key: string, params?: Record<string, string>) => string {
  return (key, params) => {
    const keys = key.split('.')
    let val: unknown = traductions[langue] || fr
    for (const k of keys) {
      if (val && typeof val === 'object' && k in (val as Record<string, unknown>)) {
        val = (val as Record<string, unknown>)[k]
      } else {
        return key
      }
    }
    if (typeof val === 'string') {
      return params ? val.replace(/\{(\w+)\}/g, (_, p) => params[p] ?? `{${p}}`) : val
    }
    return key
  }
}
