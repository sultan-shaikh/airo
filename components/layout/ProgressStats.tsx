'use client'

interface ProgressStatsProps {
  totalModules: number
  applicableModules: number
  totalControls: number
  implementedControls: number
}

export default function ProgressStats({
  totalModules,
  applicableModules,
  totalControls,
  implementedControls,
}: ProgressStatsProps) {
  const pct = totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0

  const stats = [
    { label: 'Applicable modules', value: `${applicableModules} / ${totalModules}` },
    { label: 'Controls implemented', value: `${implementedControls} / ${totalControls}` },
    { label: 'Overall readiness', value: `${pct}%` },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-card border border-border bg-white p-5 shadow-card"
        >
          <p className="text-sm text-text-secondary">{stat.label}</p>
          <p className="mt-1 text-2xl font-semibold text-brand-navy">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
