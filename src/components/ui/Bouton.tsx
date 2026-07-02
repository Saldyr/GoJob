import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'primaire' | 'secondaire' | 'ghost'
type Taille = 'sm' | 'md'

interface BoutonProps {
  variant?: Variant
  taille?: Taille
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
}

const base =
  'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
  'select-none transition-[transform,box-shadow,background,border-color] duration-200 ' +
  'disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none'

const tailles: Record<Taille, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
}

const variants: Record<Variant, string> = {
  // Signature Nebula : dégradé violet→cyan + liseré clair + lueur discrète au survol
  primaire:
    'text-white bg-[linear-gradient(120deg,#9b35ff_0%,#6d5cff_50%,#00d9ff_100%)] ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_16px_rgba(155,53,255,0.22)] ' +
    'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_16px_rgba(155,53,255,0.30),0_0_16px_rgba(0,217,255,0.12)]',
  secondaire:
    'text-white bg-white/[0.07] ring-1 ring-inset ring-white/[0.14] ' +
    'hover:bg-white/[0.12] hover:ring-white/25',
  ghost: 'text-text-dim hover:text-text hover:bg-white/[0.05]',
}

export function Bouton({
  variant = 'primaire',
  taille = 'md',
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: BoutonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${base} ${tailles[taille]} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  )
}
