import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MESES, type Gasto } from '@/types'
import { formatCLP } from '@/lib/utils'
import NavMeses from '@/components/NavMeses'
import GastoForm from '@/components/GastoForm'
import GastosList from '@/components/GastosList'
import ResumenCategorias from '@/components/ResumenCategorias'
import GraficoDonut from '@/components/GraficoDonut'
import GraficoMetodoPago from '@/components/GraficoMetodoPago'
import PresupuestoEditor from '@/components/PresupuestoEditor'
import GrabarVozForm from '@/components/GrabarVozForm'
import { cerrarSesion } from '@/app/actions'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ year: string; month: string }>
}

export default async function GastosPage({ params }: PageProps) {
  const { year: yearStr, month: monthStr } = await params
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    redirect('/')
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Build date range for the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const [gastosResult, presupuestoResult] = await Promise.all([
    supabase
      .from('gastos')
      .select('*')
      .eq('user_id', user.id)
      .gte('fecha', startDate)
      .lte('fecha', endDate)
      .order('fecha', { ascending: false }),
    supabase
      .from('presupuestos')
      .select('monto')
      .eq('user_id', user.id)
      .eq('mes', month)
      .eq('anio', year)
      .maybeSingle(),
  ])

  const gastos: Gasto[] = gastosResult.data ?? []
  const presupuesto = presupuestoResult.data?.monto ?? 950000

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)
  const disponible = presupuesto - totalGastos
  const pctUsado = presupuesto > 0 ? Math.min(Math.round((totalGastos / presupuesto) * 100), 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <NavMeses year={year} month={month} />
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

          {/* Presupuesto editable */}
          <div className="mt-2">
            <PresupuestoEditor presupuesto={presupuesto} year={year} month={month} />
          </div>

          {/* Barra de progreso */}
          <div className="mt-3">
            <div className="w-full bg-blue-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${pctUsado >= 90 ? 'bg-red-400' : pctUsado >= 70 ? 'bg-yellow-400' : 'bg-green-400'}`}
                style={{ width: `${pctUsado}%` }}
              />
            </div>
            <p className="text-xs text-blue-300 mt-1">{pctUsado}% del presupuesto utilizado</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-1">Presupuesto</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">{formatCLP(presupuesto)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-1">Gastado</p>
            <p className="text-sm font-bold text-red-600 leading-tight">{formatCLP(totalGastos)}</p>
          </div>
          <div className={`rounded-xl p-3 shadow-sm border text-center ${disponible >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <p className="text-xs text-gray-500 mb-1">Disponible</p>
            <p className={`text-sm font-bold leading-tight ${disponible >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {formatCLP(Math.abs(disponible))}
              {disponible < 0 && <span className="text-xs ml-0.5">↑</span>}
            </p>
          </div>
        </div>

        {/* Grabación de voz - Solo en desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 mb-3">🎙️ Agregar gasto por voz</h2>
          <GrabarVozForm mesActual={month} yearActual={year} />
        </div>

        {/* Gastos list section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">
                {MESES[month - 1]} {year}
              </h2>
              <p className="text-xs text-gray-500">{gastos.length} gasto{gastos.length !== 1 ? 's' : ''}</p>
            </div>
            <GastoForm year={year} month={month} />
          </div>
          <div className="px-4 py-2">
            <GastosList gastos={gastos} mesActual={month} />
          </div>
        </div>

        {/* Charts and summary — side by side on larger screens */}
        {gastos.length > 0 && (
          <>
            {/* Donut chart - Categorías */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Distribución por categoría</h2>
              <GraficoDonut gastos={gastos} />
            </div>

            {/* Donut chart - Método de pago */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Distribución por método de pago</h2>
              <GraficoMetodoPago gastos={gastos} />
            </div>

            {/* Category summary */}
            <ResumenCategorias gastos={gastos} />
          </>
        )}

        <div className="h-8" />
      </main>
    </div>
  )
}
