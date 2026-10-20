'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { CONTROLS } from '@/lib/controls'
import ReportPreview from '@/components/report/ReportPreview'

export default function ReportPage() {
  const router = useRouter()
  const hydrated = useAppStore((s) => s.hydrated)
  const profile = useAppStore((s) => s.profile)
  const applicability = useAppStore((s) => s.applicability)
  const controlStates = useAppStore((s) => s.controlStates)
  const aiTools = useAppStore((s) => s.aiTools)
  const aiRiskFindings = useAppStore((s) => s.aiRiskFindings)
  const aiMitigations = useAppStore((s) => s.aiMitigations)
  const hydrate = useAppStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (hydrated && !profile) {
      router.replace('/profile')
    }
  }, [hydrated, profile, router])

  if (!hydrated || !profile) {
    return <p className="text-sm text-text-secondary">Loading your report...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Compliance report</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Review your applicability summary and generate a regulator-ready evidence pack.
        </p>
      </div>
      <ReportPreview
        profile={profile}
        applicability={applicability}
        controls={CONTROLS}
        controlStates={controlStates}
        aiTools={aiTools}
        aiRiskFindings={aiRiskFindings}
        aiMitigations={aiMitigations}
      />
    </div>
  )
}
