import { FrameworkMeta, FrameworkSlug } from './types'

// Metadata for all 13 modules the applicability engine can produce a
// verdict for. `certifiable: true` marks the frameworks where an
// independent third-party audit is required to actually hold a
// certificate — AIro only ever supports the readiness work leading up to
// that audit, never the audit itself.
export const FRAMEWORKS_META: FrameworkMeta[] = [
  {
    slug: 'cyber-essentials',
    name: 'Cyber Essentials',
    shortName: 'Cyber Essentials',
    category: 'cyber_security',
    certifiable: false,
    description:
      'UK government-backed baseline cyber security certification covering five technical control themes: firewalls, secure configuration, security update management, user access control, and malware protection.',
    officialSourceName: 'National Cyber Security Centre (NCSC) / IASME',
  },
  {
    slug: 'cyber-essentials-plus',
    name: 'Cyber Essentials Plus',
    shortName: 'CE+',
    category: 'cyber_security',
    certifiable: true,
    description:
      'The same five control themes as Cyber Essentials, but verified by an independent assessor through hands-on technical testing rather than self-assessment.',
    officialSourceName: 'National Cyber Security Centre (NCSC) / IASME',
  },
  {
    slug: 'iso-27001',
    name: 'ISO/IEC 27001:2022',
    shortName: 'ISO 27001',
    category: 'cyber_security',
    certifiable: true,
    description:
      'International standard for an Information Security Management System (ISMS), structured around Annex A controls grouped into Organizational, People, Physical and Technological themes.',
    officialSourceName: 'International Organization for Standardization (ISO)',
  },
  {
    slug: 'uk-gdpr',
    name: 'UK GDPR & Data Protection Act 2018',
    shortName: 'UK GDPR',
    category: 'data_privacy',
    certifiable: false,
    description:
      'UK statutory data protection law governing the lawful processing of personal data, individual rights, and breach notification obligations.',
    officialSourceName: 'Information Commissioner’s Office (ICO)',
  },
  {
    slug: 'pci-dss',
    name: 'Payment Card Industry Data Security Standard',
    shortName: 'PCI DSS',
    category: 'financial_services',
    certifiable: true,
    description:
      'Global contractual standard, set by the payment card brands, for any organisation that stores, processes or transmits cardholder data.',
    officialSourceName: 'PCI Security Standards Council',
  },
  {
    slug: 'ai-governance',
    name: 'AI Governance & Risk Module',
    shortName: 'AI Governance',
    category: 'ai_governance',
    certifiable: false,
    description:
      'AIro’s own multi-domain module for governing deployed AI systems — covering inventory, risk tiering, data governance, human oversight, transparency, fairness, security and incident response.',
    officialSourceName: 'EU AI Act (Regulation (EU) 2024/1689) and related guidance',
  },
  {
    slug: 'nis-regulations',
    name: 'Network and Information Systems Regulations',
    shortName: 'NIS Regulations',
    category: 'cyber_security',
    certifiable: false,
    description:
      'UK regulations setting cyber security and incident reporting duties for operators of essential services and certain digital service providers.',
    officialSourceName: 'Department for Science, Innovation and Technology (DSIT)',
  },
  {
    slug: 'fca-operational-resilience',
    name: 'FCA Operational Resilience Requirements',
    shortName: 'FCA Op. Resilience',
    category: 'financial_services',
    certifiable: false,
    description:
      'Financial Conduct Authority rules requiring regulated firms to identify important business services, set impact tolerances, and remain resilient to disruption.',
    officialSourceName: 'Financial Conduct Authority (FCA)',
  },
  {
    slug: 'nhs-dspt',
    name: 'NHS Data Security and Protection Toolkit',
    shortName: 'NHS DSPT',
    category: 'healthcare',
    certifiable: false,
    description:
      'Annual self-assessment that organisations handling NHS patient data or services must complete against national data security standards.',
    officialSourceName: 'NHS England',
  },
  {
    slug: 'soc-2',
    name: 'SOC 2 — Trust Services Criteria',
    shortName: 'SOC 2',
    category: 'cyber_security',
    certifiable: true,
    description:
      'US-originated but globally used attestation report, assessed by an independent auditor against the Security, Availability, Processing Integrity, Confidentiality and Privacy trust services criteria.',
    officialSourceName: 'American Institute of CPAs (AICPA)',
  },
  {
    slug: 'iso-22301',
    name: 'ISO 22301 — Business Continuity Management',
    shortName: 'ISO 22301',
    category: 'quality_management',
    certifiable: true,
    description:
      'International standard for a Business Continuity Management System, covering business impact analysis, continuity planning, and exercising.',
    officialSourceName: 'International Organization for Standardization (ISO)',
  },
  {
    slug: 'iso-27701',
    name: 'ISO/IEC 27701 — Privacy Information Management',
    shortName: 'ISO 27701',
    category: 'data_privacy',
    certifiable: true,
    description:
      'Extension to ISO 27001 adding a Privacy Information Management System layer, mapping closely to GDPR-style obligations.',
    officialSourceName: 'International Organization for Standardization (ISO)',
  },
  {
    slug: 'iso-20000-1',
    name: 'ISO/IEC 20000-1 — IT Service Management',
    shortName: 'ISO 20000-1',
    category: 'quality_management',
    certifiable: true,
    description:
      'International standard for an IT Service Management System, covering service design, delivery, and continual improvement.',
    officialSourceName: 'International Organization for Standardization (ISO)',
  },
]

export function getFrameworkMeta(slug: FrameworkSlug): FrameworkMeta {
  const meta = FRAMEWORKS_META.find((f) => f.slug === slug)
  if (!meta) {
    throw new Error(`Unknown framework slug: ${slug}`)
  }
  return meta
}
