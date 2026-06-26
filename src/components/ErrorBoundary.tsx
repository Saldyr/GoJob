import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { erreur: Error | null }

/**
 * Capture les erreurs de rendu pour éviter l'écran blanc total.
 * Styles inline volontaires : restent affichables même si le CSS a échoué.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { erreur: null }

  static getDerivedStateFromError(erreur: Error): State {
    return { erreur }
  }

  componentDidCatch(erreur: Error, info: unknown) {
    console.error('[ErrorBoundary]', erreur, info)
  }

  render() {
    if (this.state.erreur) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
          background: '#0f1115', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif', textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Une erreur est survenue</h1>
          <p style={{ fontSize: 14, color: '#9ca3af', maxWidth: 520, wordBreak: 'break-word' }}>
            {this.state.erreur.message || 'Erreur inconnue'}
          </p>
          <button
            onClick={() => { this.setState({ erreur: null }); window.location.reload() }}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: '#4f46e5', color: '#fff', fontSize: 14, fontWeight: 600,
            }}
          >
            Recharger l'application
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
