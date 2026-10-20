'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { CONTROLS } from '@/lib/controls'
import VerdictCard from '@/components/dashboard/VerdictCard'
import ProgressStats from '@/components/layout/ProgressStats'
import AiraNote from '@/components/aira/AiraNote'

export default function DashboardPage() {
  const router = useRouter()
  const hydrated = useAppStore((s) => s.hydrated)
  const profile = useAppStore((s) => s.profile)
  const applicability = useAppStore((s) => s.applicability)
  const controlStates = useAppStore((s) => s.controlStates)
  const aiTools = useAppStore((s) => s.aiTools)
  const aiRiskFindings = useAppStore((s) => s.aiRiskFindings)
  const aiMitigations = useAppStore((s) => s.aiMitigations)
  const hydrate = useAppStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (hydrated && !profile) {
      router.replace('/profile')
    }
  }, [hydrated, profile, router])

  if (!hydrated || !profile) {
    return <p className="text-sm text-text-secondary">Loading your dashboard...</p>
  }

  const applicableModules = applicability.filter((a) => a.verdict !== 'not_applicable')
  const relevantSlugs = applicableModules.map((a) => a.slug)
  const relevantControls = CONTROLS.filter((c) => c.frameworkSlugs.some((s) => relevantSlugs.includes(s)))
  const implementedControls = relevantControls.filter(
    (c) => controlStates[c.id]?.status === 'implemented',
  ).length

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {profile.companyName || 'Your'} compliance dashboard
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Based on your profiling answers, here is how each framework applies to you.
          </p>
        </div>
        <Link
          href="/report"
          className="rounded-button border border-brand-navy px-4 py-2 text-sm font-medium text-brand-navy hover:bg-brand-navy-light"
        >
          Go to report
        </Link>
      </div>

      <ProgressStats
        totalModules={applicability.length}
        applicableModules={applicableModules.length}
        totalControls={relevantControls.length}
        implementedControls={implementedControls}
      />

      <AiraNote
        text={`Hi, I'm AIra — your AI Compliance Officer. You have ${applicableModules.length} applicable frameworks out of ${applicability.length} covered. Start with the mandatory modules first, then work through contractual and voluntary ones as you have capacity. Click any card below to open its control workspace.`}
      />

      <Link href="/ai-monitor" className="block">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
          <div>
            <h3 className="text-base font-semibold text-text-primary">AI Discovery &amp; Monitoring</h3>
            <p className="mt-1 text-sm text-text-secondary">
              AI tools tracked: {Object.keys(aiTools).length} · Risk findings:{' '}
              {Object.keys(aiRiskFindings).length} (
              {Object.values(aiRiskFindings).filter((f) => f.severity === 'high' || f.severity === 'critical').length}{' '}
              high/critical) · Mitigations implemented:{' '}
              {Object.values(aiMitigations).filter((m) => m.status === 'implemented').length}/
              {Object.keys(aiMitigations).length}
            </p>
          </div>
          <span className="text-sm font-medium text-brand-teal">Open workspace &rarr;</span>
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {applicability.map((result) => {
          const frameworkControls = CONTROLS.filter((c) => c.frameworkSlugs.includes(result.slug))
          const implemented = frameworkControls.filter(
            (c) => controlStates[c.id]?.status === 'implemented',
          ).length
          const progressLabel =
            frameworkControls.length > 0
              ? `${implemented}/${frameworkControls.length} implemented`
              : undefined
          return <VerdictCard key={result.slug} result={result} progressLabel={progressLabel} />
        })}
      </div>
    </div>
  )
}
