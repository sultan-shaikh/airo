// Fixture data for the "demo workspace" sales/VP demo path (/login →
// /connect → /dashboard). Everything here is static, hand-written fixture
// data — there is no live Microsoft 365 / Google Workspace connection
// anywhere in this file or anything that reads it. See README.md for the
// honest-disclosure rationale.
//
// Pure data only — no React, no browser APIs — same discipline as the rest
// of lib/.

import { Profile } from './types'

export type IntegrationProvider = 'microsoft_365' | 'google_workspace'

export interface AdminAccountFixture {
  name: string
  email: string
  mfaEnabled: boolean
}

export interface IntegrationFixture {
  provider: IntegrationProvider
  connectedAt: string
  lastSyncedAt: string
  mfaEnforcedPercent: number
  conditionalAccessPoliciesActive: number
  deviceComplianceCompliantPercent: number
  adminAccounts: AdminAccountFixture[]
  totalUsers: number
}

export interface DemoTenant {
  id: string
  companyName: string
  headcount: number
  profile: Profile
  integration: IntegrationFixture
}

// Helper to keep "lastSyncedAt" looking plausibly recent relative to when
// the demo is actually run, rather than a fixed date that ages badly.
function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

export const DEMO_TENANTS: DemoTenant[] = [
  // --- Financial services -------------------------------------------------
  {
    id: 'meridian-wealth',
    companyName: 'Meridian Wealth Partners',
    headcount: 34,
    profile: {
      sector: 'financial_services',
      publicSectorOrRegulatedTender: false,
      handlesCardPayments: false,
      nhsDataOrServicesLink: false,
      fcaRegulated: true,
      providesSaasOrCloudService: false,
      euEeaCustomersOrStaff: false,
      deploysAiSystems: true,
      aiUseCaseNote: 'AI-assisted portfolio commentary drafting and client meeting note summarisation.',
      headcountBand: '10-49',
      turnoverBand: '632k_10_9m',
      companyName: 'Meridian Wealth Partners',
      completedAt: '2026-09-02T09:14:00.000Z',
    },
    integration: {
      provider: 'microsoft_365',
      connectedAt: '2026-09-02T09:20:00.000Z',
      lastSyncedAt: minutesAgo(14),
      mfaEnforcedPercent: 97,
      conditionalAccessPoliciesActive: 6,
      deviceComplianceCompliantPercent: 91,
      totalUsers: 34,
      adminAccounts: [
        { name: 'Priya Chandra', email: 'priya.chandra@meridianwealth.co.uk', mfaEnabled: true },
        { name: 'Owen Fletcher', email: 'owen.fletcher@meridianwealth.co.uk', mfaEnabled: true },
        { name: 'Diane Okafor', email: 'diane.okafor@meridianwealth.co.uk', mfaEnabled: false },
      ],
    },
  },

  // --- Healthcare / NHS-adjacent ------------------------------------------
  {
    id: 'carrow-legal',
    companyName: 'Carrow Legal Associates',
    headcount: 22,
    profile: {
      sector: 'legal',
      publicSectorOrRegulatedTender: true,
      handlesCardPayments: false,
      nhsDataOrServicesLink: false,
      fcaRegulated: false,
      providesSaasOrCloudService: false,
      euEeaCustomersOrStaff: false,
      deploysAiSystems: true,
      aiUseCaseNote: 'AI-assisted contract review and legal research drafting, reviewed by a qualified solicitor before use.',
      headcountBand: '10-49',
      turnoverBand: '632k_10_9m',
      companyName: 'Carrow Legal Associates',
      completedAt: '2026-08-18T11:02:00.000Z',
    },
    integration: {
      provider: 'microsoft_365',
      connectedAt: '2026-08-18T11:08:00.000Z',
      lastSyncedAt: minutesAgo(9),
      mfaEnforcedPercent: 88,
      conditionalAccessPoliciesActive: 4,
      deviceComplianceCompliantPercent: 79,
      totalUsers: 22,
      adminAccounts: [
        { name: 'Marcus Hale', email: 'marcus.hale@carrowlegal.co.uk', mfaEnabled: true },
        { name: 'Sofia Bianchi', email: 'sofia.bianchi@carrowlegal.co.uk', mfaEnabled: false },
      ],
    },
  },

  // --- Accounting -----------------------------------------------------------
  {
    id: 'thornfield-hale',
    companyName: 'Thornfield & Hale Accountants',
    headcount: 16,
    profile: {
      sector: 'accounting',
      publicSectorOrRegulatedTender: false,
      handlesCardPayments: false,
      nhsDataOrServicesLink: false,
      fcaRegulated: false,
      providesSaasOrCloudService: false,
      euEeaCustomersOrStaff: false,
      deploysAiSystems: false,
      aiUseCaseNote: '',
      headcountBand: '10-49',
      turnoverBand: 'under_632k',
      companyName: 'Thornfield & Hale Accountants',
      completedAt: '2026-07-30T14:40:00.000Z',
    },
    integration: {
      provider: 'microsoft_365',
      connectedAt: '2026-07-30T14:45:00.000Z',
      lastSyncedAt: minutesAgo(21),
      mfaEnforcedPercent: 72,
      conditionalAccessPoliciesActive: 2,
      deviceComplianceCompliantPercent: 68,
      totalUsers: 16,
      adminAccounts: [
        { name: 'Rebecca Thornfield', email: 'rebecca.thornfield@thornfieldhale.co.uk', mfaEnabled: true },
      ],
    },
  },

  // --- IT / MSP / SaaS ---------------------------------------------------
  {
    id: 'hollowell-it',
    companyName: 'Hollowell IT Managed Services',
    headcount: 58,
    profile: {
      sector: 'it_msp_saas',
      publicSectorOrRegulatedTender: true,
      handlesCardPayments: false,
      nhsDataOrServicesLink: false,
      fcaRegulated: false,
      providesSaasOrCloudService: true,
      euEeaCustomersOrStaff: true,
      deploysAiSystems: true,
      aiUseCaseNote: 'AI-assisted ticket triage and first-line response drafting across the managed service desk.',
      headcountBand: '50-249',
      turnoverBand: '10_9m_36m',
      companyName: 'Hollowell IT Managed Services',
      completedAt: '2026-10-05T08:55:00.000Z',
    },
    integration: {
      provider: 'google_workspace',
      connectedAt: '2026-10-05T09:01:00.000Z',
      lastSyncedAt: minutesAgo(5),
      mfaEnforcedPercent: 99,
      conditionalAccessPoliciesActive: 9,
      deviceComplianceCompliantPercent: 96,
      totalUsers: 58,
      adminAccounts: [
        { name: 'Elliot Grainger', email: 'elliot.grainger@hollowellit.co.uk', mfaEnabled: true },
        { name: 'Naomi Ferreira', email: 'naomi.ferreira@hollowellit.co.uk', mfaEnabled: true },
        { name: 'Tariq Siddiqui', email: 'tariq.siddiqui@hollowellit.co.uk', mfaEnabled: true },
        { name: 'Beth Cardwell', email: 'beth.cardwell@hollowellit.co.uk', mfaEnabled: true },
        { name: 'Jack Oyelaran', email: 'jack.oyelaran@hollowellit.co.uk', mfaEnabled: true },
        { name: 'Service Account — Backup', email: 'svc-backup@hollowellit.co.uk', mfaEnabled: false },
      ],
    },
  },

  // --- Recruitment ---------------------------------------------------------
  {
    id: 'northgate-recruitment',
    companyName: 'Northgate Recruitment Group',
    headcount: 27,
    profile: {
      sector: 'recruitment',
      publicSectorOrRegulatedTender: false,
      handlesCardPayments: false,
      nhsDataOrServicesLink: false,
      fcaRegulated: false,
      providesSaasOrCloudService: false,
      euEeaCustomersOrStaff: true,
      deploysAiSystems: true,
      aiUseCaseNote: 'AI-assisted CV screening and candidate-to-role matching across active vacancies.',
      headcountBand: '10-49',
      turnoverBand: '632k_10_9m',
      companyName: 'Northgate Recruitment Group',
      completedAt: '2026-09-21T10:30:00.000Z',
    },
    integration: {
      provider: 'microsoft_365',
      connectedAt: '2026-09-21T10:36:00.000Z',
      lastSyncedAt: minutesAgo(32),
      mfaEnforcedPercent: 64,
      conditionalAccessPoliciesActive: 1,
      deviceComplianceCompliantPercent: 55,
      totalUsers: 27,
      adminAccounts: [
        { name: 'Harriet Osei', email: 'harriet.osei@northgaterecruitment.co.uk', mfaEnabled: true },
        { name: 'Callum Devaney', email: 'callum.devaney@northgaterecruitment.co.uk', mfaEnabled: false },
      ],
    },
  },
]

export function getDemoTenant(id: string): DemoTenant | undefined {
  return DEMO_TENANTS.find((t) => t.id === id)
}
