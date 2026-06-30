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
    primaire: 'bg-gradient-to-r from-nebula-3 to-nebula-2 text-white shadow-md shadow-nebula-2/20 border border-white/10 hover:brightness-110 hover:shadow-lg active:scale-[0.97] transition-all duration-200',
    secondaire: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 active:scale-[0.97] transition-all duration-200',
    ghost: 'text-text-dim hover:text-text hover:bg-surface-3 active:scale-[0.97]',
  }

  return (
    <>
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}
      style={variant === 'primaire' && !disabled ? {
        background: 'linear-gradient(to right, #EC4899, #A855F7)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 6px -1px rgba(168,85,247,0.2)'
      } : undefined}>
      {children}
    </button>
    </>
  )
}
