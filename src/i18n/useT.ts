import { useStore } from '../store/useStore'
import fr, { type Dict, type DictValue } from './fr'
import es from './es'

const DICTIONARIES: Record<string, Dict> = { fr, es }

function getIn(obj: Dict, path: string): DictValue | Dict | undefined {
  // Clé plate exacte d'abord (ex. "sidebar.dashboard")
  if (path in obj) return obj[path]
  // Sinon lookup imbriqué (ex. "offers.title" → obj.offers.title)
  let cur: DictValue | Dict | undefined = obj
  for (const p of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Dict)[p]
  }
  return cur
}

/**
 * Hook de traduction.
 * `t('offers.title')` → chaîne ; `t('offers.withCount', { count: 5 })` → chaîne formatée.
 * Clé absente → renvoie la clé (jamais d'erreur).
 */
export function useT() {
  const langue = useStore((s) => s.settings.langue || 'fr')
  const dict = DICTIONARIES[langue] || fr

  const t = (key: string, params?: { count: number }): string => {
    const value = getIn(dict, key)
    if (value == null) return key
    if (typeof value === 'string') return value
    if (typeof value === 'function') return value(params ?? { count: 0 })
    return key
  }

  return { t, langue }
}


