'use client'

import { ChecklistIcon, ChartIcon, AlertIcon, LayersIcon } from '@/components/icons'

interface ProgressStatsProps {
  totalModules: number
  applicableModules: number
  totalControls: number
  implementedControls: number
  inProgressControls?: number
  notStartedControls?: number
}

export default function ProgressStats({
  totalModules,
  applicableModules,
  totalControls,
  implementedControls,
  inProgressControls = 0,
  notStartedControls = 0,
}: ProgressStatsProps) {
  const stats = [
    {
      label: 'Applicable modules',
      value: `${applicableModules} / ${totalModules}`,
      icon: LayersIcon,
      tone: 'text-brand-navy bg-brand-navy-light',
    },
    {
      label: 'Controls implemented',
      value: `${implementedControls}`,
      sub: `of ${totalControls} total`,
      icon: ChecklistIcon,
      tone: 'text-status-ready bg-status-ready-bg',
    },
    {
      label: 'In progress',
      value: `${inProgressControls}`,
      sub: 'controls underway',
      icon: ChartIcon,
      tone: 'text-status-moderate bg-status-moderate-bg',
    },
    {
      label: 'Not started',
      value: `${notStartedControls}`,
      sub: 'controls outstanding',
      icon: AlertIcon,
      tone: 'text-status-critical bg-status-critical-bg',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex items-start gap-3 rounded-card border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-button ${stat.tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-caption text-text-secondary">{stat.label}</p>
              <p className="mt-0.5 text-h2 text-text-primary">{stat.value}</p>
              {stat.sub && <p className="text-micro text-text-muted">{stat.sub}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
