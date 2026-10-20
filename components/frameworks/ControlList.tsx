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
        return (
          <div key={domain}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
              {domain}
            </h3>
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
