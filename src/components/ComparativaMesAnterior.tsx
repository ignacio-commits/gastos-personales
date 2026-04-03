'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { type Gasto, CATEGORIAS, MESES } from '@/types'
import { formatCLP } from '@/lib/utils'

interface ComparativaMesAnteriorProps {
  mesActual: number
  gastosMesActual: Gasto[]
  gastosMesAnterior: Gasto[]
}

function getCategoriaConfig(nombre: string) {
  return CATEGORIAS.find((c) => c.nombre === nombre) ?? CATEGORIAS[CATEGORIAS.length - 1]
}

export default function ComparativaMesAnterior({
  mesActual,
  gastosMesActual,
  gastosMesAnterior,
}: ComparativaMesAnteriorProps) {
  const totalActual = gastosMesActual.reduce((sum, g) => sum + g.monto, 0)
  const totalAnterior = gastosMesAnterior.reduce((sum, g) => sum + g.monto, 0)

  if (totalAnterior === 0 && totalActual === 0) {
    return null
  }

  const diferencia = totalActual - totalAnterior
  const pctDiferencia =
    totalAnterior === 0 ? (totalActual > 0 ? 100 : 0) : Math.round((diferencia / totalAnterior) * 100)

  // Agrupar gastos por categoría
  const gastosPorCategoria: { [key: string]: { actual: number; anterior: number } } = {}

  CATEGORIAS.forEach((cat) => {
    const actualCat = gastosMesActual
      .filter((g) => g.categoria === cat.nombre)
      .reduce((sum, g) => sum + g.monto, 0)
    const anteriorCat = gastosMesAnterior
      .filter((g) => g.categoria === cat.nombre)
      .reduce((sum, g) => sum + g.monto, 0)
    if (actualCat > 0 || anteriorCat > 0) {
      gastosPorCategoria[cat.nombre] = { actual: actualCat, anterior: anteriorCat }
    }
  })

  const mesAnterior = mesActual === 1 ? 12 : mesActual - 1

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        📊 Comparativa con {MESES[mesAnterior - 1]}
      </h2>

      {/* Total comparison */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500">Total gasto este mes</p>
            <p className="text-lg font-bold text-gray-900">{formatCLP(totalActual)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">vs mes anterior</p>
            <p className="text-lg font-bold text-gray-900">{formatCLP(totalAnterior)}</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 text-sm font-semibold ${
            pctDiferencia > 0 ? 'text-red-600' : pctDiferencia < 0 ? 'text-green-600' : 'text-gray-600'
          }`}
        >
          {pctDiferencia > 0 ? (
            <>
              <TrendingUp className="h-4 w-4" />
              +{pctDiferencia}% ({formatCLP(diferencia)})
            </>
          ) : pctDiferencia < 0 ? (
            <>
              <TrendingDown className="h-4 w-4" />
              {pctDiferencia}% ({formatCLP(diferencia)})
            </>
          ) : (
            <>
              <Minus className="h-4 w-4" />
              Sin cambios
            </>
          )}
        </div>
      </div>

      {/* Por categoría */}
      {Object.keys(gastosPorCategoria).length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Por categoría</p>
          <div className="space-y-2">
            {Object.entries(gastosPorCategoria).map(([categoria, { actual, anterior }]) => {
              const cat = getCategoriaConfig(categoria)
              const diff = actual - anterior
              const pct = anterior === 0 ? (actual > 0 ? 100 : 0) : Math.round((diff / anterior) * 100)

              return (
                <div key={categoria} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                  <div className="flex items-center gap-2 flex-1">
                    <span>{cat.icon}</span>
                    <span className="text-gray-700 font-medium">{categoria}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatCLP(actual)}</p>
                      <p className="text-xs text-gray-400">{formatCLP(anterior)}</p>
                    </div>
                    <div
                      className={`text-xs font-semibold w-12 text-right ${
                        pct > 0 ? 'text-red-600' : pct < 0 ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {pct > 0 ? '+' : ''}{pct}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
