'use client'

import { AiRiskSeverity } from '@/lib/ai-inventory-types'
import { cn } from '@/lib/utils'

// Parallel to components/dashboard/VerdictBadge.tsx — same pill shape and
// the same status colour tokens from tailwind.config.js, just mapped onto
// the four AI risk severities instead of the five applicability verdicts.
const SEVERITY_CONFIG: Record<AiRiskSeverity, { label: string; bg: string; text: string }> = {
  low: { label: 'Low', bg: 'bg-status-low-bg', text: 'text-status-low' },
  medium: { label: 'Medium', bg: 'bg-status-moderate-bg', text: 'text-status-moderate' },
  high: { label: 'High', bg: 'bg-status-high-bg', text: 'text-status-high' },
  critical: { label: 'Critical', bg: 'bg-status-critical-bg', text: 'text-status-critical' },
}

export default function SeverityBadge({ severity }: { severity: AiRiskSeverity }) {
  const config = SEVERITY_CONFIG[severity]
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
