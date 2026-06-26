import type { ReactNode } from 'react'

interface PageHeaderProps {
  icon: ReactNode
  title: string
  subtitle: string
  actions?: ReactNode
}

export default function PageHeader({ icon, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-action to-action-vif flex items-center justify-center shadow-md shadow-action/20 shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="text-white">{title}</h1>
          <p className="text-sm text-text-dim mt-0.5">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  )
}
