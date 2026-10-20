// Types for the AI Discovery & Monitoring workspace.
//
// This extends the existing `ai-governance` control module (see
// `lib/controls.ts`) with a second, distinct capability: instead of a
// one-off static control checklist, this is a self-reported inventory of
// the AI tools an SMB actually uses, scored for risk on a deterministic
// basis, with mitigations tracked over time and a "re-check" workflow for
// periodic review. Pure data only — no React, no browser APIs — so it can
// be imported from client components and plain utility modules alike.

export type AiToolDeploymentType =
  | 'saas_api'
  | 'embedded_in_other_saas'
  | 'custom_model'
  | 'browser_extension'

export interface AiTool {
  id: string
  name: string
  vendor: string
  deploymentType: AiToolDeploymentType
  /** Free tags describing the kinds of data the tool handles, e.g. 'customer PII', 'source code', 'financial data', 'health data'. */
  dataTypesHandled: string[]
  customerFacing: boolean
  internalOnly: boolean
  addedAt: string
  lastReviewedAt: string
}

export type AiRiskCategory =
  | 'data_leakage'
  | 'shadow_use'
  | 'over_permissioned_access'
  | 'prompt_injection_exposure'
  | 'vendor_supply_chain'
  | 'bias_fairness'
  | 'oversight_gap'
  | 'logging_gap'

export type AiRiskSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface AiRiskFinding {
  id: string
  toolId: string
  category: AiRiskCategory
  severity: AiRiskSeverity
  /** Plain-English explanation of what triggered this finding. */
  reason: string
  /** Which tool attributes caused it, e.g. 'customerFacing', 'dataTypesHandled:customer PII'. */
  triggeredBy: string[]
}

export type AiMitigationStatus = 'not_started' | 'in_progress' | 'implemented'

export interface AiMitigation {
  id: string
  findingId: string
  /** Optional link to an existing Control.id from lib/controls.ts's ai_governance set, to reuse that control's status/evidence instead of duplicating it. */
  controlRefId?: string
  title: string
  description: string
  status: AiMitigationStatus
  notes: string
}
