'use client'

interface AiraNoteProps {
  text: string
}

/**
 * Small inline card rendering an AIra explanation. Styled per the AIro
 * brand spec: background #E6F7F5 (brand.teal-light), border-left 3px
 * solid #0E9F8E (brand.teal), with the AIra hexagon avatar glyph.
 */
export default function AiraNote({ text }: AiraNoteProps) {
  return (
    <div className="flex gap-3 rounded-card border-l-[3px] border-brand-teal bg-brand-teal-light p-4 shadow-sm">
      <svg viewBox="0 0 40 40" className="mt-0.5 h-8 w-8 shrink-0 drop-shadow-sm">
        <path d="M20 2L35.588 11V29L20 38L4.412 29V11L20 2Z" fill="#FFFFFF" />
        <path d="M20 2L35.588 11V29L20 38L4.412 29V11L20 2Z" fill="#0E9F8E" opacity="0.15" />
        <path
          d="M20 2L35.588 11V29L20 38L4.412 29V11L20 2Z"
          stroke="#0E9F8E"
          strokeWidth="1.5"
          fill="none"
        />
        <text x="20" y="24" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0E9F8E">
          AI
        </text>
      </svg>
      <div className="min-w-0">
        <p className="text-micro font-semibold uppercase tracking-wide text-brand-teal">AIra</p>
        <p className="mt-0.5 text-sm leading-relaxed text-text-primary">{text}</p>
      </div>
    </div>
  )
}
