// Maps an IntegrationFixture (lib/demo-tenants.ts) onto real control ids
// from lib/controls.ts, and produces a couple of synthetic "findings" for
// the demo IntegrationsPanel to render.
//
// This is a pure function — same fixture in, same control states and
// findings out — same discipline as evaluateApplicability/scoreTool
// elsewhere in the codebase. It never talks to a network or a browser API;
// it only reshapes fixture data that was already hand-written.

import { ControlState, ControlStatus } from './types'
import { IntegrationFixture } from './demo-tenants'

// Real control ids from lib/controls.ts, picked by matching topic — see the
// comment above each assignment for why that id was chosen. (Verified by
// walking lib/controls.ts's mk()/nextId() counter in call order.)
export const INTEGRATION_CONTROL_IDS = {
  /** ce-015 — "Multi-factor authentication (MFA) enforced for cloud services and admin access" */
  mfa: 'ce-015',
  /** iso-033 — "A.8.5 Secure authentication" (closest real control to conditional-access enforcement) */
  conditionalAccess: 'iso-033',
  /** iso-030 — "A.8.1 User endpoint devices" (device compliance / endpoint management) */
  deviceCompliance: 'iso-030',
  /** ce-014 — "Administrative accounts are separate from everyday user accounts" */
  adminAccountSeparation: 'ce-014',
  /** iso-031 — "A.8.2 Privileged access rights" (privileged/admin account review) */
  privilegedAccessReview: 'iso-031',
  /** ce-016 — "Access reviewed regularly and removed promptly on leaving" */
  accessReview: 'ce-016',
} as const

export interface IntegrationFinding {
  id: string
  /** Which control this finding relates to, so the panel can deep-link into that workspace. */
  controlId: string
  severity: 'medium' | 'high'
  title: string
  reason: string
}

function statusForPercent(pct: number): ControlStatus {
  if (pct >= 95) return 'implemented'
  if (pct >= 60) return 'in_progress'
  return 'not_started'
}

function providerLabel(fixture: IntegrationFixture): string {
  return fixture.provider === 'microsoft_365' ? 'Microsoft 365' : 'Google Workspace'
}

function syncedAgoLabel(lastSyncedAt: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(lastSyncedAt).getTime()) / 60000))
  return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
}

function now(): string {
  return new Date().toISOString()
}

/**
 * Builds a partial map of controlId -> ControlState, derived entirely from
 * the integration fixture's numbers. Returned states are merged into the
 * app store the same way any other control state is — this function does
 * not write to IndexedDB itself.
 */
export function applyIntegrationFixture(
  fixture: IntegrationFixture,
): Partial<Record<string, ControlState>> {
  const provider = providerLabel(fixture)
  const synced = syncedAgoLabel(fixture.lastSyncedAt)
  const states: Partial<Record<string, ControlState>> = {}

  const mfaStatus = statusForPercent(fixture.mfaEnforcedPercent)
  states[INTEGRATION_CONTROL_IDS.mfa] = {
    controlId: INTEGRATION_CONTROL_IDS.mfa,
    status: mfaStatus,
    notes: `Auto-detected via ${provider} integration — ${fixture.mfaEnforcedPercent}% MFA enforcement across ${fixture.totalUsers} users. Last synced ${synced}.`,
    evidenceFileIds: [],
    updatedAt: now(),
  }

  const caStatus: ControlStatus =
    fixture.conditionalAccessPoliciesActive >= 5
      ? 'implemented'
      : fixture.conditionalAccessPoliciesActive >= 2
        ? 'in_progress'
        : 'not_started'
  states[INTEGRATION_CONTROL_IDS.conditionalAccess] = {
    controlId: INTEGRATION_CONTROL_IDS.conditionalAccess,
    status: caStatus,
    notes: `Auto-detected via ${provider} integration — ${fixture.conditionalAccessPoliciesActive} conditional access polic${fixture.conditionalAccessPoliciesActive === 1 ? 'y' : 'ies'} active. Last synced ${synced}.`,
    evidenceFileIds: [],
    updatedAt: now(),
  }

  const deviceStatus = statusForPercent(fixture.deviceComplianceCompliantPercent)
  states[INTEGRATION_CONTROL_IDS.deviceCompliance] = {
    controlId: INTEGRATION_CONTROL_IDS.deviceCompliance,
    status: deviceStatus,
    notes: `Auto-detected via ${provider} integration — ${fixture.deviceComplianceCompliantPercent}% of enrolled devices reporting as compliant. Last synced ${synced}.`,
    evidenceFileIds: [],
    updatedAt: now(),
  }

  const mfaMissingCount = fixture.adminAccounts.filter((a) => !a.mfaEnabled).length
  const adminStatus: ControlStatus = mfaMissingCount === 0 ? 'implemented' : 'in_progress'
  states[INTEGRATION_CONTROL_IDS.adminAccountSeparation] = {
    controlId: INTEGRATION_CONTROL_IDS.adminAccountSeparation,
    status: adminStatus,
    notes: `Auto-detected via ${provider} integration — ${fixture.adminAccounts.length} admin accounts identified. Last synced ${synced}.`,
    evidenceFileIds: [],
    updatedAt: now(),
  }
  states[INTEGRATION_CONTROL_IDS.privilegedAccessReview] = {
    controlId: INTEGRATION_CONTROL_IDS.privilegedAccessReview,
    status: mfaMissingCount === 0 ? 'implemented' : 'in_progress',
    notes: `Auto-detected via ${provider} integration — ${fixture.adminAccounts.length - mfaMissingCount} of ${fixture.adminAccounts.length} admin accounts have MFA enabled. Last synced ${synced}.`,
    evidenceFileIds: [],
    updatedAt: now(),
  }

  // Access reviews aren't directly observable from a connected tenant in
  // this fixture — leave as in_progress when MFA enforcement is reasonably
  // high (implying some access hygiene discipline already exists),
  // otherwise not_started, so this control isn't silently marked done by
  // an integration that can't actually evidence it.
  states[INTEGRATION_CONTROL_IDS.accessReview] = {
    controlId: INTEGRATION_CONTROL_IDS.accessReview,
    status: fixture.mfaEnforcedPercent >= 80 ? 'in_progress' : 'not_started',
    notes: `Not directly observable from the ${provider} integration alone — flagged in_progress based on overall access hygiene signals. A manual review is still recommended.`,
    evidenceFileIds: [],
    updatedAt: now(),
  }

  return states
}

/**
 * Produces the 1-2 synthetic findings an IntegrationsPanel should surface,
 * worded like a real detection rather than a generic warning.
 */
export function buildIntegrationFindings(fixture: IntegrationFixture): IntegrationFinding[] {
  const findings: IntegrationFinding[] = []
  const provider = providerLabel(fixture)
  const flaggedAdmins = fixture.adminAccounts.filter((a) => !a.mfaEnabled)

  if (flaggedAdmins.length > 0) {
    findings.push({
      id: 'admin-mfa-gap',
      controlId: INTEGRATION_CONTROL_IDS.privilegedAccessReview,
      severity: flaggedAdmins.length >= 2 ? 'high' : 'medium',
      title: 'Admin accounts without MFA',
      reason: `${flaggedAdmins.length} of ${fixture.adminAccounts.length} admin accounts do not have MFA enabled — detected during routine sync of your ${provider} tenant. Flagged accounts: ${flaggedAdmins.map((a) => a.email).join(', ')}.`,
    })
  }

  if (fixture.deviceComplianceCompliantPercent < 85) {
    findings.push({
      id: 'device-compliance-gap',
      controlId: INTEGRATION_CONTROL_IDS.deviceCompliance,
      severity: fixture.deviceComplianceCompliantPercent < 70 ? 'high' : 'medium',
      title: 'Devices reporting as non-compliant',
      reason: `${100 - fixture.deviceComplianceCompliantPercent}% of enrolled devices are reporting as non-compliant with your device policy — detected during routine sync of your ${provider} tenant.`,
    })
  }

  return findings
}
