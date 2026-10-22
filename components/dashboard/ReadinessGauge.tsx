'use client'

interface ReadinessGaugeProps {
  percent: number
  size?: number
}

function colorForPercent(pct: number): { stroke: string; text: string } {
  if (pct >= 90) return { stroke: '#1A7A4A', text: 'text-status-ready' } // ai_ready
  if (pct >= 75) return { stroke: '#2D9B6F', text: 'text-status-low' }
  if (pct >= 50) return { stroke: '#D4AC0D', text: 'text-status-moderate' }
  if (pct >= 25) return { stroke: '#E8A020', text: 'text-status-high' }
  return { stroke: '#C0392B', text: 'text-status-critical' }
}

/** SVG circular progress ring showing overall readiness percentage. */
export default function ReadinessGauge({ percent, size = 128 }: ReadinessGaugeProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  const radius = (size - 14) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const { stroke, text } = colorForPercent(clamped)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F0F4F8"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className={`font-bold ${text}`}
          style={{ fontSize: size < 110 ? '1.25rem' : '1.875rem' }}
        >
          {clamped}
        </span>
        {size >= 110 && (
          <span className="text-micro uppercase tracking-wide text-text-muted">/ 100</span>
        )}
      </div>
    </div>
  )
}
