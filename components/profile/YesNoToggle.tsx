'use client'

import { cn } from '@/lib/utils'

interface YesNoToggleProps {
  label: string
  helpText?: string
  value: boolean
  onChange: (value: boolean) => void
}

export default function YesNoToggle({ label, helpText, value, onChange }: YesNoToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-border bg-white p-4">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {helpText && <p className="mt-0.5 text-xs text-text-secondary">{helpText}</p>}
      </div>
      <div className="flex shrink-0 overflow-hidden rounded-button border border-border">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            value ? 'bg-brand-navy text-white' : 'bg-white text-text-secondary hover:bg-surface-tertiary',
          )}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            !value ? 'bg-brand-navy text-white' : 'bg-white text-text-secondary hover:bg-surface-tertiary',
          )}
        >
          No
        </button>
      </div>
    </div>
  )
}
