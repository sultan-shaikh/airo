'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  HeadcountBand,
  Profile,
  SectorOption,
  TurnoverBand,
} from '@/lib/types'
import { useAppStore } from '@/store/useAppStore'
import StepShell from './StepShell'
import YesNoToggle from './YesNoToggle'

type DraftProfile = Omit<Profile, 'completedAt'>

const SECTOR_OPTIONS: { value: SectorOption; label: string }[] = [
  { value: 'financial_services', label: 'Financial Services' },
  { value: 'healthcare_nhs', label: 'Healthcare / NHS' },
  { value: 'legal', label: 'Legal' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'it_msp_saas', label: 'IT / MSP / SaaS' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'other', label: 'Other' },
]

const HEADCOUNT_OPTIONS: { value: HeadcountBand; label: string }[] = [
  { value: '1-9', label: '1–9 employees' },
  { value: '10-49', label: '10–49 employees' },
  { value: '50-249', label: '50–249 employees' },
  { value: '250+', label: '250+ employees' },
]

const TURNOVER_OPTIONS: { value: TurnoverBand; label: string }[] = [
  { value: 'under_632k', label: 'Under £632k (UK micro-entity threshold)' },
  { value: '632k_10_9m', label: '£632k – £10.9m (UK small company threshold)' },
  { value: '10_9m_36m', label: '£10.9m – £36m (UK medium company threshold)' },
  { value: 'over_36m', label: 'Over £36m' },
]

const DEFAULT_DRAFT: DraftProfile = {
  sector: 'other',
  publicSectorOrRegulatedTender: false,
  handlesCardPayments: false,
  nhsDataOrServicesLink: false,
  fcaRegulated: false,
  providesSaasOrCloudService: false,
  euEeaCustomersOrStaff: false,
  deploysAiSystems: false,
  aiUseCaseNote: '',
  headcountBand: '1-9',
  turnoverBand: 'under_632k',
  companyName: '',
}

const TOTAL_STEPS = 6

export default function ProfileWizard() {
  const router = useRouter()
  const submitProfile = useAppStore((s) => s.submitProfile)
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<DraftProfile>(DEFAULT_DRAFT)
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof DraftProfile>(key: K, value: DraftProfile[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }
  function back() {
    setStep((s) => Math.max(s - 1, 1))
  }

  async function handleFinish() {
    setSubmitting(true)
    const profile: Profile = { ...draft, completedAt: new Date().toISOString() }
    await submitProfile(profile)
    setSubmitting(false)
    router.push('/dashboard')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="mb-2 flex justify-between text-xs font-medium text-text-muted">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-tertiary">
          <div
            className="h-full rounded-full bg-brand-teal transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-card border border-border bg-white p-6 shadow-card">
        {step === 1 && (
          <StepShell
            title="Tell us about your business"
            description="This helps us tailor which compliance frameworks are relevant to you."
          >
            <label className="block text-sm font-medium text-text-primary">
              Company name
              <input
                type="text"
                value={draft.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                placeholder="Acme Ltd"
                className="mt-1 block h-10 w-full rounded-input border border-border px-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              />
            </label>
            <label className="block text-sm font-medium text-text-primary">
              Sector
              <select
                value={draft.sector}
                onChange={(e) => update('sector', e.target.value as SectorOption)}
                className="mt-1 block h-10 w-full rounded-input border border-border px-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              >
                {SECTOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            title="Size of your business"
            description="UK company size bands roughly follow headcount and turnover thresholds."
          >
            <label className="block text-sm font-medium text-text-primary">
              Headcount
              <select
                value={draft.headcountBand}
                onChange={(e) => update('headcountBand', e.target.value as HeadcountBand)}
                className="mt-1 block h-10 w-full rounded-input border border-border px-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              >
                {HEADCOUNT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-text-primary">
              Annual turnover
              <select
                value={draft.turnoverBand}
                onChange={(e) => update('turnoverBand', e.target.value as TurnoverBand)}
                className="mt-1 block h-10 w-full rounded-input border border-border px-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              >
                {TURNOVER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="Market and supply chain exposure">
            <YesNoToggle
              label="Do you bid for public sector or regulated contracts?"
              helpText="These often mandate Cyber Essentials or similar baseline certifications."
              value={draft.publicSectorOrRegulatedTender}
              onChange={(v) => update('publicSectorOrRegulatedTender', v)}
            />
            <YesNoToggle
              label="Do you provide a SaaS or cloud service to customers?"
              helpText="Relevant to NIS Regulations and commonly triggers customer requests for ISO 27001/SOC 2."
              value={draft.providesSaasOrCloudService}
              onChange={(v) => update('providesSaasOrCloudService', v)}
            />
            <YesNoToggle
              label="Do you have EU/EEA-based customers or staff?"
              helpText="Relevant to EU AI Act exposure if you also use AI systems."
              value={draft.euEeaCustomersOrStaff}
              onChange={(v) => update('euEeaCustomersOrStaff', v)}
            />
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="Regulatory touchpoints">
            <YesNoToggle
              label="Do you handle card payments directly?"
              helpText="Storing, processing or transmitting card data brings PCI DSS into scope."
              value={draft.handlesCardPayments}
              onChange={(v) => update('handlesCardPayments', v)}
            />
            <YesNoToggle
              label="Are you FCA-regulated?"
              helpText="Triggers FCA Operational Resilience requirements."
              value={draft.fcaRegulated}
              onChange={(v) => update('fcaRegulated', v)}
            />
            <YesNoToggle
              label="Do you access or support NHS patient data or services?"
              helpText="Triggers the NHS Data Security and Protection Toolkit."
              value={draft.nhsDataOrServicesLink}
              onChange={(v) => update('nhsDataOrServicesLink', v)}
            />
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title="AI systems">
            <YesNoToggle
              label="Do you deploy any AI systems?"
              helpText="This includes AI features inside SaaS tools you use, not just custom-built AI."
              value={draft.deploysAiSystems}
              onChange={(v) => update('deploysAiSystems', v)}
            />
            {draft.deploysAiSystems && (
              <label className="block text-sm font-medium text-text-primary">
                Briefly describe your AI use case (optional)
                <textarea
                  value={draft.aiUseCaseNote}
                  onChange={(e) => update('aiUseCaseNote', e.target.value)}
                  placeholder="e.g. CV screening, chatbot support, fraud detection..."
                  className="mt-1 block w-full rounded-input border border-border p-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
                  rows={3}
                />
              </label>
            )}
          </StepShell>
        )}

        {step === 6 && (
          <StepShell
            title="Ready to see your results"
            description="AIra will now run your answers through the applicability engine and build your dashboard."
          >
            <div className="rounded-card border border-border bg-surface-secondary p-4 text-sm text-text-secondary">
              <p className="font-medium text-text-primary">Summary</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Company: {draft.companyName || 'Not provided'}</li>
                <li>Sector: {SECTOR_OPTIONS.find((o) => o.value === draft.sector)?.label}</li>
                <li>Headcount: {draft.headcountBand}</li>
                <li>Public sector/regulated tenders: {draft.publicSectorOrRegulatedTender ? 'Yes' : 'No'}</li>
                <li>SaaS/cloud service: {draft.providesSaasOrCloudService ? 'Yes' : 'No'}</li>
                <li>EU/EEA customers or staff: {draft.euEeaCustomersOrStaff ? 'Yes' : 'No'}</li>
                <li>Card payments: {draft.handlesCardPayments ? 'Yes' : 'No'}</li>
                <li>FCA regulated: {draft.fcaRegulated ? 'Yes' : 'No'}</li>
                <li>NHS data/services link: {draft.nhsDataOrServicesLink ? 'Yes' : 'No'}</li>
                <li>Deploys AI systems: {draft.deploysAiSystems ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </StepShell>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className="rounded-button border border-brand-navy px-5 py-2.5 text-sm font-medium text-brand-navy disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={next}
            className="rounded-button bg-brand-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-[#162D4A]"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={submitting}
            className="rounded-button bg-brand-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-[#162D4A] disabled:opacity-60"
          >
            {submitting ? 'Building your dashboard...' : 'See my results'}
          </button>
        )}
      </div>
    </div>
  )
}
