import type { ReactNode } from 'react'

interface PageHeaderProps {
  icon?: ReactNode
  title: string
  subtitle: string
  actions?: ReactNode
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-white">{title}</h1>
        <p className="text-sm text-text-dim mt-0.5">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  )
}
