// Shared types for the AIro compliance demo. Everything here is pure data —
// no React, no browser APIs — so it can be imported from both client
// components and plain utility modules without pulling in 'use client'.

export type FrameworkSlug =
  | 'cyber-essentials'
  | 'iso-27001'
  | 'uk-gdpr'
  | 'pci-dss'
  | 'ai-governance'
  | 'nis-regulations'
  | 'fca-operational-resilience'
  | 'nhs-dspt'
  | 'soc-2'
  | 'iso-22301'
  | 'iso-27701'
  | 'iso-20000-1'
  | 'cyber-essentials-plus'

export type Verdict =
  | 'mandatory_legal'
  | 'mandatory_sector'
  | 'contractual'
  | 'voluntary'
  | 'not_applicable'

export interface ApplicabilityResult {
  slug: FrameworkSlug
  verdict: Verdict
  reason: string
  sourceNote: string
}

export type SectorOption =
  | 'financial_services'
  | 'healthcare_nhs'
  | 'legal'
  | 'accounting'
  | 'it_msp_saas'
  | 'recruitment'
  | 'other'

export type HeadcountBand = '1-9' | '10-49' | '50-249' | '250+'

export type TurnoverBand =
  | 'under_632k'
  | '632k_10_9m'
  | '10_9m_36m'
  | 'over_36m'

export interface Profile {
  sector: SectorOption
  publicSectorOrRegulatedTender: boolean
  handlesCardPayments: boolean
  nhsDataOrServicesLink: boolean
  fcaRegulated: boolean
  providesSaasOrCloudService: boolean
  euEeaCustomersOrStaff: boolean
  deploysAiSystems: boolean
  aiUseCaseNote?: string
  headcountBand: HeadcountBand
  turnoverBand: TurnoverBand
  companyName?: string
  completedAt: string
}

export type ControlStatus =
  | 'not_started'
  | 'in_progress'
  | 'implemented'
  | 'not_applicable'

export interface Control {
  id: string
  frameworkSlugs: FrameworkSlug[]
  domain: string
  title: string
  description: string
  guidance: string
  evidenceExample: string
  /** True for the handful of frameworks we deliberately left lighter-depth */
  lightDepth?: boolean
}

export interface ControlState {
  controlId: string
  status: ControlStatus
  notes: string
  evidenceFileIds: string[]
  updatedAt: string
}

export interface EvidenceFile {
  id: string
  controlId: string
  filename: string
  mimeType: string
  sizeBytes: number
  addedAt: string
  blob: Blob
}

export type FrameworkCategory =
  | 'cyber_security'
  | 'data_privacy'
  | 'financial_services'
  | 'healthcare'
  | 'quality_management'
  | 'ai_governance'

export interface FrameworkMeta {
  slug: FrameworkSlug
  name: string
  shortName: string
  category: FrameworkCategory
  certifiable: boolean
  description: string
  officialSourceName: string
}
