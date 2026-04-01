'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type Gasto, CATEGORIAS } from '@/types'
import { formatCLP } from '@/lib/utils'
import { eliminarGasto } from '@/app/actions'
import EditGastoForm from './EditGastoForm'
import DuplicateGastoForm from './DuplicateGastoForm'

interface GastosListProps {
  gastos: Gasto[]
  mesActual: number
}

function getCategoriaConfig(nombre: string) {
  return CATEGORIAS.find((c) => c.nombre === nombre) ?? CATEGORIAS[CATEGORIAS.length - 1]
}

function formatFecha(fecha: string): string {
  const [year, month, day] = fecha.split('-')
  return `${day}/${month}/${year}`
}

export default function GastosList({ gastos, mesActual }: GastosListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return
    startTransition(async () => {
      await eliminarGasto(id)
      router.refresh()
    })
  }

  if (gastos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">💸</p>
        <p className="text-sm">No hay gastos este mes</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {gastos.map((gasto) => {
        const cat = getCategoriaConfig(gasto.categoria)
        return (
          <div
            key={gasto.id}
            className="flex items-center gap-3 py-3 px-1 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="text-xl w-8 text-center flex-shrink-0">{cat.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-snug break-words">{gasto.concepto}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatFecha(gasto.fecha)}</span>
                <Badge className={`${cat.bgColor} ${cat.textColor} text-xs whitespace-nowrap`}>
                  {gasto.categoria}
                </Badge>
                <span className="text-xs text-gray-400 whitespace-nowrap">{gasto.metodo_pago}</span>
                {gasto.tarjeta && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs whitespace-nowrap">
                    {gasto.tarjeta}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900">
                {formatCLP(gasto.monto)}
              </span>
              <EditGastoForm gasto={gasto} />
              <DuplicateGastoForm gasto={gasto} mesActual={mesActual} />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                onClick={() => handleDelete(gasto.id)}
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
