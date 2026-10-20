'use client'

interface AiraNoteProps {
  text: string
}

/**
 * Small inline card rendering an AIra explanation. Styled per the AIro
 * brand spec: background #E6F7F5 (brand.teal-light), border-left 3px
 * solid #0E9F8E (brand.teal).
 */
export default function AiraNote({ text }: AiraNoteProps) {
  return (
    <div className="flex gap-3 rounded-card border-l-[3px] border-brand-teal bg-brand-teal-light p-4">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-brand-teal shadow-card">
        AI
      </span>
      <p className="text-sm leading-relaxed text-text-primary">{text}</p>
    </div>
  )
}
