'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { getControlsForFramework } from '@/lib/controls'
import { FRAMEWORKS_META, getFrameworkMeta } from '@/lib/frameworks-meta'
import { FrameworkSlug } from '@/lib/types'
import { explainVerdict } from '@/lib/aira'
import ControlList from '@/components/frameworks/ControlList'
import AiraNote from '@/components/aira/AiraNote'
import VerdictBadge from '@/components/dashboard/VerdictBadge'

const VALID_SLUGS = new Set(FRAMEWORKS_META.map((m) => m.slug))

export default function FrameworkWorkspace({ slug }: { slug: string }) {
  const router = useRouter()
  const hydrated = useAppStore((s) => s.hydrated)
  const profile = useAppStore((s) => s.profile)
  const applicability = useAppStore((s) => s.applicability)
  const controlStates = useAppStore((s) => s.controlStates)
  const hydrate = useAppStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (hydrated && !profile) {
      router.replace('/profile')
    }
  }, [hydrated, profile, router])

  if (!VALID_SLUGS.has(slug as FrameworkSlug)) {
    return <p className="text-sm text-status-critical">Unknown framework.</p>
  }

  if (!hydrated || !profile) {
    return <p className="text-sm text-text-secondary">Loading...</p>
  }

  const frameworkSlug = slug as FrameworkSlug
  const meta = getFrameworkMeta(frameworkSlug)
  const result = applicability.find((a) => a.slug === frameworkSlug)
  const controls = getControlsForFramework(frameworkSlug)

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm font-medium text-brand-teal hover:underline">
        &larr; Back to dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{meta.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">{meta.description}</p>
          <p className="mt-1 text-xs text-text-muted">Source: {meta.officialSourceName}</p>
        </div>
        {result && <VerdictBadge verdict={result.verdict} />}
      </div>

      {meta.certifiable && (
        <div className="rounded-card border-l-[3px] border-status-high bg-status-high-bg p-4 text-sm text-text-primary">
          This framework requires independent third-party audit for formal certification. AIro
          helps you prepare the evidence, but does not issue certificates itself.
        </div>
      )}

      {result && <AiraNote text={explainVerdict(result)} />}

      {controls.length > 0 ? (
        <ControlList controls={controls} controlStates={controlStates} frameworkSlug={frameworkSlug} />
      ) : (
        <p className="text-sm text-text-secondary">No controls are tracked for this module yet.</p>
      )}
    </div>
  )
}
