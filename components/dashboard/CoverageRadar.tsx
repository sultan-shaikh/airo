'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export interface CoverageDatum {
  category: string
  shortLabel: string
  percent: number
}

interface CoverageRadarProps {
  data: CoverageDatum[]
}

export default function CoverageRadar({ data }: CoverageRadarProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis
            dataKey="shortLabel"
            tick={{ fill: '#64748B', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#94A3B8', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Coverage"
            dataKey="percent"
            stroke="#0E9F8E"
            fill="#1E3A5F"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Implemented']}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              fontSize: 12,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
