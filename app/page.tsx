import Link from 'next/link'
import { FRAMEWORKS_META } from '@/lib/frameworks-meta'
import { ShieldIcon, ChecklistIcon, ChartIcon, DocumentIcon, LockIcon } from '@/components/icons'

const FEATURES = [
  {
    icon: ShieldIcon,
    title: '13 frameworks covered',
    body: 'Cyber Essentials, ISO 27001, UK GDPR, PCI DSS, AI Governance and more — one applicability engine.',
  },
  {
    icon: ChecklistIcon,
    title: 'Real control tracking',
    body: 'Every control gets a status, notes and evidence — not a checkbox you forget about next quarter.',
  },
  {
    icon: ChartIcon,
    title: 'Readiness you can see',
    body: 'A live readiness score and coverage breakdown across every category, updated as you work.',
  },
  {
    icon: DocumentIcon,
    title: 'Regulator-ready report',
    body: 'Export a PDF evidence pack with your applicability summary, gaps and remediation plan.',
  },
]

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-8">
      {/* Hero */}
      <section className="relative -mx-4 overflow-hidden rounded-card bg-hero-gradient px-4 pt-14 pb-16 sm:-mx-6 sm:px-10">
        <div className="mx-auto max-w-3xl space-y-7 text-center">
          <div className="inline-flex items-center gap-2 rounded-pill border border-brand-navy-light bg-white px-4 py-1.5 text-caption font-medium text-brand-navy shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
            Guidance, not certification
          </div>
          <h1 className="text-display text-text-primary">
            Know exactly which compliance frameworks apply to your business
          </h1>
          <p className="mx-auto max-w-xl text-body text-text-secondary">
            AIro is a compliance and audit readiness platform for UK SMBs and mid-market
            businesses. Answer a short profiling wizard and AIra will work out which of 13
            frameworks — from Cyber Essentials to the EU AI Act — are mandatory, contractual or
            voluntary for you, then help you track real evidence against every control.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              href="/profile"
              className="inline-flex items-center rounded-button bg-brand-navy px-6 py-3 text-body font-semibold text-white shadow-md transition-colors hover:bg-[#162D4A]"
            >
              Start Assessment
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-button border border-border-strong bg-white px-6 py-3 text-body font-medium text-text-primary shadow-sm transition-colors hover:bg-surface-tertiary"
            >
              View dashboard
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 text-caption text-text-muted">
            <LockIcon className="h-4 w-4" />
            Nothing leaves your browser — data stored locally via IndexedDB.
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="flex flex-col gap-3 rounded-card border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-button bg-brand-navy-light text-brand-navy">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-h3 text-text-primary">{f.title}</p>
                <p className="text-caption text-text-secondary">{f.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Framework strip */}
      <section className="rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-h2 text-text-primary">12 frameworks + AI governance, one platform</h2>
          <p className="text-caption text-text-muted">Applicability decided automatically from your profile</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {FRAMEWORKS_META.map((meta) => (
            <span
              key={meta.slug}
              className="inline-flex items-center rounded-pill border border-border bg-surface-secondary px-3 py-1.5 text-caption font-medium text-text-secondary"
            >
              {meta.shortName}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t border-border pt-6 text-center text-caption text-text-muted">
        AIro provides guidance to support your compliance programme. It does not constitute legal
        advice, and does not itself issue certifications — frameworks requiring independent audit
        still require that audit to be carried out separately.
      </footer>
    </div>
  )
}
