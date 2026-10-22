// Hand-drawn line icons used across the app. Kept dependency-free (no icon
// library) — plain inline SVG, stroke-based, 1.5px stroke to match the
// AIro design system's understated, professional feel.

interface IconProps {
  className?: string
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <path
        d="M12 3l7 3v5.5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChecklistIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 8.5l1.3 1.3L11.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8.5h5.2" strokeLinecap="round" />
      <path d="M8 14.5l1.3 1.3L11.5 13.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 14.5h5.2" strokeLinecap="round" />
    </svg>
  )
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <path d="M4 20V10" strokeLinecap="round" />
      <path d="M10 20V4" strokeLinecap="round" />
      <path d="M16 20v-7" strokeLinecap="round" />
      <path d="M20 20V8.5" strokeLinecap="round" />
      <path d="M3 20.5h18" strokeLinecap="round" />
    </svg>
  )
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <path d="M7 3.5h7l4 4V20a1 1 0 01-1 1H7a1 1 0 01-1-1V4.5a1 1 0 011-1z" strokeLinejoin="round" />
      <path d="M14 3.5V7.5h4" strokeLinejoin="round" />
      <path d="M9 12h6M9 15h6M9 18h3.5" strokeLinecap="round" />
    </svg>
  )
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 118 0v2.5" strokeLinecap="round" />
      <circle cx="12" cy="15.3" r="1.3" />
    </svg>
  )
}

export function RobotIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="9" width="14" height="10" rx="2.5" />
      <path d="M12 9V5.5" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1.2" />
      <path d="M9 13.2h.01M15 13.2h.01" strokeLinecap="round" strokeWidth="2.4" />
      <path d="M9 16.5h6" strokeLinecap="round" />
      <path d="M3 12.5h2M19 12.5h2" strokeLinecap="round" />
    </svg>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3.5l9 16h-18l9-16z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function LayersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3.5l8 4.3-8 4.3-8-4.3 8-4.3z" strokeLinejoin="round" />
      <path d="M4 12.1l8 4.3 8-4.3" strokeLinejoin="round" />
      <path d="M4 16.3l8 4.3 8-4.3" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronIcon({ className, open }: IconProps & { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${className ?? ''}`}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlugIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <path d="M9 2.5v4M15 2.5v4" strokeLinecap="round" />
      <path d="M6.5 6.5h11v4a5.5 5.5 0 01-11 0v-4z" strokeLinejoin="round" />
      <path d="M12 16v3.5" strokeLinecap="round" />
      <path d="M9 19.5h6" strokeLinecap="round" />
    </svg>
  )
}

export function SyncIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <path d="M4.5 12a7.5 7.5 0 0113-5" strokeLinecap="round" />
      <path d="M17.5 3.8V7h-3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 12a7.5 7.5 0 01-13 5" strokeLinecap="round" />
      <path d="M6.5 20.2V17h3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Neutral, original abstract mark used to represent "a connected identity
 * provider" on the demo /connect screen and IntegrationsPanel — deliberately
 * NOT a reproduction of any real vendor's logo. */
export function SsoProviderMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="9" height="9" rx="1.5" fill="currentColor" opacity="0.85" />
      <rect x="13" y="2" width="9" height="9" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="2" y="13" width="9" height="9" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="13" y="13" width="9" height="9" rx="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function PaperclipIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <path
        d="M8 12.5l6.3-6.3a3 3 0 114.2 4.2L11 18a4.5 4.5 0 11-6.4-6.4l6.6-6.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
