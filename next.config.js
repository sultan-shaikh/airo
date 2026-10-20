/** @type {import('next').NextConfig} */
// We use `output: 'export'` because this app has no backend, no API routes,
// and no server-only data fetching — every page is either static or a
// client component reading/writing IndexedDB in the browser. A fully static
// export means Netlify can serve this as plain static files (publish dir
// `out`), with zero serverless/edge functions and zero env vars required.
// The dynamic route app/frameworks/[slug]/page.tsx supplies
// generateStaticParams() so all 13 framework pages are pre-rendered at
// build time, which is required for static export to work with a dynamic
// segment.
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
}

module.exports = nextConfig
