'use client'

import { ReactNode } from 'react'

interface StepShellProps {
  title: string
  description?: string
  children: ReactNode
}

export default function StepShell({ title, description, children }: StepShellProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
