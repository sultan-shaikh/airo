'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getDemoTenant } from '@/lib/demo-tenants'
import { useAppStore } from '@/store/useAppStore'
import { SsoProviderMark } from '@/components/icons'

const PERMISSIONS = [
  "Read your organization's security policies",
  'Read user and device compliance status',
  'Read admin role assignments',
  'Read multi-factor authentication enforcement status',
]

const SYNC_STEPS = [
  'Connecting to {provider}...',
  'Reading security policies...',
  'Reading device compliance status...',
  'Reading admin role assignments...',
  'Syncing security posture...',
]

function providerDisplayName(provider: 'microsoft_365' | 'google_workspace'): string {
  return provider === 'microsoft_365' ? 'Microsoft 365' : 'Google Workspace'
}

function ConnectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const seedFromDemoTenant = useAppStore((s) => s.seedFromDemoTenant)

  const tenantId = searchParams.get('tenant') ?? ''
  const tenant = getDemoTenant(tenantId)

  const [stage, setStage] = useState<'consent' | 'connecting'>('consent')
  const [stepIndex, setStepIndex] = useState(0)

  if (!tenant) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-card border border-border bg-white p-8 text-center shadow-card">
        <p className="text-body text-text-secondary">
          We couldn&apos;t find that demo workspace.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="rounded-button bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
        >
          Back to demo workspaces
        </button>
      </div>
    )
  }

  const provider = providerDisplayName(tenant.integration.provider)
  const steps = SYNC_STEPS.map((s) => s.replace('{provider}', provider))

  async function handleAccept() {
    setStage('connecting')
    // Purely cosmetic sequential status lines — no real handshake, no
    // network call, no credential of any kind is created or stored here.
    for (let i = 0; i < steps.length; i++) {
      setStepIndex(i)
      await new Promise((resolve) => setTimeout(resolve, 350))
    }
    await seedFromDemoTenant(tenant)
    router.push('/dashboard')
  }

  function handleCancel() {
    router.push('/login')
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="relative rounded-card border border-border bg-white p-8 shadow-lg">
        <span className="absolute right-4 top-4 inline-flex items-center rounded-pill bg-surface-tertiary px-2.5 py-1 text-micro font-medium uppercase tracking-wide text-text-muted">
          Demo Mode — simulated integration data
        </span>

        {stage === 'consent' ? (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-button bg-brand-navy-light text-brand-navy">
                <SsoProviderMark className="h-7 w-7" />
              </span>
              <p className="text-h3 text-text-primary">{provider}</p>
              <p className="text-caption text-text-secondary">
                <span className="font-medium text-text-primary">AIro</span> wants to access your
                organization&apos;s account
              </p>
            </div>

            <div className="rounded-input border border-border bg-surface-secondary p-4">
              <p className="mb-2 text-caption font-semibold text-text-primary">This will allow AIro to:</p>
              <ul className="space-y-2">
                {PERMISSIONS.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-caption text-text-secondary">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-micro text-text-muted">
              Signing in as an administrator on <span className="font-medium">{tenant.companyName}</span>.
              This is a simulated consent screen for demo purposes — accepting seeds AIro with
              fixture data only.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 rounded-button border border-border-strong bg-white px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-tertiary"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 rounded-button bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162D4A]"
              >
                Accept
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-button bg-brand-teal-light text-brand-teal">
              <SsoProviderMark className="h-7 w-7 animate-pulse" />
            </span>
            <div className="w-full space-y-2 text-left">
              {steps.map((s, i) => (
                <p
                  key={s}
                  className={`text-caption transition-opacity duration-300 ${
                    i <= stepIndex ? 'opacity-100 text-text-primary' : 'opacity-30 text-text-muted'
                  }`}
                >
                  {i < stepIndex ? '✓' : i === stepIndex ? '…' : '·'} {s}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConnectPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-secondary">Loading…</p>}>
      <ConnectContent />
    </Suspense>
  )
}
