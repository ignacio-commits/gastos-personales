import { type Gasto, CATEGORIAS } from '@/types'
import { formatCLP } from '@/lib/utils'

interface ResumenCategoriasProps {
  gastos: Gasto[]
}

export default function ResumenCategorias({ gastos }: ResumenCategoriasProps) {
  const totalesPorCategoria = CATEGORIAS.map((cat) => {
    const total = gastos
      .filter((g) => g.categoria === cat.nombre)
      .reduce((sum, g) => sum + g.monto, 0)
    return { ...cat, total }
  }).filter((c) => c.total > 0)

  if (totalesPorCategoria.length === 0) {
    return null
  }

  const grandTotal = totalesPorCategoria.reduce((sum, c) => sum + c.total, 0)

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Resumen por categoría
        </h2>
      </div>
      <div className="divide-y divide-gray-800">
        {totalesPorCategoria.map((cat) => {
          const pct = grandTotal > 0 ? Math.round((cat.total / grandTotal) * 100) : 0
          return (
            <div key={cat.nombre} className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg w-7 text-center">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-200 truncate">{cat.nombre}</span>
                  <span className="text-sm font-semibold text-white ml-2 flex-shrink-0">
                    {formatCLP(cat.total)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">{pct}%</span>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-3 border-t border-gray-700 flex justify-between">
        <span className="text-sm font-semibold text-gray-300">Total</span>
        <span className="text-sm font-bold text-white">{formatCLP(grandTotal)}</span>
      </div>
    </div>
  )
}
