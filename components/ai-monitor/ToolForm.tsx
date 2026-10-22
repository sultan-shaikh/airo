'use client'

import { useState } from 'react'
import { AiTool, AiToolDeploymentType } from '@/lib/ai-inventory-types'
import YesNoToggle from '@/components/profile/YesNoToggle'

const DEPLOYMENT_OPTIONS: { value: AiToolDeploymentType; label: string }[] = [
  { value: 'saas_api', label: 'Standalone SaaS tool / API' },
  { value: 'embedded_in_other_saas', label: 'Embedded feature inside another SaaS product' },
  { value: 'custom_model', label: 'Custom/self-hosted model' },
  { value: 'browser_extension', label: 'Browser extension' },
]

export interface ToolFormValues {
  name: string
  vendor: string
  deploymentType: AiToolDeploymentType
  dataTypesHandled: string[]
  customerFacing: boolean
  internalOnly: boolean
}

interface ToolFormProps {
  initial?: AiTool
  onSubmit: (values: ToolFormValues) => Promise<void> | void
  onCancel?: () => void
}

/**
 * Add/edit form for a single AI tool in the inventory. Submitting re-runs
 * the deterministic risk engine (handled by the caller via the store's
 * addAiTool/updateAiTool + rescoreAiTool actions) — this component only
 * collects the tool's attributes.
 */
export default function ToolForm({ initial, onSubmit, onCancel }: ToolFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [vendor, setVendor] = useState(initial?.vendor ?? '')
  const [deploymentType, setDeploymentType] = useState<AiToolDeploymentType>(
    initial?.deploymentType ?? 'saas_api',
  )
  const [dataTypesText, setDataTypesText] = useState(initial?.dataTypesHandled.join(', ') ?? '')
  const [customerFacing, setCustomerFacing] = useState(initial?.customerFacing ?? false)
  const [internalOnly, setInternalOnly] = useState(initial?.internalOnly ?? false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        vendor: vendor.trim(),
        deploymentType,
        dataTypesHandled: dataTypesText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        customerFacing,
        internalOnly,
      })
      if (!initial) {
        setName('')
        setVendor('')
        setDeploymentType('saas_api')
        setDataTypesText('')
        setCustomerFacing(false)
        setInternalOnly(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div
        className="absolute inset-0 bg-text-primary/30 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-l border-border bg-white p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-h2 text-text-primary">{initial ? 'Edit AI tool' : 'Add AI tool'}</h3>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-button px-2 py-1 text-sm text-text-muted hover:bg-surface-tertiary hover:text-text-primary"
            >
              ✕
            </button>
          )}
        </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">Tool name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. ChatGPT Team, Grammarly, an in-house chatbot"
            required
            className="mt-1 w-full rounded-input border border-border p-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">Vendor</label>
          <input
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. OpenAI, Grammarly Inc."
            className="mt-1 w-full rounded-input border border-border p-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">Deployment type</label>
        <select
          value={deploymentType}
          onChange={(e) => setDeploymentType(e.target.value as AiToolDeploymentType)}
          className="mt-1 w-full rounded-input border border-border bg-white p-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
        >
          {DEPLOYMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Data types handled
        </label>
        <input
          value={dataTypesText}
          onChange={(e) => setDataTypesText(e.target.value)}
          placeholder="e.g. customer PII, source code, financial data"
          className="mt-1 w-full rounded-input border border-border p-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
        />
        <p className="mt-1 text-xs text-text-muted">Comma-separated free text tags.</p>
      </div>

      <YesNoToggle
        label="Is this tool customer-facing?"
        helpText="Customers or members of the public interact with it directly, or it influences a decision about them."
        value={customerFacing}
        onChange={setCustomerFacing}
      />
      <YesNoToggle
        label="Is this tool internal-only?"
        helpText="Used only by staff, with no customer-facing surface at all."
        value={internalOnly}
        onChange={setInternalOnly}
      />

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-button bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#162D4A] disabled:opacity-60"
        >
          {initial ? 'Save changes' : 'Add tool'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-button border border-brand-navy px-4 py-2 text-sm font-medium text-brand-navy hover:bg-brand-navy-light"
          >
            Cancel
          </button>
        )}
        </div>
      </form>
    </div>
  )
}
