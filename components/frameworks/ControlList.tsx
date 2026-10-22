'use client'

import { Control, ControlState, FrameworkSlug } from '@/lib/types'
import ControlItem from './ControlItem'

interface ControlListProps {
  controls: Control[]
  controlStates: Record<string, ControlState>
  frameworkSlug: FrameworkSlug
}

export default function ControlList({ controls, controlStates, frameworkSlug }: ControlListProps) {
  const domains = Array.from(new Set(controls.map((c) => c.domain)))

  return (
    <div className="space-y-8">
      {domains.map((domain) => {
        const domainControls = controls.filter((c) => c.domain === domain)
        const implemented = domainControls.filter(
          (c) => controlStates[c.id]?.status === 'implemented',
        ).length

        return (
          <div key={domain}>
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                {domain}
              </h3>
              <div className="h-px flex-1 bg-border" />
              <span className="shrink-0 text-caption font-medium text-text-secondary">
                {implemented} of {domainControls.length} implemented
              </span>
            </div>
            <div className="space-y-3">
              {domainControls.map((control) => (
                <ControlItem
                  key={control.id}
                  control={control}
                  state={controlStates[control.id]}
                  currentFrameworkSlug={frameworkSlug}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
