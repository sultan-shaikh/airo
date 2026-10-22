'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/ai-monitor', label: 'AI Discovery & Monitoring' },
  { href: '/report', label: 'Report' },
]

export default function NavBar() {
  const pathname = usePathname()
  const profile = useAppStore((s) => s.profile)

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <svg viewBox="0 0 40 40" className="h-8 w-8">
              <path
                d="M20 2L35.588 11V29L20 38L4.412 29V11L20 2Z"
                fill="#0E9F8E"
                opacity="0.15"
              />
              <path
                d="M20 2L35.588 11V29L20 38L4.412 29V11L20 2Z"
                stroke="#0E9F8E"
                strokeWidth="1.5"
                fill="none"
              />
              <text
                x="20"
                y="24"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#1E3A5F"
              >
                AI
              </text>
            </svg>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-h3 text-text-primary">AIro</span>
            <span className="text-micro uppercase text-text-muted">Compliance Platform</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname?.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-button px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-navy-light text-brand-navy'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
      {profile && (
        <div className="border-t border-border bg-surface-secondary">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-micro text-text-muted sm:px-6">
            <span className="truncate uppercase tracking-wide">
              {profile.companyName || 'Unnamed company'}
            </span>
            <span className="truncate uppercase tracking-wide">
              {profile.sector.replace(/_/g, ' ')} · {profile.headcountBand} employees
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
