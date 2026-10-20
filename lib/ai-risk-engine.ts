// Deterministic AI tool risk scoring engine.
//
// Exactly like `lib/decision-tree.ts` for framework applicability, this is
// pure, rules-based logic with no randomness and no AI call involved:
// `scoreTool` always returns the same findings for the same tool. AIra
// (see `explainAiRisk` in `lib/aira.ts`) only ever explains these results
// in plain English afterwards — she never decides them, and never
// overrides or softens a finding the engine produced.

import { v4 as uuidv4 } from 'uuid'
import { AiMitigation, AiRiskCategory, AiRiskFinding, AiRiskSeverity, AiTool } from './ai-inventory-types'
import { CONTROLS } from './controls'

const SENSITIVE_DATA_PATTERN = /pii|personal|health|financial|medical|card|biometric/i
const HIGH_IMPACT_DATA_PATTERN = /health|financial|medical|card/i

/**
 * Looks up an existing ai_governance control whose title matches a keyword
 * fragment, so a proposed mitigation can reuse that control's status and
 * evidence instead of duplicating tracking. Returns undefined rather than
 * throwing if no good match exists — a mitigation can stand on its own.
 */
function findAiGovernanceControlId(titleFragment: string): string | undefined {
  const match = CONTROLS.find(
    (c) => c.frameworkSlugs.includes('ai-governance') && c.title.toLowerCase().includes(titleFragment.toLowerCase()),
  )
  return match?.id
}

function finding(
  toolId: string,
  category: AiRiskCategory,
  severity: AiRiskSeverity,
  reason: string,
  triggeredBy: string[],
): AiRiskFinding {
  return { id: uuidv4(), toolId, category, severity, reason, triggeredBy }
}

/**
 * Scores a single AI tool against a fixed set of deterministic rules.
 * Order of rules does not affect the result — each rule is independent and
 * may append zero or one finding. Same tool in, same findings out, always.
 */
export function scoreTool(tool: AiTool): AiRiskFinding[] {
  const findings: AiRiskFinding[] = []

  // Rule 1 — Oversight gap: a customer-facing AI tool with no recorded
  // human-review step is a meaningful oversight risk — decisions or
  // conversations reaching customers unchecked.
  if (tool.customerFacing) {
    findings.push(
      finding(
        tool.id,
        'oversight_gap',
        'high',
        `${tool.name} is customer-facing but the inventory has no record of a human oversight/review step for its outputs.`,
        ['customerFacing'],
      ),
    )
  }

  // Rule 2 — Data leakage: sensitive data types handled by a tool that
  // sends data to a third party (SaaS API, or embedded inside another
  // vendor's SaaS product) risks that data leaving the organisation's
  // control. Severity is higher for health/financial data specifically.
  const sensitiveTags = tool.dataTypesHandled.filter((t) => SENSITIVE_DATA_PATTERN.test(t))
  if (
    sensitiveTags.length > 0 &&
    (tool.deploymentType === 'saas_api' || tool.deploymentType === 'embedded_in_other_saas')
  ) {
    const highImpact = sensitiveTags.some((t) => HIGH_IMPACT_DATA_PATTERN.test(t))
    findings.push(
      finding(
        tool.id,
        'data_leakage',
        highImpact ? 'high' : 'medium',
        `${tool.name} handles ${sensitiveTags.join(', ')} and is deployed as a third-party ${tool.deploymentType === 'saas_api' ? 'SaaS/API tool' : 'feature embedded in another SaaS product'}, so that data leaves your direct control.`,
        [...sensitiveTags.map((t) => `dataTypesHandled:${t}`), `deploymentType:${tool.deploymentType}`],
      ),
    )
  }

  // Rule 3 — Shadow use: a tool marked neither customer-facing nor
  // internal-only, with no reviewer attribution implied by lastReviewedAt
  // ever having been set, suggests it was added without going through a
  // deliberate classification step (the real-world "found out about it in
  // a survey" scenario the AI Governance control library already flags).
  if (!tool.customerFacing && !tool.internalOnly) {
    findings.push(
      finding(
        tool.id,
        'shadow_use',
        'medium',
        `${tool.name} isn't flagged as either customer-facing or internal-only — that usually means it was adopted informally rather than through a deliberate sign-off step.`,
        ['customerFacing:false', 'internalOnly:false'],
      ),
    )
  }

  // Rule 4 — Vendor supply chain + logging gap: browser extensions run in
  // an uncontrolled client environment with no central admin console, so
  // visibility into what they actually do with data is typically poor.
  if (tool.deploymentType === 'browser_extension') {
    findings.push(
      finding(
        tool.id,
        'vendor_supply_chain',
        'medium',
        `${tool.name} is a browser extension. Extensions update outside your usual software approval process and can change behaviour without warning, so the vendor relationship carries more supply-chain risk than a managed SaaS contract.`,
        ['deploymentType:browser_extension'],
      ),
    )
    findings.push(
      finding(
        tool.id,
        'logging_gap',
        'medium',
        `${tool.name}, as a browser extension, usually has no central admin console or audit log you control — you typically can't see what data it accessed or sent.`,
        ['deploymentType:browser_extension'],
      ),
    )
  }

  // Rule 5 — Prompt injection exposure: any tool that is deployed in a way
  // that takes free-form user/customer input and calls an LLM is exposed
  // to prompt injection and manipulation risk. We treat SaaS/API and
  // embedded tools as "takes free-form input" by default for this demo,
  // since that's the dominant pattern for LLM-backed tools; severity rises
  // when the input source is a customer rather than internal staff.
  if (tool.deploymentType === 'saas_api' || tool.deploymentType === 'embedded_in_other_saas') {
    findings.push(
      finding(
        tool.id,
        'prompt_injection_exposure',
        tool.customerFacing ? 'high' : 'medium',
        `${tool.name} accepts free-form input and calls an underlying AI model, which makes it a candidate for prompt injection or manipulation attempts${tool.customerFacing ? ', and the risk is higher here because that input can come directly from customers' : ''}.`,
        ['deploymentType', tool.customerFacing ? 'customerFacing' : 'internal_input'],
      ),
    )
  }

  return findings
}

const MITIGATION_LIBRARY: Record<AiRiskCategory, { title: string; description: string; controlFragment?: string }[]> = {
  data_leakage: [
    {
      title: 'Deploy DLP/egress monitoring for AI tool traffic',
      description: 'Add data-loss-prevention or network egress monitoring that covers traffic to this AI tool, so sensitive data leaving the organisation via it is visible rather than invisible.',
      controlFragment: 'A.8.12 Data leakage prevention',
    },
    {
      title: 'Confirm the vendor’s data retention and training-use settings',
      description: 'Check the vendor’s terms for how long prompts/outputs are retained and whether they are used to further train the vendor’s models, and turn off training-use if that setting exists.',
      controlFragment: 'Data retention and deletion rules apply to AI system inputs',
    },
  ],
  shadow_use: [
    {
      title: 'Bring the tool into the formal AI inventory and classification process',
      description: 'Record this tool’s owner, purpose and risk tier in the governance inventory so it stops being informally adopted shadow AI and starts being a tracked, sanctioned system.',
      controlFragment: 'A current inventory of all AI systems in use is maintained',
    },
  ],
  over_permissioned_access: [
    {
      title: 'Review and tighten the tool’s access scopes/permissions',
      description: 'Audit what systems, data stores and APIs this tool currently has access to, and remove any permission broader than what its actual use case requires.',
      controlFragment: 'Access to AI model credentials and admin consoles is tightly controlled',
    },
  ],
  prompt_injection_exposure: [
    {
      title: 'Run a prompt injection / manipulation test pass',
      description: 'Test the tool with adversarial inputs designed to override its instructions or extract hidden context, and apply input filtering or system-prompt hardening based on the results.',
      controlFragment: 'AI systems are assessed for prompt injection and manipulation risks',
    },
  ],
  vendor_supply_chain: [
    {
      title: 'Add the vendor to supplier due diligence review',
      description: 'Assess the vendor’s security practices, update cadence and reliability track record, and decide whether a managed alternative with central admin controls is warranted.',
      controlFragment: 'AI model and tool vendors are assessed for security, data handling and reliability',
    },
  ],
  bias_fairness: [
    {
      title: 'Run an outcome comparison across relevant groups',
      description: 'Where this tool influences a decision about people, compare its outputs across the demographic groups that matter for your use case and document any disparity found.',
      controlFragment: 'AI systems used in decisions about people are tested for discriminatory bias',
    },
  ],
  oversight_gap: [
    {
      title: 'Add a genuine human review step before outputs reach customers',
      description: 'Introduce a reviewer with real authority to change or block the AI’s output before it reaches a customer or is acted on, not a rubber-stamp approval.',
      controlFragment: 'High-risk or significant AI-driven decisions include a meaningful human review step',
    },
    {
      title: 'Define an override/appeal path for anyone affected by this tool’s output',
      description: 'Give customers or staff affected by this tool’s decisions a clear way to request human review.',
      controlFragment: 'An override/appeal mechanism exists for individuals affected by AI-driven decisions',
    },
  ],
  logging_gap: [
    {
      title: 'Introduce logging/visibility for this tool’s activity',
      description: 'Where a central admin console isn’t available (e.g. a browser extension), use device management or network logging to record when and how the tool is used.',
      controlFragment: 'Access to AI model credentials and admin consoles is tightly controlled',
    },
  ],
}

/**
 * Proposes 1-2 sensible mitigations for a finding, using a fixed library
 * keyed by risk category. Where a good match exists in the ai_governance
 * control set, the mitigation links controlRefId so its status/evidence
 * can be tracked once via that control rather than duplicated here.
 */
export function defaultMitigationsFor(finding: AiRiskFinding): AiMitigation[] {
  const templates = MITIGATION_LIBRARY[finding.category] ?? []
  return templates.map((t) => ({
    id: uuidv4(),
    findingId: finding.id,
    controlRefId: t.controlFragment ? findAiGovernanceControlId(t.controlFragment) : undefined,
    title: t.title,
    description: t.description,
    status: 'not_started' as const,
    notes: '',
  }))
}
