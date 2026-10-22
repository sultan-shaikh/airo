'use client'

import { ControlStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const OPTIONS: { value: ControlStatus; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'not_applicable', label: 'N/A' },
]

const ACTIVE_STYLES: Record<ControlStatus, string> = {
  not_started: 'bg-white text-text-secondary shadow-sm',
  in_progress: 'bg-status-moderate-bg text-status-moderate shadow-sm',
  implemented: 'bg-status-ready-bg text-status-ready shadow-sm',
  not_applicable: 'bg-surface-tertiary text-text-muted shadow-sm',
}

interface StatusSelectorProps {
  value: ControlStatus
  onChange: (status: ControlStatus) => void
}

/** Segmented control for a control's status, styled as pill buttons in a track. */
export default function StatusSelector({ value, onChange }: StatusSelectorProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-pill border border-border bg-surface-secondary p-1">
      {OPTIONS.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-pill px-2.5 py-1 text-xs font-medium transition-all',
              active ? ACTIVE_STYLES[opt.value] : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
