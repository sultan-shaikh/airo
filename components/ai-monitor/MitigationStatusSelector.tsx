'use client'

import { AiMitigationStatus } from '@/lib/ai-inventory-types'
import { cn } from '@/lib/utils'

// Same pattern/styling as components/frameworks/StatusSelector.tsx, but
// built separately because AiMitigationStatus is a different (shorter)
// enum than ControlStatus — there's no 'not_applicable' for a mitigation.
const OPTIONS: { value: AiMitigationStatus; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'implemented', label: 'Implemented' },
]

const STATUS_STYLES: Record<AiMitigationStatus, string> = {
  not_started: 'border-border text-text-secondary',
  in_progress: 'border-status-moderate text-status-moderate',
  implemented: 'border-status-ready text-status-ready',
}

interface MitigationStatusSelectorProps {
  value: AiMitigationStatus
  onChange: (status: AiMitigationStatus) => void
}

export default function MitigationStatusSelector({ value, onChange }: MitigationStatusSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AiMitigationStatus)}
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
