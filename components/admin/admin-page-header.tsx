import type React from "react"

interface AdminPageHeaderProps {
  title: string
  description: string
  actions?: React.ReactNode
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex gap-3 md:justify-end">{actions}</div>}
    </div>
  )
}

export default AdminPageHeader
