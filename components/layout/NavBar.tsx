'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/ai-monitor', label: 'AI Discovery & Monitoring' },
  { href: '/report', label: 'Report' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-sm font-bold text-white">
            AI
          </span>
          <span className="text-lg font-semibold text-text-primary">AIro</span>
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
    </header>
  )
}
