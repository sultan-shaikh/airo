'use client'

import { useState } from 'react'
import { Control, ControlState, FrameworkSlug } from '@/lib/types'
import { getFrameworkMeta } from '@/lib/frameworks-meta'
import { explainControl } from '@/lib/aira'
import { useAppStore } from '@/store/useAppStore'
import StatusSelector from './StatusSelector'
import EvidenceUploader from './EvidenceUploader'
import AiraNote from '@/components/aira/AiraNote'
import { ChevronIcon, PaperclipIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface ControlItemProps {
  control: Control
  state: ControlState | undefined
  currentFrameworkSlug: FrameworkSlug
}

const STATUS_DOT: Record<string, string> = {
  not_started: 'bg-text-muted',
  in_progress: 'bg-status-moderate',
  implemented: 'bg-status-ready',
  not_applicable: 'bg-text-muted',
}

const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  implemented: 'Implemented',
  not_applicable: 'Not applicable',
}

export default function ControlItem({ control, state, currentFrameworkSlug }: ControlItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [showAira, setShowAira] = useState(false)
  const setControlStatus = useAppStore((s) => s.setControlStatus)
  const setControlNotes = useAppStore((s) => s.setControlNotes)

  const status = state?.status ?? 'not_started'
  const otherFrameworks = control.frameworkSlugs.filter((s) => s !== currentFrameworkSlug)
  const evidenceCount = state?.evidenceFileIds.length ?? 0

  return (
    <div
      className={cn(
        'rounded-card border bg-white shadow-card transition-shadow hover:shadow-card-hover',
        expanded ? 'border-brand-teal/40' : 'border-border',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className={cn('h-2 w-2 shrink-0 rounded-full', STATUS_DOT[status])} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">{control.title}</p>
          {!expanded && (
            <p className="mt-0.5 truncate text-caption text-text-secondary">{control.description}</p>
          )}
        </div>
        <span className="hidden shrink-0 items-center gap-1 text-caption text-text-muted sm:flex">
          {evidenceCount > 0 && (
            <>
              <PaperclipIcon className="h-3.5 w-3.5" />
              {evidenceCount}
            </>
          )}
        </span>
        <span className="shrink-0 rounded-pill bg-surface-tertiary px-2.5 py-1 text-micro font-semibold uppercase tracking-wide text-text-secondary">
          {STATUS_LABEL[status]}
        </span>
        <ChevronIcon open={expanded} className="h-4 w-4 shrink-0 text-text-muted" />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-4">
          <p className="text-sm text-text-secondary">{control.description}</p>
          {otherFrameworks.length > 0 && (
            <p className="text-caption text-text-muted">
              Shared across: {otherFrameworks.map((s) => getFrameworkMeta(s).shortName).join(', ')}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 rounded-input bg-surface-secondary p-3">
            <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
              Status
            </p>
            <StatusSelector
              value={status}
              onChange={(newStatus) => setControlStatus(control.id, newStatus)}
            />
          </div>

          <div>
            <p className="text-micro font-semibold uppercase tracking-wide text-text-muted">
              Guidance
            </p>
            <p className="mt-1 text-sm text-text-primary">{control.guidance}</p>
          </div>
          <div>
            <p className="text-micro font-semibold uppercase tracking-wide text-text-muted">
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
            <p className="text-micro font-semibold uppercase tracking-wide text-text-muted">
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
            <p className="mb-1 text-micro font-semibold uppercase tracking-wide text-text-muted">
              Evidence
            </p>
            <EvidenceUploader controlId={control.id} />
          </div>
        </div>
      )}
    </div>
  )
}
