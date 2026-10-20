import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/layout/NavBar'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'AIro — Compliance & Audit Readiness',
  description:
    'AIro helps UK SMBs and mid-market businesses understand which compliance frameworks apply to them and track their audit readiness — fully client-side, no account required.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-surface-secondary text-text-primary`}>
        <NavBar />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  )
}
