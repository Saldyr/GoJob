import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
/* @ts-expect-error — fontsource-variable/inter fournit les fichiers CSS sans déclaration TS */
import '@fontsource-variable/inter'
import './index.css'
import App from './components/App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
