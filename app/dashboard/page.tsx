'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { CONTROLS } from '@/lib/controls'
import { FrameworkCategory } from '@/lib/types'
import VerdictCard from '@/components/dashboard/VerdictCard'
import ReadinessGauge from '@/components/dashboard/ReadinessGauge'
import CoverageRadar, { CoverageDatum } from '@/components/dashboard/CoverageRadar'
import ProgressStats from '@/components/layout/ProgressStats'
import AiraNote from '@/components/aira/AiraNote'
import { getFrameworkMeta } from '@/lib/frameworks-meta'
import { RobotIcon } from '@/components/icons'
import IntegrationsPanel from '@/components/dashboard/IntegrationsPanel'

const CATEGORY_LABELS: Record<FrameworkCategory, string> = {
  cyber_security: 'Cyber Security',
  data_privacy: 'Data Privacy',
  financial_services: 'Financial Services',
  healthcare: 'Healthcare',
  quality_management: 'Quality Mgmt',
  ai_governance: 'AI Governance',
}

export default function DashboardPage() {
  const router = useRouter()
  const hydrated = useAppStore((s) => s.hydrated)
  const profile = useAppStore((s) => s.profile)
  const applicability = useAppStore((s) => s.applicability)
  const controlStates = useAppStore((s) => s.controlStates)
  const aiTools = useAppStore((s) => s.aiTools)
  const aiRiskFindings = useAppStore((s) => s.aiRiskFindings)
  const aiMitigations = useAppStore((s) => s.aiMitigations)
  const activeIntegration = useAppStore((s) => s.activeIntegration)
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
  const inProgressControls = relevantControls.filter(
    (c) => controlStates[c.id]?.status === 'in_progress',
  ).length
  const notStartedControls = relevantControls.filter((c) => {
    const status = controlStates[c.id]?.status ?? 'not_started'
    return status === 'not_started'
  }).length

  const overallPct =
    relevantControls.length > 0 ? Math.round((implementedControls / relevantControls.length) * 100) : 0

  // Coverage per framework category: % of implemented controls across
  // every applicable framework that falls in that category.
  const categories: FrameworkCategory[] = [
    'cyber_security',
    'data_privacy',
    'financial_services',
    'healthcare',
    'quality_management',
    'ai_governance',
  ]
  const radarData: CoverageDatum[] = categories.map((category) => {
    const slugsInCategory = applicableModules
      .map((a) => a.slug)
      .filter((slug) => getFrameworkMeta(slug).category === category)
    const controlsInCategory = CONTROLS.filter((c) =>
      c.frameworkSlugs.some((s) => slugsInCategory.includes(s)),
    )
    const implemented = controlsInCategory.filter((c) => controlStates[c.id]?.status === 'implemented').length
    const percent = controlsInCategory.length > 0 ? Math.round((implemented / controlsInCategory.length) * 100) : 0
    return { category, shortLabel: CATEGORY_LABELS[category], percent }
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">
            {profile.companyName || 'Your'} compliance dashboard
          </h1>
          <p className="mt-1 text-body text-text-secondary">
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

      {activeIntegration && <IntegrationsPanel fixture={activeIntegration.fixture} />}

      {/* Readiness hero: gauge + radar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-border bg-white p-6 shadow-card lg:col-span-2">
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
            Overall Readiness
          </p>
          <ReadinessGauge percent={overallPct} />
          <p className="text-center text-caption text-text-secondary">
            {implementedControls} of {relevantControls.length} applicable controls implemented
          </p>
        </div>
        <div className="rounded-card border border-border bg-white p-6 shadow-card lg:col-span-3">
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-text-muted">
            Coverage by category
          </p>
          <CoverageRadar data={radarData} />
        </div>
      </div>

      <ProgressStats
        totalModules={applicability.length}
        applicableModules={applicableModules.length}
        totalControls={relevantControls.length}
        implementedControls={implementedControls}
        inProgressControls={inProgressControls}
        notStartedControls={notStartedControls}
      />

      <AiraNote
        text={`Hi, I'm AIra — your AI Compliance Officer. You have ${applicableModules.length} applicable frameworks out of ${applicability.length} covered. Start with the mandatory modules first, then work through contractual and voluntary ones as you have capacity. Click any card below to open its control workspace.`}
      />

      <Link href="/ai-monitor" className="block">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-brand-teal-light text-brand-teal">
              <RobotIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-h3 text-text-primary">AI Discovery &amp; Monitoring</h3>
              <p className="mt-1 text-caption text-text-secondary">
                AI tools tracked: {Object.keys(aiTools).length} · Risk findings:{' '}
                {Object.keys(aiRiskFindings).length} (
                {
                  Object.values(aiRiskFindings).filter(
                    (f) => f.severity === 'high' || f.severity === 'critical',
                  ).length
                }{' '}
                high/critical) · Mitigations implemented:{' '}
                {Object.values(aiMitigations).filter((m) => m.status === 'implemented').length}/
                {Object.keys(aiMitigations).length}
              </p>
            </div>
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
          return (
            <VerdictCard
              key={result.slug}
              result={result}
              progressLabel={progressLabel}
              implemented={implemented}
              total={frameworkControls.length}
            />
          )
        })}
      </div>
    </div>
  )
}
