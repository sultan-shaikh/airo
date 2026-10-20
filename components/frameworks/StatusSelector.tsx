'use client'

import { ControlStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const OPTIONS: { value: ControlStatus; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'not_applicable', label: 'Not applicable' },
]

const STATUS_STYLES: Record<ControlStatus, string> = {
  not_started: 'border-border text-text-secondary',
  in_progress: 'border-status-moderate text-status-moderate',
  implemented: 'border-status-ready text-status-ready',
  not_applicable: 'border-text-muted text-text-muted',
}

interface StatusSelectorProps {
  value: ControlStatus
  onChange: (status: ControlStatus) => void
}

export default function StatusSelector({ value, onChange }: StatusSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ControlStatus)}
      className={cn(
        'h-9 rounded-input border bg-white px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/20',
        STATUS_STYLES[value],
      )}
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
