'use client'

import { useEffect, useState } from 'react'
import { IntegrationFixture } from '@/lib/demo-tenants'
import { buildIntegrationFindings } from '@/lib/demo-control-mapping'
import { explainIntegrationFinding } from '@/lib/aira'
import { SsoProviderMark, SyncIcon } from '@/components/icons'
import AiraNote from '@/components/aira/AiraNote'

interface IntegrationsPanelProps {
  fixture: IntegrationFixture
}

function providerLabel(fixture: IntegrationFixture): string {
  return fixture.provider === 'microsoft_365' ? 'Microsoft 365' : 'Google Workspace'
}

function syncedAgoLabel(lastSyncedAt: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(lastSyncedAt).getTime()) / 60000))
  if (minutes < 1) return 'moments ago'
  return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
}

/**
 * Dashboard card for the simulated demo-workspace integration. Renders
 * entirely from the tenant's fixture data (lib/demo-tenants.ts) — there is
 * no network call behind this, and the "Last synced" time is simply
 * computed client-side from the fixture's lastSyncedAt so it still feels
 * live on a page revisited later.
 */
export default function IntegrationsPanel({ fixture }: IntegrationsPanelProps) {
  const [syncedLabel, setSyncedLabel] = useState(() => syncedAgoLabel(fixture.lastSyncedAt))

  useEffect(() => {
    const interval = setInterval(() => setSyncedLabel(syncedAgoLabel(fixture.lastSyncedAt)), 30_000)
    return () => clearInterval(interval)
  }, [fixture.lastSyncedAt])

  const findings = buildIntegrationFindings(fixture)
  const adminMfaMissing = fixture.adminAccounts.filter((a) => !a.mfaEnabled).length

  return (
    <div className="rounded-card border border-border bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-brand-navy-light text-brand-navy">
            <SsoProviderMark className="h-5 w-5" />
          </span>
          <div>
            <p className="text-h3 text-text-primary">{providerLabel(fixture)}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-caption text-text-secondary">
              <SyncIcon className="h-3.5 w-3.5" />
              Last synced {syncedLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-status-ready-bg px-3 py-1 text-caption font-medium text-status-ready">
            <span className="h-1.5 w-1.5 rounded-full bg-status-ready" />
            Connected
          </span>
          <span className="inline-flex items-center rounded-pill bg-surface-tertiary px-2.5 py-1 text-micro font-medium uppercase tracking-wide text-text-muted">
            Demo Mode — simulated data
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="MFA enforced" value={`${fixture.mfaEnforcedPercent}%`} />
        <Stat label="Conditional access policies" value={String(fixture.conditionalAccessPoliciesActive)} />
        <Stat label="Devices compliant" value={`${fixture.deviceComplianceCompliantPercent}%`} />
        <Stat
          label="Admin accounts flagged"
          value={String(adminMfaMissing)}
          warn={adminMfaMissing > 0}
        />
      </div>

      {findings.length > 0 && (
        <div className="mt-5 space-y-3">
          {findings.map((finding) => (
            <AiraNote key={finding.id} text={explainIntegrationFinding(finding)} />
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-input border border-border bg-surface-secondary p-3">
      <p className={`text-h3 ${warn ? 'text-status-high' : 'text-text-primary'}`}>{value}</p>
      <p className="mt-0.5 text-micro uppercase tracking-wide text-text-muted">{label}</p>
    </div>
  )
}
