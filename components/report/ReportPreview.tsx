'use client'

import { useMemo, useState } from 'react'
import { ApplicabilityResult, Control, ControlState, Profile } from '@/lib/types'
import { AiMitigation, AiRiskFinding, AiTool } from '@/lib/ai-inventory-types'
import { getFrameworkMeta } from '@/lib/frameworks-meta'
import { generateReport } from '@/lib/pdf'
import VerdictBadge from '@/components/dashboard/VerdictBadge'
import { DocumentIcon } from '@/components/icons'

interface ReportPreviewProps {
  profile: Profile
  applicability: ApplicabilityResult[]
  controls: Control[]
  controlStates: Record<string, ControlState>
  aiTools?: Record<string, AiTool>
  aiRiskFindings?: Record<string, AiRiskFinding>
  aiMitigations?: Record<string, AiMitigation>
}

export default function ReportPreview({
  profile,
  applicability,
  controls,
  controlStates,
  aiTools = {},
  aiRiskFindings = {},
  aiMitigations = {},
}: ReportPreviewProps) {
  const [generating, setGenerating] = useState(false)

  const relevant = useMemo(
    () => applicability.filter((a) => a.verdict !== 'not_applicable'),
    [applicability],
  )

  const totalActionItems = useMemo(() => {
    const relevantSlugs = relevant.map((r) => r.slug)
    return controls.filter((ctl) => {
      if (!ctl.frameworkSlugs.some((s) => relevantSlugs.includes(s))) return false
      const status = controlStates[ctl.id]?.status ?? 'not_started'
      return status === 'not_started' || status === 'in_progress'
    }).length
  }, [controls, controlStates, relevant])

  async function handleGenerate() {
    setGenerating(true)
    try {
      generateReport({
        profile,
        applicability,
        controls,
        controlStates: Object.values(controlStates),
        aiTools: Object.values(aiTools),
        aiRiskFindings: Object.values(aiRiskFindings),
        aiMitigations: Object.values(aiMitigations),
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-white p-5 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-brand-navy-light text-brand-navy">
            <DocumentIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-caption text-text-secondary">
              {relevant.length} applicable modules · {totalActionItems} outstanding action items
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-button bg-brand-navy px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#162D4A] disabled:opacity-60"
        >
          {generating ? 'Generating PDF...' : 'Generate PDF Report'}
        </button>
      </div>

      {/* Document-like preview: a "page" card on a subtle grey backdrop */}
      <div className="rounded-card bg-surface-tertiary p-4 sm:p-8">
        <div className="mx-auto max-w-3xl rounded-sm bg-white p-8 shadow-lg sm:p-12">
          <div className="flex items-start justify-between border-b border-border pb-6">
            <div>
              <p className="text-micro font-semibold uppercase tracking-wide text-brand-teal">
                AIro Evidence Pack
              </p>
              <h2 className="mt-1 text-h1 text-text-primary">
                {profile.companyName || 'Your company'}
              </h2>
              <p className="mt-1 text-caption text-text-muted">
                Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-navy text-sm font-bold text-white">
              AI
            </span>
          </div>

          <div className="mt-8">
            <h3 className="text-h3 text-text-primary">Applicability summary</h3>
            <div className="mt-4 space-y-3">
              {applicability.map((result) => {
                const meta = getFrameworkMeta(result.slug)
                return (
                  <div
                    key={result.slug}
                    className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{meta.name}</p>
                      <p className="text-caption text-text-secondary">{result.reason}</p>
                    </div>
                    <VerdictBadge verdict={result.verdict} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-8 rounded-card border-l-[3px] border-brand-teal bg-brand-teal-light p-4 text-caption text-text-primary">
            AIro provides guidance, not certification. Frameworks requiring independent third-party
            audit (Cyber Essentials Plus, ISO 27001, ISO 22301, SOC 2) still require that audit to be
            carried out separately before certification can be claimed.
          </div>
        </div>
      </div>
    </div>
  )
}
