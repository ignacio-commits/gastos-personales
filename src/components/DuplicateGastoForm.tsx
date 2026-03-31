'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { MESES, type Gasto } from '@/types'
import { duplicarGasto } from '@/app/actions'

interface DuplicateGastoFormProps {
  gasto: Gasto
  mesActual: number
}

export default function DuplicateGastoForm({ gasto, mesActual }: DuplicateGastoFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedMeses, setSelectedMeses] = useState<number[]>([])
  const [seleccionarTodos, setSeleccionarTodos] = useState(false)
  const [error, setError] = useState('')

  const handleSeleccionarTodos = (checked: boolean) => {
    setSeleccionarTodos(checked)
    if (checked) {
      setSelectedMeses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    } else {
      setSelectedMeses([])
    }
  }

  const toggleMes = (mes: number) => {
    setSelectedMeses((prev) =>
      prev.includes(mes)
        ? prev.filter((m) => m !== mes)
        : [...prev, mes]
    )
    setSeleccionarTodos(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedMeses.length === 0) {
      return setError('Selecciona al menos un mes')
    }

    startTransition(async () => {
      const result = await duplicarGasto(gasto.id, selectedMeses)

      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setSelectedMeses([])
        setSeleccionarTodos(false)
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-green-500 hover:bg-green-50"
          title="Duplicar a otros meses"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicar gasto a otros meses</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>{gasto.concepto}</strong> • {gasto.monto.toLocaleString('es-CL')} CLP
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="todos"
                checked={seleccionarTodos}
                onChange={(e) => handleSeleccionarTodos(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="todos" className="cursor-pointer font-semibold">
                Seleccionar todos los meses
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {MESES.map((mes, idx) => {
              const mesNum = idx + 1
              const isCurrentMonth = mesNum === mesActual
              return (
                <div key={mesNum} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`mes-${mesNum}`}
                    checked={selectedMeses.includes(mesNum)}
                    onChange={(e) => toggleMes(mesNum)}
                    disabled={isCurrentMonth}
                    className="rounded"
                  />
                  <Label
                    htmlFor={`mes-${mesNum}`}
                    className={`cursor-pointer text-sm ${isCurrentMonth ? 'text-gray-400' : ''}`}
                  >
                    {mes.slice(0, 3)}
                    {isCurrentMonth && <span className="text-xs text-gray-400"> (actual)</span>}
                  </Label>
                </div>
              )
            })}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Duplicando...' : `Duplicar (${selectedMeses.length})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
