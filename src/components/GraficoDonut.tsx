'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from 'recharts'
import { type Gasto, CATEGORIAS } from '@/types'
import { formatCLP } from '@/lib/utils'

interface GraficoDonutProps {
  gastos: Gasto[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { color: string } }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-gray-700">{item.name}</p>
        <p className="text-sm font-bold text-gray-900">{formatCLP(item.value)}</p>
      </div>
    )
  }
  return null
}

function renderCustomLabel(entry: any) {
  return `${entry.payload.percentage}%`
}

export default function GraficoDonut({ gastos }: GraficoDonutProps) {
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)

  const data = CATEGORIAS.map((cat) => {
    const total = gastos
      .filter((g) => g.categoria === cat.nombre)
      .reduce((sum, g) => sum + g.monto, 0)
    const percentage = totalGastos > 0 ? Math.round((total / totalGastos) * 100) : 0
    return {
      name: `${cat.icon} ${cat.nombre}`,
      value: total,
      color: cat.color,
      percentage,
    }
  }).filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sin datos para mostrar
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={2}
          dataKey="value"
          label={renderCustomLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-gray-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
