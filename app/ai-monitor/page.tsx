import AiMonitorWorkspace from './AiMonitorWorkspace'

// Unlike /frameworks/[slug], this route has no dynamic segment, so there's
// no generateStaticParams needed for the `output: 'export'` static build —
// it's just a single static page.
export default function AiMonitorPage() {
  return <AiMonitorWorkspace />
}
