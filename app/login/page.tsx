'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DEMO_TENANTS, DemoTenant } from '@/lib/demo-tenants'
import { ShieldIcon } from '@/components/icons'

const SECTOR_LABELS: Record<string, string> = {
  financial_services: 'Financial Services',
  healthcare_nhs: 'Healthcare / NHS',
  legal: 'Legal',
  accounting: 'Accounting',
  it_msp_saas: 'IT / MSP / SaaS',
  recruitment: 'Recruitment',
  other: 'Other',
}

export default function LoginPage() {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)

  function choose(tenant: DemoTenant) {
    setPendingId(tenant.id)
    // The chosen tenant id is handed to /connect via the query string —
    // nothing is written to the store yet. The fake consent screen is what
    // actually seeds the store on "Accept", so a cancelled consent leaves
    // no demo data behind.
    router.push(`/connect?tenant=${tenant.id}`)
  }

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center">
          <svg viewBox="0 0 40 40" className="h-12 w-12">
            <path d="M20 2L35.588 11V29L20 38L4.412 29V11L20 2Z" fill="#0E9F8E" opacity="0.15" />
            <path d="M20 2L35.588 11V29L20 38L4.412 29V11L20 2Z" stroke="#0E9F8E" strokeWidth="1.5" fill="none" />
            <text x="20" y="24" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E3A5F">
              AI
            </text>
          </svg>
        </div>
        <h1 className="text-h1 text-text-primary">Choose a demo workspace</h1>
        <p className="text-body text-text-secondary">
          Each workspace below is a pre-built fictional UK SMB persona, complete with a
          simulated Microsoft 365 or Google Workspace connection. Pick one to see AIro populated
          with realistic data end-to-end — no sign-up, no real account required.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_TENANTS.map((tenant) => (
          <div
            key={tenant.id}
            className="flex flex-col gap-4 rounded-card border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-brand-navy-light text-brand-navy">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-h3 text-text-primary">{tenant.companyName}</p>
                <p className="mt-0.5 text-caption text-text-secondary">
                  {SECTOR_LABELS[tenant.profile.sector]} · {tenant.headcount} employees
                </p>
              </div>
            </div>
            <p className="text-caption text-text-secondary">
              Connected via{' '}
              {tenant.integration.provider === 'microsoft_365' ? 'Microsoft 365' : 'Google Workspace'}
              {' · '}
              {tenant.integration.mfaEnforcedPercent}% MFA enforcement
            </p>
            <button
              onClick={() => choose(tenant)}
              disabled={pendingId !== null}
              className="mt-auto rounded-button bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#162D4A] disabled:opacity-60"
            >
              Continue as {tenant.companyName}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-caption text-text-muted">
        Demo Mode — these workspaces use simulated fixture data behind a realistic, but fake,
        connection screen. Nothing here connects to a real Microsoft or Google account.
      </p>
    </div>
  )
}
