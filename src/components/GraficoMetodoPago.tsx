'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { type Gasto } from '@/types'
import { formatCLP } from '@/lib/utils'

interface GraficoMetodoPagoProps {
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

const COLORES = {
  'Transferencia': '#3b82f6',      // Azul
  'Efectivo': '#10b981',            // Verde
  'Banco de Chile': '#f59e0b',      // Ámbar
  'Rappicard': '#8b5cf6',           // Púrpura
  'Falabella': '#ef4444',           // Rojo
}

export default function GraficoMetodoPago({ gastos }: GraficoMetodoPagoProps) {
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)

  // Agrupar gastos por método de pago o tarjeta
  const agrupado: { [key: string]: number } = {}

  gastos.forEach((gasto) => {
    let clave: string
    if (gasto.metodo_pago === 'Tarjeta' && gasto.tarjeta) {
      clave = gasto.tarjeta
    } else {
      clave = gasto.metodo_pago
    }

    agrupado[clave] = (agrupado[clave] || 0) + gasto.monto
  })

  const data = Object.entries(agrupado)
    .map(([nombre, total]) => {
      const percentage = totalGastos > 0 ? Math.round((total / totalGastos) * 100) : 0
      return {
        name: nombre,
        value: total,
        color: COLORES[nombre as keyof typeof COLORES] || '#6b7280',
        percentage,
      }
    })
    .sort((a, b) => b.value - a.value)

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
