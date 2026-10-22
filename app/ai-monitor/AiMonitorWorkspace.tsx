'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { explainAiRisk } from '@/lib/aira'
import { AiRiskFinding, AiRiskSeverity, AiTool } from '@/lib/ai-inventory-types'
import ToolForm, { ToolFormValues } from '@/components/ai-monitor/ToolForm'
import SeverityBadge from '@/components/ai-monitor/SeverityBadge'
import MitigationStatusSelector from '@/components/ai-monitor/MitigationStatusSelector'
import AiraNote from '@/components/aira/AiraNote'
import { RobotIcon } from '@/components/icons'

const SEVERITY_ORDER: AiRiskSeverity[] = ['critical', 'high', 'medium', 'low']

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AiMonitorWorkspace() {
  const router = useRouter()
  const hydrated = useAppStore((s) => s.hydrated)
  const profile = useAppStore((s) => s.profile)
  const aiTools = useAppStore((s) => s.aiTools)
  const aiRiskFindings = useAppStore((s) => s.aiRiskFindings)
  const aiMitigations = useAppStore((s) => s.aiMitigations)
  const hydrate = useAppStore((s) => s.hydrate)
  const addAiTool = useAppStore((s) => s.addAiTool)
  const removeAiTool = useAppStore((s) => s.removeAiTool)
  const rescoreAiTool = useAppStore((s) => s.rescoreAiTool)
  const setAiMitigationStatus = useAppStore((s) => s.setAiMitigationStatus)
  const setAiMitigationNotes = useAppStore((s) => s.setAiMitigationNotes)

  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (hydrated && !profile) {
      router.replace('/profile')
    }
  }, [hydrated, profile, router])

  if (!hydrated || !profile) {
    return <p className="text-sm text-text-secondary">Loading...</p>
  }

  const tools = Object.values(aiTools).sort((a, b) => a.name.localeCompare(b.name))
  const findings = Object.values(aiRiskFindings)
  const mitigations = Object.values(aiMitigations)

  const findingsByTool = new Map<string, AiRiskFinding[]>()
  for (const f of findings) {
    const list = findingsByTool.get(f.toolId) ?? []
    list.push(f)
    findingsByTool.set(f.toolId, list)
  }

  const mitigationsByFinding = new Map<string, typeof mitigations>()
  for (const m of mitigations) {
    const list = mitigationsByFinding.get(m.findingId) ?? []
    list.push(m)
    mitigationsByFinding.set(m.findingId, list)
  }

  // "Before" counts every finding by severity, regardless of mitigation
  // status. "After" (residual) drops a finding once every one of its
  // mitigations is marked implemented — a simple derived calculation, no
  // separate persistence needed for this summary.
  const beforeCounts: Record<AiRiskSeverity, number> = { low: 0, medium: 0, high: 0, critical: 0 }
  const afterCounts: Record<AiRiskSeverity, number> = { low: 0, medium: 0, high: 0, critical: 0 }
  for (const f of findings) {
    beforeCounts[f.severity] += 1
    const findingMitigations = mitigationsByFinding.get(f.id) ?? []
    const resolved = findingMitigations.length > 0 && findingMitigations.every((m) => m.status === 'implemented')
    if (!resolved) {
      afterCounts[f.severity] += 1
    }
  }

  const totalMitigations = mitigations.length
  const implementedMitigations = mitigations.filter((m) => m.status === 'implemented').length
  const highOrCriticalCount = findings.filter((f) => f.severity === 'high' || f.severity === 'critical').length

  async function handleAddTool(values: ToolFormValues) {
    await addAiTool(values)
    setShowAddForm(false)
  }

  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="text-sm font-medium text-brand-teal hover:underline">
        &larr; Back to dashboard
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-brand-teal-light text-brand-teal">
          <RobotIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-h1 text-text-primary">AI Discovery &amp; Monitoring</h1>
          <p className="mt-1 text-body text-text-secondary">
            A self-reported inventory of the AI tools your business actually uses, scored for risk, with
            mitigations tracked and a re-check workflow to keep it current.
          </p>
        </div>
      </div>

      <AiraNote
        text={`Hi, I'm AIra. You have ${tools.length} AI tool${tools.length === 1 ? '' : 's'} logged, with ${findings.length} risk finding${findings.length === 1 ? '' : 's'} (${highOrCriticalCount} high or critical) and ${implementedMitigations}/${totalMitigations} mitigations implemented. This is a manual, self-reported inventory — think of it as your honest starting point for monitoring, not an automated detection system.`}
      />

      {/* ---- Section 1: Inventory ------------------------------------- */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-primary">Inventory</h2>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-button bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-[#162D4A]"
          >
            {showAddForm ? 'Close' : 'Add AI tool'}
          </button>
        </div>

        {showAddForm && <ToolForm onSubmit={handleAddTool} onCancel={() => setShowAddForm(false)} />}

        {tools.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No AI tools logged yet. Add one above — include tools staff use day-to-day, not just ones IT
            formally procured.
          </p>
        ) : (
          <div className="space-y-3">
            {tools.map((tool) => (
              <ToolRow
                key={tool.id}
                tool={tool}
                findingCount={(findingsByTool.get(tool.id) ?? []).length}
                onRescore={() => rescoreAiTool(tool.id)}
                onRemove={() => removeAiTool(tool.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---- Section 2: Risk findings ---------------------------------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Risk findings</h2>
        {tools.length === 0 ? (
          <p className="text-sm text-text-secondary">Add a tool above to see risk findings.</p>
        ) : (
          <div className="space-y-6">
            {tools.map((tool) => {
              const toolFindings = (findingsByTool.get(tool.id) ?? []).slice().sort(
                (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
              )
              if (toolFindings.length === 0) return null
              return (
                <div key={tool.id}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
                    {tool.name}
                  </h3>
                  <div className="space-y-3">
                    {toolFindings.map((finding) => (
                      <div key={finding.id} className="rounded-card border border-border bg-white p-4 shadow-card">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text-primary">
                              {CATEGORY_DISPLAY[finding.category]}
                            </p>
                            <p className="mt-1 text-sm text-text-secondary">{finding.reason}</p>
                          </div>
                          <SeverityBadge severity={finding.severity} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedFindingId((id) => (id === finding.id ? null : finding.id))}
                          className="mt-3 text-sm font-medium text-brand-teal hover:underline"
                        >
                          {expandedFindingId === finding.id ? 'Hide' : 'Ask AIra to explain this'}
                        </button>
                        {expandedFindingId === finding.id && (
                          <div className="mt-3">
                            <AiraNote text={explainAiRisk(finding, tool)} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {findings.length === 0 && (
              <p className="text-sm text-text-secondary">
                No risk findings yet — every logged tool came back clean against the current rules.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ---- Section 3: Mitigations / before-after --------------------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Mitigations</h2>

        <ResidualRiskPanel before={beforeCounts} after={afterCounts} />

        {findings.length === 0 ? (
          <p className="text-sm text-text-secondary">No findings to mitigate yet.</p>
        ) : (
          <div className="space-y-6">
            {tools.map((tool) => {
              const toolFindings = findingsByTool.get(tool.id) ?? []
              if (toolFindings.length === 0) return null
              return (
                <div key={tool.id}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
                    {tool.name}
                  </h3>
                  <div className="space-y-3">
                    {toolFindings.map((finding) => {
                      const findingMitigations = mitigationsByFinding.get(finding.id) ?? []
                      if (findingMitigations.length === 0) return null
                      return (
                        <div key={finding.id} className="rounded-card border border-border bg-white p-4 shadow-card">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-text-primary">
                              {CATEGORY_DISPLAY[finding.category]}
                            </p>
                            <SeverityBadge severity={finding.severity} />
                          </div>
                          <div className="mt-3 space-y-3">
                            {findingMitigations.map((m) => (
                              <div key={m.id} className="rounded-input border border-border bg-surface-secondary p-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-text-primary">{m.title}</p>
                                    <p className="mt-1 text-sm text-text-secondary">{m.description}</p>
                                    {m.controlRefId && (
                                      <p className="mt-1 text-xs text-text-muted">
                                        Linked to AI Governance control {m.controlRefId} — update its status there
                                        to keep this in sync.
                                      </p>
                                    )}
                                  </div>
                                  <MitigationStatusSelector
                                    value={m.status}
                                    onChange={(status) => setAiMitigationStatus(m.id, status)}
                                  />
                                </div>
                                <textarea
                                  defaultValue={m.notes}
                                  onBlur={(e) => setAiMitigationNotes(m.id, e.target.value)}
                                  placeholder="Add any notes about this mitigation..."
                                  className="mt-2 w-full rounded-input border border-border p-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
                                  rows={2}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

const CATEGORY_DISPLAY: Record<AiRiskFinding['category'], string> = {
  data_leakage: 'Data leakage',
  shadow_use: 'Shadow AI use',
  over_permissioned_access: 'Over-permissioned access',
  prompt_injection_exposure: 'Prompt injection exposure',
  vendor_supply_chain: 'Vendor / supply chain risk',
  bias_fairness: 'Bias / fairness risk',
  oversight_gap: 'Human oversight gap',
  logging_gap: 'Logging / visibility gap',
}

function ToolRow({
  tool,
  findingCount,
  onRescore,
  onRemove,
}: {
  tool: AiTool
  findingCount: number
  onRescore: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-white p-4 shadow-card">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">
          {tool.name} {tool.vendor && <span className="text-text-muted">· {tool.vendor}</span>}
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          {DEPLOYMENT_LABEL[tool.deploymentType]} · Last reviewed {formatDate(tool.lastReviewedAt)} ·{' '}
          {findingCount} finding{findingCount === 1 ? '' : 's'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onRescore}
          className="rounded-button border border-brand-navy px-3 py-2 text-sm font-medium text-brand-navy hover:bg-brand-navy-light"
        >
          Re-check
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-button border border-status-critical px-3 py-2 text-sm font-medium text-status-critical hover:bg-status-critical-bg"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

const DEPLOYMENT_LABEL: Record<AiTool['deploymentType'], string> = {
  saas_api: 'Standalone SaaS tool / API',
  embedded_in_other_saas: 'Embedded in another SaaS product',
  custom_model: 'Custom/self-hosted model',
  browser_extension: 'Browser extension',
}

const SEVERITY_BAR_COLOR: Record<AiRiskSeverity, string> = {
  critical: 'bg-status-critical',
  high: 'bg-status-high',
  medium: 'bg-status-moderate',
  low: 'bg-status-low',
}

function RiskBars({ counts, maxTotal }: { counts: Record<AiRiskSeverity, number>; maxTotal: number }) {
  return (
    <div className="space-y-1.5">
      {SEVERITY_ORDER.map((s) => (
        <div key={s} className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-micro uppercase tracking-wide text-text-muted">{s}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-tertiary">
            <div
              className={`h-full rounded-full ${SEVERITY_BAR_COLOR[s]} transition-all`}
              style={{ width: maxTotal > 0 ? `${(counts[s] / maxTotal) * 100}%` : '0%' }}
            />
          </div>
          <span className="w-5 shrink-0 text-right text-caption font-medium text-text-secondary">
            {counts[s]}
          </span>
        </div>
      ))}
    </div>
  )
}

function ResidualRiskPanel({
  before,
  after,
}: {
  before: Record<AiRiskSeverity, number>
  after: Record<AiRiskSeverity, number>
}) {
  const beforeTotal = SEVERITY_ORDER.reduce((sum, s) => sum + before[s], 0)
  const afterTotal = SEVERITY_ORDER.reduce((sum, s) => sum + after[s], 0)
  const maxTotal = Math.max(beforeTotal, afterTotal, 1)
  const reduced = beforeTotal - afterTotal

  return (
    <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
      <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
            Before mitigation
          </p>
          <p className="mt-1 text-h1 text-text-primary">{beforeTotal}</p>
          <p className="text-micro text-text-muted">open findings</p>
          <div className="mt-4">
            <RiskBars counts={before} maxTotal={maxTotal} />
          </div>
        </div>
        <div className="bg-brand-teal-light p-5">
          <p className="text-caption font-semibold uppercase tracking-wide text-brand-teal">
            Residual (current)
          </p>
          <p className="mt-1 text-h1 text-brand-navy">{afterTotal}</p>
          <p className="text-micro text-text-secondary">
            {reduced > 0 ? `${reduced} resolved by mitigations` : 'no findings resolved yet'}
          </p>
          <div className="mt-4">
            <RiskBars counts={after} maxTotal={maxTotal} />
          </div>
        </div>
      </div>
    </div>
  )
}
