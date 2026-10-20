// Client-side PDF report generation using jsPDF. This file must only ever
// run in the browser (it's invoked from the Report page, a client
// component) — jsPDF triggers a direct file download via the browser.

import { jsPDF } from 'jspdf'
import { ApplicabilityResult, Control, ControlState, Profile } from './types'
import { getFrameworkMeta } from './frameworks-meta'
import { AiMitigation, AiRiskFinding, AiRiskSeverity, AiTool } from './ai-inventory-types'

export interface ReportData {
  profile: Profile
  applicability: ApplicabilityResult[]
  controls: Control[]
  controlStates: ControlState[]
  /** Optional — omitted reports (e.g. before this feature existed) simply skip the AI risk section below. */
  aiTools?: AiTool[]
  aiRiskFindings?: AiRiskFinding[]
  aiMitigations?: AiMitigation[]
}

const PAGE_WIDTH = 210
const MARGIN = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const LINE_HEIGHT = 5.2

/** Small stateful helper that tracks the current y cursor and adds pages as needed. */
class DocCursor {
  doc: jsPDF
  y: number

  constructor(doc: jsPDF) {
    this.doc = doc
    this.y = MARGIN
  }

  ensureSpace(nextBlockHeight: number) {
    if (this.y + nextBlockHeight > 285) {
      this.doc.addPage()
      this.y = MARGIN
    }
  }

  heading(text: string, size = 16) {
    this.ensureSpace(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(size)
    this.doc.setTextColor(30, 58, 95) // brand navy
    this.doc.text(text, MARGIN, this.y)
    this.y += size === 16 ? 9 : 7
    this.doc.setTextColor(26, 26, 46) // text primary
  }

  subheading(text: string) {
    this.ensureSpace(8)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(11)
    this.doc.setTextColor(14, 159, 142) // brand teal
    this.doc.text(text, MARGIN, this.y)
    this.y += 6
    this.doc.setTextColor(26, 26, 46)
  }

  body(text: string, size = 10) {
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(size)
    const lines: string[] = this.doc.splitTextToSize(text, CONTENT_WIDTH)
    for (const line of lines) {
      this.ensureSpace(LINE_HEIGHT)
      this.doc.text(line, MARGIN, this.y)
      this.y += LINE_HEIGHT
    }
  }

  bullet(text: string) {
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    const lines: string[] = this.doc.splitTextToSize(text, CONTENT_WIDTH - 6)
    lines.forEach((line: string, i: number) => {
      this.ensureSpace(LINE_HEIGHT)
      this.doc.text(i === 0 ? `• ${line}` : `  ${line}`, MARGIN, this.y)
      this.y += LINE_HEIGHT
    })
  }

  spacer(h = 4) {
    this.y += h
  }

  rule() {
    this.ensureSpace(4)
    this.doc.setDrawColor(226, 232, 240) // border default
    this.doc.line(MARGIN, this.y, PAGE_WIDTH - MARGIN, this.y)
    this.y += 4
  }
}

const VERDICT_LABELS: Record<string, string> = {
  mandatory_legal: 'Mandatory – Legal',
  mandatory_sector: 'Mandatory – Sector',
  contractual: 'Contractual',
  voluntary: 'Voluntary',
  not_applicable: 'Not Applicable',
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  implemented: 'Implemented',
  not_applicable: 'Not applicable',
}

const CATEGORY_LABELS: Record<string, string> = {
  data_leakage: 'Data leakage',
  shadow_use: 'Shadow AI use',
  over_permissioned_access: 'Over-permissioned access',
  prompt_injection_exposure: 'Prompt injection exposure',
  vendor_supply_chain: 'Vendor / supply chain risk',
  bias_fairness: 'Bias / fairness risk',
  oversight_gap: 'Human oversight gap',
  logging_gap: 'Logging / visibility gap',
}

const SEVERITY_LABELS: Record<AiRiskSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

const MITIGATION_STATUS_LABELS: Record<string, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  implemented: 'Implemented',
}

export function generateReport(data: ReportData): void {
  const { profile, applicability, controls, controlStates, aiTools = [], aiRiskFindings = [], aiMitigations = [] } = data
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const c = new DocCursor(doc)

  const stateById = new Map(controlStates.map((s) => [s.controlId, s]))
  const today = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // ---- Cover page ----------------------------------------------------
  doc.setFillColor(30, 58, 95)
  doc.rect(0, 0, PAGE_WIDTH, 60, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.text('AIro', MARGIN, 30)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.text('AI-Assisted Compliance & Audit Readiness Report', MARGIN, 42)

  c.y = 75
  doc.setTextColor(26, 26, 46)
  c.heading(profile.companyName || 'Company name not provided', 18)
  c.body(`Report generated: ${today}`)
  c.body(
    `Sector: ${sectorLabel(profile.sector)} · Headcount: ${profile.headcountBand} · Turnover band: ${turnoverLabel(profile.turnoverBand)}`,
  )
  c.spacer(8)
  c.rule()
  c.spacer(4)
  c.subheading('Disclaimer')
  c.body(
    'AIro provides guidance to support your AI and compliance readiness programme. It is not a certification body and does not constitute legal advice. Frameworks that require independent third-party audit (including Cyber Essentials Plus, ISO/IEC 27001, ISO 22301 and SOC 2) still require that audit to be carried out separately by an accredited or qualified assessor before any certification or attestation can be claimed. Applicability verdicts in this report are generated from a deterministic rules engine based on the answers you provided and are a starting point for your own due diligence, not a substitute for professional or legal advice.',
  )

  // ---- Applicability summary table -----------------------------------
  doc.addPage()
  c.y = MARGIN
  c.heading('Applicability Summary')
  c.body('Verdicts generated from your profiling answers across all 13 supported modules.')
  c.spacer(2)

  for (const result of applicability) {
    const meta = getFrameworkMeta(result.slug)
    c.ensureSpace(16)
    c.subheading(`${meta.name} — ${VERDICT_LABELS[result.verdict]}`)
    c.body(result.reason, 9.5)
    c.spacer(2)
  }

  // ---- Per-framework control status + gap list ------------------------
  doc.addPage()
  c.y = MARGIN
  c.heading('Control Status by Framework')

  const relevantSlugs = applicability
    .filter((a) => a.verdict !== 'not_applicable')
    .map((a) => a.slug)

  for (const slug of relevantSlugs) {
    const meta = getFrameworkMeta(slug)
    const frameworkControls = controls.filter((ctl) => ctl.frameworkSlugs.includes(slug))
    if (frameworkControls.length === 0) continue

    c.ensureSpace(14)
    c.heading(meta.name, 13)

    const counts = { not_started: 0, in_progress: 0, implemented: 0, not_applicable: 0 }
    const gaps: Control[] = []
    for (const ctl of frameworkControls) {
      const state = stateById.get(ctl.id)
      const status = state?.status ?? 'not_started'
      counts[status] += 1
      if (status === 'not_started' || status === 'in_progress') {
        gaps.push(ctl)
      }
    }

    c.body(
      `${frameworkControls.length} controls tracked — Implemented: ${counts.implemented}, In progress: ${counts.in_progress}, Not started: ${counts.not_started}, Not applicable: ${counts.not_applicable}.`,
    )

    if (gaps.length > 0) {
      c.spacer(1)
      c.subheading('Gaps')
      for (const gap of gaps) {
        const state = stateById.get(gap.id)
        c.bullet(`[${STATUS_LABELS[state?.status ?? 'not_started']}] ${gap.title}`)
      }
    }
    c.spacer(3)
  }

  // ---- Evidence index (filenames only) ---------------------------------
  doc.addPage()
  c.y = MARGIN
  c.heading('Evidence Index')
  c.body(
    'This index lists the filenames of evidence attached to each control. The underlying files remain stored locally in your browser (IndexedDB) and are not embedded in this PDF.',
  )
  c.spacer(2)

  const statesWithEvidence = controlStates.filter((s) => s.evidenceFileIds.length > 0)
  if (statesWithEvidence.length === 0) {
    c.body('No evidence files have been attached yet.')
  } else {
    for (const state of statesWithEvidence) {
      const ctl = controls.find((ctrl) => ctrl.id === state.controlId)
      if (!ctl) continue
      c.subheading(ctl.title)
      c.body(`${state.evidenceFileIds.length} file(s) attached (see Documents/Frameworks workspace for filenames).`, 9.5)
      c.spacer(1)
    }
  }

  // ---- Remediation plan ------------------------------------------------
  doc.addPage()
  c.y = MARGIN
  c.heading('Remediation Plan')
  c.body(
    'Auto-derived action list of every control that is not yet implemented, across all applicable frameworks.',
  )
  c.spacer(2)

  const actionItems = controls.filter((ctl) => {
    if (!ctl.frameworkSlugs.some((s) => relevantSlugs.includes(s))) return false
    const state = stateById.get(ctl.id)
    const status = state?.status ?? 'not_started'
    return status === 'not_started' || status === 'in_progress'
  })

  if (actionItems.length === 0) {
    c.body('No outstanding action items — every tracked control is implemented or marked not applicable.')
  } else {
    actionItems.forEach((ctl, i) => {
      const state = stateById.get(ctl.id)
      c.ensureSpace(10)
      c.bullet(`${i + 1}. [${STATUS_LABELS[state?.status ?? 'not_started']}] ${ctl.title} (${ctl.domain})`)
    })
  }

  // ---- AI Tool Risk & Mitigation Summary --------------------------------
  if (aiTools.length > 0) {
    doc.addPage()
    c.y = MARGIN
    c.heading('AI Tool Risk & Mitigation Summary')
    c.body(
      'This section covers AIro’s AI Discovery & Monitoring workspace: a self-reported inventory of AI tools in use, scored by a deterministic risk engine, with mitigations tracked against each finding.',
    )
    c.spacer(2)

    const findingsByTool = new Map<string, AiRiskFinding[]>()
    for (const f of aiRiskFindings) {
      const list = findingsByTool.get(f.toolId) ?? []
      list.push(f)
      findingsByTool.set(f.toolId, list)
    }
    const mitigationsByFinding = new Map<string, AiMitigation[]>()
    for (const m of aiMitigations) {
      const list = mitigationsByFinding.get(m.findingId) ?? []
      list.push(m)
      mitigationsByFinding.set(m.findingId, list)
    }

    for (const tool of aiTools) {
      const toolFindings = findingsByTool.get(tool.id) ?? []
      c.ensureSpace(12)
      c.subheading(`${tool.name}${tool.vendor ? ` (${tool.vendor})` : ''}`)
      c.body(`Deployment: ${tool.deploymentType} · Last reviewed: ${new Date(tool.lastReviewedAt).toLocaleDateString('en-GB')}`, 9.5)

      if (toolFindings.length === 0) {
        c.body('No risk findings recorded for this tool.', 9.5)
      } else {
        for (const f of toolFindings) {
          c.ensureSpace(8)
          c.bullet(`${CATEGORY_LABELS[f.category] ?? f.category} — ${SEVERITY_LABELS[f.severity]}: ${f.reason}`)
          const findingMitigations = mitigationsByFinding.get(f.id) ?? []
          for (const m of findingMitigations) {
            c.ensureSpace(6)
            c.doc.setFont('helvetica', 'normal')
            c.doc.setFontSize(9.5)
            const lines: string[] = c.doc.splitTextToSize(
              `    → [${MITIGATION_STATUS_LABELS[m.status]}] ${m.title}`,
              CONTENT_WIDTH - 10,
            )
            for (const line of lines) {
              c.ensureSpace(LINE_HEIGHT)
              c.doc.text(line, MARGIN, c.y)
              c.y += LINE_HEIGHT
            }
          }
        }
      }
      c.spacer(3)
    }

    // Before / after residual risk counts — a finding counts as resolved
    // once every one of its mitigations is marked implemented, mirroring
    // the same derived calculation used in the AI Monitor workspace.
    const beforeCounts: Record<AiRiskSeverity, number> = { low: 0, medium: 0, high: 0, critical: 0 }
    const afterCounts: Record<AiRiskSeverity, number> = { low: 0, medium: 0, high: 0, critical: 0 }
    for (const f of aiRiskFindings) {
      beforeCounts[f.severity] += 1
      const findingMitigations = mitigationsByFinding.get(f.id) ?? []
      const resolved = findingMitigations.length > 0 && findingMitigations.every((m) => m.status === 'implemented')
      if (!resolved) afterCounts[f.severity] += 1
    }

    c.ensureSpace(14)
    c.subheading('Before / after residual risk')
    c.body(
      `Before any mitigation: ${beforeCounts.critical} critical, ${beforeCounts.high} high, ${beforeCounts.medium} medium, ${beforeCounts.low} low.`,
      9.5,
    )
    c.body(
      `Residual (current, after implemented mitigations): ${afterCounts.critical} critical, ${afterCounts.high} high, ${afterCounts.medium} medium, ${afterCounts.low} low.`,
      9.5,
    )
    c.spacer(2)
    c.body(
      'This is a manually self-reported inventory with periodic re-scoring, not automated continuous monitoring — see the README for scope notes.',
      9,
    )
  }

  // ---- Final disclaimer page -------------------------------------------
  doc.addPage()
  c.y = MARGIN
  c.heading('Disclaimer')
  c.body(
    'This report was generated by AIro as guidance to support your AI compliance and audit readiness programme. It does not constitute legal advice and AIro is not a certification body.',
  )
  c.spacer(3)
  c.body(
    'Frameworks marked as requiring independent third-party audit — including Cyber Essentials Plus, ISO/IEC 27001, ISO 22301 (Business Continuity Management) and SOC 2 — still require that audit to be carried out by an accredited or appropriately qualified independent assessor before any certification or attestation can be claimed. Completing the readiness work in AIro is a strong preparatory step towards that audit, but does not itself constitute certification.',
  )
  c.spacer(3)
  c.body(
    'Applicability verdicts are produced by a deterministic rules engine based on the answers provided during profiling. They are intended as a well-reasoned starting point for your own compliance programme, not a substitute for independent legal or regulatory advice specific to your circumstances.',
  )

  doc.save(`AIro-Compliance-Report-${(profile.companyName || 'company').replace(/\s+/g, '-')}.pdf`)
}

function sectorLabel(sector: Profile['sector']): string {
  const labels: Record<Profile['sector'], string> = {
    financial_services: 'Financial Services',
    healthcare_nhs: 'Healthcare / NHS',
    legal: 'Legal',
    accounting: 'Accounting',
    it_msp_saas: 'IT / MSP / SaaS',
    recruitment: 'Recruitment',
    other: 'Other',
  }
  return labels[sector]
}

function turnoverLabel(band: Profile['turnoverBand']): string {
  const labels: Record<Profile['turnoverBand'], string> = {
    under_632k: 'Under £632k',
    '632k_10_9m': '£632k – £10.9m',
    '10_9m_36m': '£10.9m – £36m',
    over_36m: 'Over £36m',
  }
  return labels[band]
}
