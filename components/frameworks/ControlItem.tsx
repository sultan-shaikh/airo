'use client'

import { useState } from 'react'
import { Control, ControlState, FrameworkSlug } from '@/lib/types'
import { getFrameworkMeta } from '@/lib/frameworks-meta'
import { explainControl } from '@/lib/aira'
import { useAppStore } from '@/store/useAppStore'
import StatusSelector from './StatusSelector'
import EvidenceUploader from './EvidenceUploader'
import AiraNote from '@/components/aira/AiraNote'

interface ControlItemProps {
  control: Control
  state: ControlState | undefined
  currentFrameworkSlug: FrameworkSlug
}

export default function ControlItem({ control, state, currentFrameworkSlug }: ControlItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [showAira, setShowAira] = useState(false)
  const setControlStatus = useAppStore((s) => s.setControlStatus)
  const setControlNotes = useAppStore((s) => s.setControlNotes)

  const status = state?.status ?? 'not_started'
  const otherFrameworks = control.frameworkSlugs.filter((s) => s !== currentFrameworkSlug)

  return (
    <div className="rounded-card border border-border bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-left text-sm font-semibold text-text-primary hover:text-brand-navy"
          >
            {control.title}
          </button>
          <p className="mt-1 text-sm text-text-secondary">{control.description}</p>
          {otherFrameworks.length > 0 && (
            <p className="mt-1 text-xs text-text-muted">
              Shared across: {otherFrameworks.map((s) => getFrameworkMeta(s).shortName).join(', ')}
            </p>
          )}
        </div>
        <StatusSelector
          value={status}
          onChange={(newStatus) => setControlStatus(control.id, newStatus)}
        />
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Guidance
            </p>
            <p className="mt-1 text-sm text-text-primary">{control.guidance}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              What evidence should look like
            </p>
            <p className="mt-1 text-sm text-text-primary">{control.evidenceExample}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAira((v) => !v)}
            className="text-sm font-medium text-brand-teal hover:underline"
          >
            {showAira ? 'Hide' : 'Ask AIra to explain this'}
          </button>
          {showAira && <AiraNote text={explainControl(control)} />}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Notes
            </p>
            <textarea
              defaultValue={state?.notes ?? ''}
              onBlur={(e) => setControlNotes(control.id, e.target.value)}
              placeholder="Add any notes about how this control is implemented..."
              className="mt-1 w-full rounded-input border border-border p-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              rows={2}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Evidence
            </p>
            <EvidenceUploader controlId={control.id} />
          </div>
        </div>
      )}
    </div>
  )
}
