'use client'

import { Verdict } from '@/lib/types'
import { cn } from '@/lib/utils'

const VERDICT_CONFIG: Record<Verdict, { label: string; bg: string; text: string }> = {
  mandatory_legal: { label: 'Mandatory – Legal', bg: 'bg-status-critical-bg', text: 'text-status-critical' },
  mandatory_sector: { label: 'Mandatory – Sector', bg: 'bg-status-high-bg', text: 'text-status-high' },
  contractual: { label: 'Contractual', bg: 'bg-status-moderate-bg', text: 'text-status-moderate' },
  voluntary: { label: 'Voluntary', bg: 'bg-status-low-bg', text: 'text-status-low' },
  not_applicable: { label: 'Not Applicable', bg: 'bg-surface-tertiary', text: 'text-text-muted' },
}

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const config = VERDICT_CONFIG[verdict]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        config.bg,
        config.text,
      )}
    >
      {config.label}
    </span>
  )
}
