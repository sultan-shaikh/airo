// AIra explanatory text helper.
//
// This is deliberately NOT a live AI call — there is no backend, no API
// key, no Gemini/Anthropic integration in this build. These functions
// produce pre-written, template-driven, plain-English explanations in
// AIra's calm, plain-speaking voice, interpolating the real data from the
// deterministic decision tree / control library. AIra never overrides or
// contradicts those results — she only explains them.

import { ApplicabilityResult, Control, Verdict } from './types'
import { getFrameworkMeta } from './frameworks-meta'
import { AiRiskCategory, AiRiskFinding, AiRiskSeverity, AiTool } from './ai-inventory-types'

const VERDICT_OPENERS: Record<Verdict, string> = {
  mandatory_legal:
    'This one isn’t optional — it’s a legal requirement that applies to you.',
  mandatory_sector:
    'Based on what you told me about your business, this is mandatory for you.',
  contractual:
    'This isn’t a legal requirement on its own, but it’s commonly demanded contractually.',
  voluntary:
    'There’s no requirement forcing this one right now — it’s a voluntary, proactive choice.',
  not_applicable:
    'Based on your profile, this doesn’t apply to you at the moment.',
}

const VERDICT_TRIP_UPS: Record<Verdict, string> = {
  mandatory_legal:
    'What tends to trip people up: assuming a small team means a lighter legal bar — it usually doesn’t.',
  mandatory_sector:
    'What tends to trip people up: treating a sector requirement as a one-off tick-box rather than something that needs maintaining over time.',
  contractual:
    'What tends to trip people up: starting the certification work only after a customer has already asked for it, which puts you on the back foot in a sales process.',
  voluntary:
    'What tends to trip people up: dismissing a voluntary control entirely, when picking off a few of the highest-value ones can still meaningfully reduce your risk.',
  not_applicable:
    'What tends to trip people up: forgetting to revisit this if your business changes — a new product line, market or customer type can flip this from not applicable to mandatory.',
}

export function explainVerdict(result: ApplicabilityResult): string {
  const meta = getFrameworkMeta(result.slug)
  const opener = VERDICT_OPENERS[result.verdict]
  const tripUp = VERDICT_TRIP_UPS[result.verdict]

  return [
    `Let's talk about ${meta.name}. ${opener}`,
    `Why: ${result.reason}`,
    `This was based on your answer that triggered it: "${result.sourceNote}"`,
    `Why this matters: ${meta.description}`,
    tripUp,
    '⚖️ Guidance note: this is guidance to help you understand your obligations — it is not legal advice. For complex situations, please speak with a qualified solicitor or regulatory specialist.',
  ].join(' ')
}

export function explainControl(control: Control): string {
  const frameworkNames = control.frameworkSlugs
    .map((slug) => {
      try {
        return getFrameworkMeta(slug).shortName
      } catch {
        return slug
      }
    })
    .join(', ')

  const sharedNote =
    control.frameworkSlugs.length > 1
      ? ` This one is shared across ${control.frameworkSlugs.length} frameworks (${frameworkNames}) — get it right once and it counts everywhere it’s used.`
      : ''

  return [
    `Here’s the plain-English version of "${control.title}".`,
    control.description,
    `Why this matters: ${control.guidance}`,
    `What good evidence looks like: ${control.evidenceExample}`,
    sharedNote,
    control.lightDepth
      ? 'A quick note: this is one of the lighter-depth areas in AIro today, so treat it as a solid starting point rather than the full detail of the real standard.'
      : '',
  ]
    .filter(Boolean)
    .join(' ')
}

const CATEGORY_LABELS: Record<AiRiskCategory, string> = {
  data_leakage: 'data leakage',
  shadow_use: 'shadow AI use',
  over_permissioned_access: 'over-permissioned access',
  prompt_injection_exposure: 'prompt injection exposure',
  vendor_supply_chain: 'vendor/supply chain risk',
  bias_fairness: 'bias/fairness risk',
  oversight_gap: 'human oversight gap',
  logging_gap: 'logging/visibility gap',
}

const SEVERITY_OPENERS: Record<AiRiskSeverity, string> = {
  low: 'This is a lower-severity finding — worth tracking, not urgent.',
  medium: 'This is a medium-severity finding — worth scheduling into your next review cycle.',
  high: 'This is a high-severity finding — it’s worth prioritising fairly soon.',
  critical: 'This is a critical finding — it’s worth addressing before you expand use of this tool any further.',
}

/**
 * AIra's plain-English explanation of a single AI risk finding. Exactly
 * like `explainVerdict` and `explainControl` above, this is template text
 * that interpolates the real data produced by the deterministic
 * `scoreTool` rules engine in lib/ai-risk-engine.ts — AIra explains the
 * finding, she never decides or adjusts it.
 */
export function explainAiRisk(finding: AiRiskFinding, tool: AiTool): string {
  const categoryLabel = CATEGORY_LABELS[finding.category]
  const opener = SEVERITY_OPENERS[finding.severity]

  return [
    `Let's talk about ${tool.name} and this ${categoryLabel} finding.`,
    opener,
    `Why: ${finding.reason}`,
    `What triggered it: ${finding.triggeredBy.join(', ')}.`,
    'This finding came from AIro’s deterministic AI risk rules, not a live AI judgement — I’m only here to explain it in plain English.',
    '⚖️ Guidance note: this is guidance to help you understand your risk exposure — it is not legal advice. For complex situations, please speak with a qualified solicitor or regulatory specialist.',
  ].join(' ')
}
