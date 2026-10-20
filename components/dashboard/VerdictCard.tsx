'use client'

import Link from 'next/link'
import { ApplicabilityResult } from '@/lib/types'
import { getFrameworkMeta } from '@/lib/frameworks-meta'
import VerdictBadge from './VerdictBadge'

interface VerdictCardProps {
  result: ApplicabilityResult
  progressLabel?: string
}

export default function VerdictCard({ result, progressLabel }: VerdictCardProps) {
  const meta = getFrameworkMeta(result.slug)
  const clickable = result.verdict !== 'not_applicable'

  const content = (
    <div className="flex h-full flex-col gap-3 rounded-card border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-text-primary">{meta.name}</h3>
        <VerdictBadge verdict={result.verdict} />
      </div>
      <p className="text-sm text-text-secondary">{result.reason}</p>
      <div className="mt-auto flex items-center justify-between pt-2">
        {meta.certifiable && (
          <span className="text-xs font-medium text-text-muted">Requires independent audit</span>
        )}
        {progressLabel && clickable && (
          <span className="text-xs font-medium text-brand-teal">{progressLabel}</span>
        )}
      </div>
    </div>
  )

  if (!clickable) {
    return <div className="opacity-80">{content}</div>
  }

  return <Link href={`/frameworks/${meta.slug}`}>{content}</Link>
}
