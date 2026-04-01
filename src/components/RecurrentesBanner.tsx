'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, X, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { agregarRecurrentesMes } from '@/app/actions'
import { type Gasto } from '@/types'
import { formatCLP } from '@/lib/utils'

interface RecurrentesBannerProps {
  recurrentesPrevMes: Gasto[]
  year: number
  month: number
}

export default function RecurrentesBanner({ recurrentesPrevMes, year, month }: RecurrentesBannerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cerrado, setCerrado] = useState(false)
  const [exito, setExito] = useState('')

  if (cerrado || recurrentesPrevMes.length === 0) return null

  const handleAgregar = () => {
    startTransition(async () => {
      const result = await agregarRecurrentesMes(year, month)
      if (result.success) {
        setExito(`✅ ${result.count} gasto(s) recurrente(s) agregados`)
        setTimeout(() => {
          router.refresh()
          setCerrado(true)
        }, 1500)
      }
    })
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Tienes {recurrentesPrevMes.length} gasto{recurrentesPrevMes.length !== 1 ? 's' : ''} recurrente{recurrentesPrevMes.length !== 1 ? 's' : ''} del mes anterior
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              {recurrentesPrevMes.map((g) => g.concepto).join(', ')}
            </p>
          </div>
        </div>
        <button onClick={() => setCerrado(true)} className="text-blue-400 hover:text-blue-600 flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      {exito ? (
        <p className="text-sm text-green-700 mt-3">{exito}</p>
      ) : (
        <Button
          onClick={handleAgregar}
          disabled={isPending}
          size="sm"
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? (
            <><Loader className="h-3.5 w-3.5 mr-2 animate-spin" />Agregando...</>
          ) : (
            <><RefreshCw className="h-3.5 w-3.5 mr-2" />Agregar todos al mes actual</>
          )}
        </Button>
      )}
    </div>
  )
}
