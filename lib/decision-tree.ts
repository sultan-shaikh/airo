import { ApplicabilityResult, FrameworkSlug, Profile } from './types'

// ---------------------------------------------------------------------------
// evaluateApplicability
//
// This is the deterministic core of the whole product: given a Profile, it
// returns an ApplicabilityResult for every one of the 13 supported
// frameworks. It must be a PURE function — no randomness, no dates other
// than what's passed in, no side effects — so the same profile always
// produces the same verdicts. AIra (lib/aira.ts) only ever *explains* these
// results in plain English; it never overrides them.
//
// Sector groupings used below are simplified heuristics for a demo tool,
// not a legal classification service — this is flagged in the UI/report
// disclaimers.
// ---------------------------------------------------------------------------

const DIGITAL_INFRASTRUCTURE_ADJACENT_SECTORS: Profile['sector'][] = [
  'it_msp_saas',
]

const COMMONLY_ENTERPRISE_PROCURED_SECTORS: Profile['sector'][] = [
  'it_msp_saas',
  'financial_services',
  'healthcare_nhs',
  'legal',
  'accounting',
]

export function evaluateApplicability(profile: Profile): ApplicabilityResult[] {
  const results: ApplicabilityResult[] = []

  // 1. UK GDPR / DPA 2018 — mandatory for essentially every business that
  // processes personal data in the UK (staff records alone trigger this).
  results.push({
    slug: 'uk-gdpr',
    verdict: 'mandatory_legal',
    reason:
      'Any UK business that holds personal data about customers, staff or suppliers is bound by the UK GDPR and the Data Protection Act 2018, regardless of sector or size.',
    sourceNote:
      'Triggered automatically — there is no profile answer that makes a UK business exempt from data protection law.',
  })

  // 2. Cyber Essentials — mandatory for organisations bidding into public
  // sector or regulated supply chains that require it; otherwise strongly
  // recommended as a voluntary baseline.
  if (profile.publicSectorOrRegulatedTender) {
    results.push({
      slug: 'cyber-essentials',
      verdict: 'mandatory_sector',
      reason:
        'Many UK public sector contracts and regulated supply chains require a current Cyber Essentials certificate as a condition of bidding or onboarding.',
      sourceNote: 'You indicated you bid for public sector or regulated tenders.',
    })
    results.push({
      slug: 'cyber-essentials-plus',
      verdict: 'contractual',
      reason:
        'Higher-value or higher-risk public sector contracts increasingly specify Cyber Essentials Plus, which adds independent technical verification on top of the base scheme.',
      sourceNote:
        'Follows from your public sector / regulated tender exposure — check the specific tender requirements to confirm whether Plus is mandated.',
    })
  } else {
    results.push({
      slug: 'cyber-essentials',
      verdict: 'voluntary',
      reason:
        'Cyber Essentials is not legally mandated for your profile, but it is the UK’s baseline cyber hygiene standard and is strongly recommended — many customers and insurers now expect it informally.',
      sourceNote: 'No public sector or regulated tender exposure indicated.',
    })
    results.push({
      slug: 'cyber-essentials-plus',
      verdict: 'voluntary',
      reason:
        'Without public sector or regulated tender exposure, CE+ is optional — worth considering once Cyber Essentials basics are in place and you want externally verified assurance.',
      sourceNote: 'No public sector or regulated tender exposure indicated.',
    })
  }

  // 3. PCI DSS — mandatory only if the business actually touches card data.
  if (profile.handlesCardPayments) {
    results.push({
      slug: 'pci-dss',
      verdict: 'mandatory_sector',
      reason:
        'Any organisation that stores, processes or transmits payment card data is contractually bound by the card schemes (Visa, Mastercard, etc.) to comply with PCI DSS, enforced through your merchant/acquirer agreement.',
      sourceNote: 'You indicated you handle card payments.',
    })
  } else {
    results.push({
      slug: 'pci-dss',
      verdict: 'not_applicable',
      reason:
        'PCI DSS only applies to organisations that handle payment card data directly. Based on your answer, this does not apply — if that changes, PCI DSS becomes mandatory immediately.',
      sourceNote: 'You indicated you do not handle card payments.',
    })
  }

  // 4. FCA Operational Resilience
  if (profile.fcaRegulated) {
    results.push({
      slug: 'fca-operational-resilience',
      verdict: 'mandatory_sector',
      reason:
        'FCA-regulated firms must identify their important business services, set impact tolerances for disruption, and demonstrate resilience under the FCA’s operational resilience rules.',
      sourceNote: 'You indicated your firm is FCA-regulated.',
    })
  } else {
    results.push({
      slug: 'fca-operational-resilience',
      verdict: 'not_applicable',
      reason:
        'These rules apply specifically to firms authorised and regulated by the FCA. Based on your answer, this module does not currently apply to you.',
      sourceNote: 'You indicated your firm is not FCA-regulated.',
    })
  }

  // 5. NHS DSPT
  if (profile.nhsDataOrServicesLink) {
    results.push({
      slug: 'nhs-dspt',
      verdict: 'mandatory_sector',
      reason:
        'Organisations that access, hold or support NHS patient data or services must complete the NHS Data Security and Protection Toolkit annually to a satisfactory standard.',
      sourceNote: 'You indicated a link to NHS data or services.',
    })
  } else {
    results.push({
      slug: 'nhs-dspt',
      verdict: 'not_applicable',
      reason:
        'The DSPT applies to organisations with access to NHS patient data or NHS digital services. Based on your answer, this does not currently apply.',
      sourceNote: 'You indicated no link to NHS data or services.',
    })
  }

  // 6. NIS Regulations — mandatory-ish for critical/digital infrastructure
  // adjacent sectors, otherwise generally not applicable for a typical SMB.
  const isNisAdjacent = DIGITAL_INFRASTRUCTURE_ADJACENT_SECTORS.includes(profile.sector)
  if (isNisAdjacent && profile.providesSaasOrCloudService) {
    results.push({
      slug: 'nis-regulations',
      verdict: 'mandatory_sector',
      reason:
        'Relevant digital service providers (including some cloud computing and managed service providers) fall within scope of the NIS Regulations, which impose security and incident reporting duties.',
      sourceNote:
        'Your sector (IT/MSP/SaaS) combined with providing a SaaS or cloud service puts you in a category the regulations are aimed at — confirm exact scope with DSIT guidance for your specific service type.',
    })
  } else if (profile.providesSaasOrCloudService) {
    results.push({
      slug: 'nis-regulations',
      verdict: 'voluntary',
      reason:
        'You are not clearly within a regulated NIS category, but providing a cloud or SaaS service means the security practices NIS expects (incident reporting, supply chain security) are good practice to adopt anyway.',
      sourceNote: 'You indicated you provide a SaaS or cloud service, outside the core digital-infrastructure sector list.',
    })
  } else {
    results.push({
      slug: 'nis-regulations',
      verdict: 'not_applicable',
      reason:
        'NIS Regulations target operators of essential services and specific digital service providers. Based on your profile, this does not currently apply.',
      sourceNote: 'No digital infrastructure or essential service characteristics indicated.',
    })
  }

  // 7. ISO 27001, SOC 2, ISO 27701, ISO 22301, ISO 20000-1 — these are not
  // usually legally mandated for an SMB; they become relevant when
  // customers (especially enterprise or public sector) start demanding
  // them contractually, or when the business proactively wants the
  // assurance for competitive reasons.
  const likelyCustomerDemanded =
    profile.providesSaasOrCloudService ||
    COMMONLY_ENTERPRISE_PROCURED_SECTORS.includes(profile.sector) ||
    profile.publicSectorOrRegulatedTender

  const contractualReason =
    'Not a direct legal requirement, but enterprise and public sector customers commonly require this certification (or equivalent assurance) as a condition of doing business, especially if you provide a SaaS/cloud service.'
  const contractualSourceNote = profile.providesSaasOrCloudService
    ? 'You indicated you provide a SaaS or cloud service, a profile where customers very commonly ask for this.'
    : 'Your sector and/or tender exposure commonly triggers customer requests for this certification, even without a SaaS/cloud product.'

  const voluntaryReason =
    'No legal or contractual trigger identified for your current profile — this remains a voluntary, proactive option if you want the assurance or competitive edge it provides.'
  const voluntarySourceNote =
    'No SaaS/cloud delivery, enterprise-heavy sector, or public sector tender exposure indicated.'

  const certsAffectedByCustomerDemand: FrameworkSlug[] = [
    'iso-27001',
    'soc-2',
    'iso-27701',
    'iso-20000-1',
  ]
  for (const slug of certsAffectedByCustomerDemand) {
    results.push({
      slug,
      verdict: likelyCustomerDemanded ? 'contractual' : 'voluntary',
      reason: likelyCustomerDemanded ? contractualReason : voluntaryReason,
      sourceNote: likelyCustomerDemanded ? contractualSourceNote : voluntarySourceNote,
    })
  }

  // ISO 22301 (business continuity) follows the same contractual-pull logic
  // but is also commonly expected once headcount/turnover cross into
  // medium-business territory, since larger customers expect continuity
  // assurance from larger suppliers too.
  const isMediumOrLargerBusiness =
    profile.headcountBand === '50-249' || profile.headcountBand === '250+'
  if (likelyCustomerDemanded || isMediumOrLargerBusiness) {
    results.push({
      slug: 'iso-22301',
      verdict: 'contractual',
      reason:
        'Customers — particularly enterprise, public sector, or regulated ones — increasingly expect formal business continuity assurance from suppliers of your profile.',
      sourceNote: likelyCustomerDemanded
        ? contractualSourceNote
        : 'Your headcount band suggests customers are more likely to expect formal continuity planning from a business of your size.',
    })
  } else {
    results.push({
      slug: 'iso-22301',
      verdict: 'voluntary',
      reason: voluntaryReason,
      sourceNote: voluntarySourceNote,
    })
  }

  // 8. AI Governance module.
  if (profile.deploysAiSystems && profile.euEeaCustomersOrStaff) {
    results.push({
      slug: 'ai-governance',
      verdict: 'mandatory_legal',
      reason:
        'You deploy AI systems and have EU/EEA customers or staff, which brings you into scope of the EU AI Act’s deployer obligations (risk classification, human oversight, staff AI literacy, and more depending on risk tier).',
      sourceNote: 'You indicated both AI system use and an EU/EEA customer or staff connection.',
    })
  } else if (profile.deploysAiSystems) {
    results.push({
      slug: 'ai-governance',
      verdict: 'voluntary',
      reason:
        'You deploy AI systems but have no indicated EU/EEA exposure, so the EU AI Act’s deployer duties are not clearly triggered yet. Good AI governance is still strongly recommended as UK-specific AI regulation and customer expectations continue to develop.',
      sourceNote: 'You indicated AI system use without EU/EEA customer or staff exposure.',
    })
  } else {
    results.push({
      slug: 'ai-governance',
      verdict: 'not_applicable',
      reason:
        'You indicated you do not currently deploy AI systems, so this module does not apply — revisit it the moment that changes, since AI governance obligations attach quickly once a system goes live.',
      sourceNote: 'You indicated you do not deploy AI systems.',
    })
  }

  return results
}
