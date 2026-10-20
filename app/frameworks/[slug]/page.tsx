import { FRAMEWORKS_META } from '@/lib/frameworks-meta'
import FrameworkWorkspace from './FrameworkWorkspace'

// Required for `output: 'export'` static builds: this pre-renders all 13
// known framework slugs at build time, since there is no server available
// at runtime to resolve the dynamic [slug] segment on demand.
export function generateStaticParams() {
  return FRAMEWORKS_META.map((meta) => ({ slug: meta.slug }))
}

export default function FrameworkPage({ params }: { params: { slug: string } }) {
  return <FrameworkWorkspace slug={params.slug} />
}
