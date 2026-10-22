'use client'

import Link from 'next/link'
import { ApplicabilityResult, FrameworkCategory } from '@/lib/types'
import { getFrameworkMeta } from '@/lib/frameworks-meta'
import VerdictBadge from './VerdictBadge'
import { ShieldIcon, LockIcon, ChartIcon, DocumentIcon, ChecklistIcon, RobotIcon } from '@/components/icons'

interface VerdictCardProps {
  result: ApplicabilityResult
  progressLabel?: string
  implemented?: number
  total?: number
}

const CATEGORY_ICON: Record<FrameworkCategory, (props: { className?: string }) => JSX.Element> = {
  cyber_security: ShieldIcon,
  data_privacy: LockIcon,
  financial_services: ChartIcon,
  healthcare: DocumentIcon,
  quality_management: ChecklistIcon,
  ai_governance: RobotIcon,
}

export default function VerdictCard({ result, progressLabel, implemented = 0, total = 0 }: VerdictCardProps) {
  const meta = getFrameworkMeta(result.slug)
  const clickable = result.verdict !== 'not_applicable'
  const Icon = CATEGORY_ICON[meta.category]
  const pct = total > 0 ? Math.round((implemented / total) * 100) : 0

  const content = (
    <div className="flex h-full flex-col gap-3 rounded-card border border-border bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-button bg-brand-navy-light text-brand-navy">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="text-h3 text-text-primary">{meta.name}</h3>
        </div>
      </div>
      <div>
        <VerdictBadge verdict={result.verdict} />
      </div>
      <p className="text-caption text-text-secondary">{result.reason}</p>

      {clickable && total > 0 && (
        <div className="mt-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-tertiary">
            <div
              className="h-full rounded-full bg-brand-teal transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-1">
        {meta.certifiable && (
          <span className="text-micro font-medium uppercase tracking-wide text-text-muted">
            Requires independent audit
          </span>
        )}
        {progressLabel && clickable && (
          <span className="text-caption font-semibold text-brand-teal">{progressLabel}</span>
        )}
      </div>
    </div>
  )

  if (!clickable) {
    return <div className="opacity-80">{content}</div>
  }

  return <Link href={`/frameworks/${meta.slug}`}>{content}</Link>
}
