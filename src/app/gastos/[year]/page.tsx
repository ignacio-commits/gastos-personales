import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MESES } from '@/types'
import { formatCLP } from '@/lib/utils'
import { cerrarSesion } from '@/app/actions'
import { LogOut } from 'lucide-react'

interface PageProps {
  params: Promise<{ year: string }>
}

export default async function ResumenAnualPage({ params }: PageProps) {
  const { year: yearStr } = await params
  const year = parseInt(yearStr, 10)

  if (isNaN(year)) redirect('/')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const [gastosResult, presupuestosResult] = await Promise.all([
    supabase
      .from('gastos')
      .select('fecha, monto')
      .eq('user_id', user.id)
      .gte('fecha', startDate)
      .lte('fecha', endDate),
    supabase
      .from('presupuestos')
      .select('mes, monto')
      .eq('user_id', user.id)
      .eq('anio', year),
  ])

  const gastos = gastosResult.data ?? []
  const presupuestos = presupuestosResult.data ?? []

  const presupuestoPorMes: { [mes: number]: number } = {}
  presupuestos.forEach((p) => {
    presupuestoPorMes[p.mes] = p.monto
  })

  const mesesData = MESES.map((nombre, index) => {
    const mes = index + 1
    const totalGastado = gastos
      .filter((g) => parseInt(g.fecha.split('-')[1]) === mes)
      .reduce((sum, g) => sum + g.monto, 0)
    const presupuesto = presupuestoPorMes[mes] ?? 950000
    const pct = presupuesto > 0 ? Math.min(Math.round((totalGastado / presupuesto) * 100), 100) : 0
    const disponible = presupuesto - totalGastado

    return { mes, nombre, totalGastado, presupuesto, pct, disponible }
  })

  const totalAnualGastado = mesesData.reduce((sum, m) => sum + m.totalGastado, 0)
  const totalAnualPresupuesto = mesesData.reduce((sum, m) => sum + m.presupuesto, 0)
  const pctAnual = totalAnualPresupuesto > 0
    ? Math.min(Math.round((totalAnualGastado / totalAnualPresupuesto) * 100), 100)
    : 0

  const mesActual = new Date().getMonth() + 1
  const anioActual = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/gastos/${year - 1}`} className="p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-200" />
                <h1 className="text-xl font-bold">{year}</h1>
              </div>
              <Link href={`/gastos/${year + 1}`} className="p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="p-2 rounded-lg hover:bg-blue-600 transition-colors text-blue-200 hover:text-white"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Resumen anual */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="bg-blue-800 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-300">Presupuesto anual</p>
              <p className="text-sm font-bold text-white">{formatCLP(totalAnualPresupuesto)}</p>
            </div>
            <div className="bg-blue-800 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-300">Total gastado</p>
              <p className="text-sm font-bold text-red-300">{formatCLP(totalAnualGastado)}</p>
            </div>
            <div className={`rounded-lg p-2 text-center ${totalAnualGastado <= totalAnualPresupuesto ? 'bg-blue-800' : 'bg-red-800'}`}>
              <p className="text-xs text-blue-300">Disponible</p>
              <p className={`text-sm font-bold ${totalAnualGastado <= totalAnualPresupuesto ? 'text-green-300' : 'text-red-300'}`}>
                {formatCLP(Math.abs(totalAnualPresupuesto - totalAnualGastado))}
              </p>
            </div>
          </div>

          <div className="mt-2">
            <div className="w-full bg-blue-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${pctAnual >= 90 ? 'bg-red-400' : pctAnual >= 70 ? 'bg-yellow-400' : 'bg-green-400'}`}
                style={{ width: `${pctAnual}%` }}
              />
            </div>
            <p className="text-xs text-blue-300 mt-1">{pctAnual}% del presupuesto anual utilizado</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {mesesData.map(({ mes, nombre, totalGastado, presupuesto, pct, disponible }) => {
          const esActual = mes === mesActual && year === anioActual
          const sinGastos = totalGastado === 0

          return (
            <Link
              key={mes}
              href={`/gastos/${year}/${mes}`}
              className={`block bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                esActual ? 'border-blue-300 ring-2 ring-blue-200' : 'border-gray-100'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{nombre}</span>
                    {esActual && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Actual
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {sinGastos ? (
                      <span className="text-xs text-gray-400">Sin gastos</span>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-gray-900">{formatCLP(totalGastado)}</span>
                        <span className="text-xs text-gray-400 ml-1">/ {formatCLP(presupuesto)}</span>
                      </>
                    )}
                  </div>
                </div>

                {!sinGastos && (
                  <>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{pct}% usado</span>
                      <span className={`text-xs font-medium ${disponible >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {disponible >= 0 ? `${formatCLP(disponible)} disponible` : `${formatCLP(Math.abs(disponible))} sobre`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Link>
          )
        })}

        <div className="h-8" />
      </main>
    </div>
  )
}
