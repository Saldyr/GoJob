interface BoutonProps {
  variant?: 'primaire' | 'secondaire' | 'ghost'
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
}

export function Bouton({ variant = 'primaire', children, onClick, type = 'button', disabled = false, className = '' }: BoutonProps) {
  const base = 'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed'

  const styles = {
    primaire: 'bg-gradient-to-r from-action-deep to-action text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.97]',
    secondaire: 'border border-bordure bg-surface-3 text-text hover:bg-surface-2 hover:border-text-muted active:scale-[0.97]',
    ghost: 'text-text-dim hover:text-text hover:bg-surface-3 active:scale-[0.97]',
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  )
}
