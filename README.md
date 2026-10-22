# AIro Compliance — Audit Readiness Demo

AIro is a UK SMB / mid-market compliance and audit readiness tool. You answer a short
profiling wizard, and AIra (the AIro AI persona) explains — in plain English — which of
13 compliance frameworks apply to your business, then helps you track real control
status and evidence against each one, ending in a downloadable PDF evidence pack.

**This build has no backend.** There is no server, no API routes, no database, no
authentication and no environment variables. Everything — your profile answers,
applicability verdicts, control statuses, notes and evidence files — is stored
entirely in your browser via IndexedDB. Close the tab and come back later on the same
browser/device and your data is still there. Nothing is ever sent to a server.

## What's fully built

- The applicability decision tree (`lib/decision-tree.ts`) — a deterministic, pure
  function covering all 13 modules.
- A genuinely deep control library (`lib/controls.ts`) for 5 of the 13 frameworks
  (Cyber Essentials, ISO/IEC 27001, UK GDPR, PCI DSS, AI Governance), with real
  standard-aligned control topics, guidance text and evidence examples per control.
- A hand-rolled IndexedDB wrapper (`lib/db.ts`) — no external storage package.
- The full profiling wizard, dashboard, per-framework control workspace (with
  status, notes and evidence upload), and PDF report generation via jsPDF.
- AIra's explanatory text (`lib/aira.ts`) — template-driven plain-English
  explanations of verdicts and controls, **not** a live AI API call.

## What's intentionally lighter-depth (and clearly marked)

The remaining 7 frameworks — NIS Regulations, FCA Operational Resilience, NHS DSPT,
SOC 2, ISO 22301, ISO/IEC 27701, ISO/IEC 20000-1 — have a smaller set of ~8–12 real,
correctly-themed controls each, rather than the full depth given to the five above.
Every control from these frameworks is tagged `lightDepth: true` in
`lib/controls.ts` so they're easy to find and extend later. This is noted in-app too:
the AIra note on a lightDepth control says so explicitly, it's never silently
presented as complete.

## Shared controls

Several controls (MFA, patch management, backups, incident response, access reviews,
encryption, supplier due diligence, awareness training, asset inventory, logging,
business continuity, vendor contracts/DPAs) are tagged with **multiple**
`frameworkSlugs` in `lib/controls.ts`. They appear once in the library but show up in
every relevant framework's workspace, with a "Shared across: ..." badge — updating
the status/evidence on one instance updates it everywhere it's used.

## AI Discovery & Monitoring

A second, distinct AI-related capability alongside the AI Governance control module
(`lib/controls.ts`'s `ai-governance` framework): instead of a one-off static control
checklist, this is a workspace (`app/ai-monitor`) for logging the AI tools your
business actually uses, scoring each one's risk with a deterministic rules engine
(`lib/ai-risk-engine.ts`), tracking mitigations against each finding, and re-checking
a tool's score on demand as its attributes or your mitigations change.

- **Inventory** — add/edit AI tools (name, vendor, deployment type, data types
  handled, customer-facing/internal-only flags).
- **Risk findings** — `scoreTool()` runs a fixed set of commented rules (data
  leakage, shadow use, oversight gaps, prompt injection exposure, vendor/supply
  chain risk, logging gaps) against each tool, exactly as deterministically as the
  applicability decision tree — AIra only explains the result afterwards via
  `explainAiRisk()`, she never decides it.
- **Mitigations** — `defaultMitigationsFor()` proposes 1-2 mitigations per finding.
  Where a good match exists in the existing `ai-governance` control library, the
  mitigation links `controlRefId` back to that control so its status/evidence is
  tracked once, not duplicated. A simple before/after residual-risk count shows how
  many findings, by severity, remain once their mitigations are all implemented.

This reuses the same control library, IndexedDB conventions and AIra voice as the
rest of the app — it adds three new IndexedDB stores (`aiTools`, `aiRiskFindings`,
`aiMitigations`) rather than a parallel storage mechanism.

**Honest scope note:** this is a *manual, self-reported* inventory with periodic
re-scoring on request ("Re-check"), not automated or continuous monitoring. A real
"shadow AI" detection capability would need to observe actual network/browser
traffic or SaaS admin logs to find tools nobody told you about — that kind of
passive, automated discovery is explicitly **out of scope** for this client-side
demo, which has no backend and no access to that kind of telemetry. What's built
here is the honest MVP version of "monitoring": you tell AIro what you use, it
scores the risk and tracks whether you've done anything about it, and you (or a
scheduled reminder outside this app) decide when to come back and re-check.

## Simulated demo workspace path (`/login` → `/connect` → `/dashboard`)

For sales/VP demos, there's a second entry point alongside the real profile wizard:
`/login` lets you pick one of five fictional UK SMB personas (`lib/demo-tenants.ts`),
then `/connect` shows a consent screen styled like a real Microsoft/Google OAuth
"Accept access" screen, then you land on a fully populated `/dashboard`.

**This is explicitly NOT real OAuth.** There is no handshake, no redirect to an
actual identity provider, no token, and no credential of any kind is requested,
created or stored. `/connect`'s "Accept" button runs a client-side `setTimeout`
sequence for visual effect, then calls `useAppStore.seedFromDemoTenant()`, which
writes the chosen persona's pre-built `Profile` and a set of `ControlState`s derived
from a static `IntegrationFixture` object into the same IndexedDB store the real app
already uses — no new storage mechanism, no network call, same architecture as
everywhere else in this codebase. The "logo" on the consent screen is an original,
generic abstract mark (`SsoProviderMark` in `components/icons.tsx`), not a
reproduction of Microsoft's or Google's actual logo.

Because this could otherwise be mistaken for a live customer's real connected
environment, a small **"Demo Mode — simulated data"** pill is shown on the consent
screen, in the dashboard's integrations panel, and next to the company name in the
nav bar whenever a demo workspace is active — this should never be removed or hidden
when the app is shown to anyone outside the company without that disclosure being
clearly visible.

**If this becomes the real product**, real OAuth would need to be built to replace
this path entirely: Microsoft Graph (delegated admin consent, `Policy.Read.All`,
`Device.Read.All`, `RoleManagement.Read.Directory` or similar scopes) for Microsoft
365, and the Google Admin SDK (Reports API / Directory API with a domain-wide
delegated service account) for Google Workspace — both requiring a backend to hold
and refresh tokens server-side, which this client-side build does not have.

## "Guidance, not certification"

AIro is explicit, in the UI and in the generated PDF, that it provides guidance to
support your compliance programme — it is not a certification body, and frameworks
requiring an independent third-party audit (Cyber Essentials Plus, ISO/IEC 27001,
ISO 22301, SOC 2) still require that audit to be carried out separately before any
certification or attestation can be claimed.

## Running locally

```
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Deploying to Netlify

This app uses `output: 'export'` in `next.config.js`, which builds a fully static
site into the `out/` directory — no serverless functions, no Next.js runtime plugin
needed on Netlify.

1. Push this repository to GitHub.
2. In Netlify, click "Add new site" → "Import an existing project" and connect the
   GitHub repo.
3. Netlify will read `netlify.toml` automatically: build command `npm run build`,
   publish directory `out`. No environment variables are required.
4. Deploy. Every push to your main branch will auto-deploy.

## Project structure

- `lib/types.ts` — shared TypeScript types.
- `lib/decision-tree.ts` — the deterministic applicability engine.
- `lib/controls.ts` — the control library (see depth notes above).
- `lib/frameworks-meta.ts` — metadata for all 13 modules.
- `lib/db.ts` — hand-rolled IndexedDB wrapper.
- `lib/pdf.ts` — jsPDF-based report generator.
- `lib/aira.ts` — AIra's static, template-driven explanatory text.
- `lib/ai-inventory-types.ts` / `lib/ai-risk-engine.ts` — AI Discovery & Monitoring
  types and the deterministic risk-scoring rules engine (see above).
- `lib/demo-tenants.ts` / `lib/demo-control-mapping.ts` — fixture data and mapping
  logic for the simulated demo-workspace path (see above). Not used by the real
  profile wizard flow.
- `store/useAppStore.ts` — Zustand store wiring the above together with persistence.
- `app/` — Next.js App Router pages (landing, profile wizard, dashboard, per-framework
  workspace, AI Discovery & Monitoring workspace, report, demo `login`/`connect`).
- `components/` — UI components grouped by feature area.

## Known limitations / follow-ups

- The decision tree uses simplified sector groupings (e.g. "IT/MSP/SaaS" as the sole
  NIS-Regulations-adjacent sector) — a production version would want a more granular
  sector taxonomy and should be reviewed against current NIS/DSIT scoping guidance.
- PDF evidence index lists filenames only, by design — it does not embed the
  underlying evidence files (which remain in IndexedDB only).
- IndexedDB storage is per-browser, per-device. There is no sync or backup mechanism
  across devices in this build — that would require a backend, which is explicitly
  out of scope here.
