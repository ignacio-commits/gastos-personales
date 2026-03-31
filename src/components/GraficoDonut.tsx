'use client'

import { useState, useEffect } from 'react'
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
  const [windowWidth, setWindowWidth] = useState<number>(1024)

  useEffect(() => {
    setWindowWidth(window.innerWidth)

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Responsive configuration based on screen size
  const isMobile = windowWidth < 640
  const isTablet = windowWidth >= 640 && windowWidth < 1024

  const config = {
    mobile: { height: 420, innerRadius: 45, outerRadius: 85, cy: '48%' },
    tablet: { height: 340, innerRadius: 60, outerRadius: 100, cy: '45%' },
    desktop: { height: 320, innerRadius: 70, outerRadius: 110, cy: '45%' },
  }

  const currentConfig = isMobile ? config.mobile : isTablet ? config.tablet : config.desktop
  const legendLayout = isMobile ? 'horizontal' : 'vertical'
  const legendAlign = isMobile ? 'center' : 'right'
  const legendVerticalAlign = isMobile ? 'bottom' : 'middle'

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
    <ResponsiveContainer width="100%" height={currentConfig.height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy={currentConfig.cy}
          innerRadius={currentConfig.innerRadius}
          outerRadius={currentConfig.outerRadius}
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
          layout={legendLayout}
          align={legendAlign}
          verticalAlign={legendVerticalAlign}
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className={isMobile ? 'text-xs text-gray-600' : 'text-xs text-gray-600'}>
              {value}
            </span>
          )}
          wrapperStyle={isMobile ? { paddingTop: '16px' } : {}}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
