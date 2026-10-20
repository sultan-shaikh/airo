import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-navy-light px-4 py-1.5 text-sm font-medium text-brand-navy">
        Guidance, not certification
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
        Know exactly which compliance frameworks apply to your business
      </h1>
      <p className="mx-auto max-w-xl text-lg text-text-secondary">
        AIro is a compliance and audit readiness tool for UK SMBs and mid-market businesses.
        Answer a short profiling wizard and AIra will work out which of 13 frameworks — from
        Cyber Essentials to the EU AI Act — are mandatory, contractual or voluntary for you, then
        help you track real evidence against every control.
      </p>
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center rounded-button bg-brand-navy px-6 py-3 text-base font-medium text-white shadow-card transition-colors hover:bg-[#162D4A]"
        >
          Start Assessment
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-8 text-left sm:grid-cols-3">
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <p className="font-semibold text-text-primary">13 frameworks covered</p>
          <p className="mt-1 text-sm text-text-secondary">
            Cyber Essentials, ISO 27001, UK GDPR, PCI DSS, AI Governance and more.
          </p>
        </div>
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <p className="font-semibold text-text-primary">Nothing leaves your browser</p>
          <p className="mt-1 text-sm text-text-secondary">
            Your answers, evidence and notes are stored locally in your browser via IndexedDB.
          </p>
        </div>
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <p className="font-semibold text-text-primary">Regulator-ready report</p>
          <p className="mt-1 text-sm text-text-secondary">
            Generate a PDF evidence pack with your applicability summary, gaps and remediation plan.
          </p>
        </div>
      </div>
    </div>
  )
}
