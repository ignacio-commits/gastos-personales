'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Loader } from 'lucide-react'
import { MESES } from '@/types'
import { Button } from '@/components/ui/button'
import { duplicarMesCompleto } from '@/app/actions'

interface DuplicarMesFormProps {
  year: number
  month: number
}

export default function DuplicarMesForm({ year, month }: DuplicarMesFormProps) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [mesesSeleccionados, setMesesSeleccionados] = useState<number[]>([])

  const toggleMes = (mes: number) => {
    setMesesSeleccionados((prev) =>
      prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes]
    )
  }

  const handleSubmit = async () => {
    if (mesesSeleccionados.length === 0) {
      setError('Selecciona al menos un mes')
      return
    }

    setCargando(true)
    setError('')
    setExito('')

    try {
      const result = await duplicarMesCompleto({
        year,
        month,
        mesesDestino: mesesSeleccionados,
      })

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setExito(
          `✅ ${result.gastosCreados} gasto(s) creado(s) en ${result.mesesAfectados} mes(es)`
        )
        setTimeout(() => {
          router.refresh()
          setAbierto(false)
          setMesesSeleccionados([])
          setExito('')
        }, 2000)
      }
    } catch (err) {
      setError('Error al duplicar el mes')
    } finally {
      setCargando(false)
    }
  }

  if (!abierto) {
    return (
      <Button
        onClick={() => setAbierto(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Copy className="h-4 w-4" />
        Duplicar mes
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Duplicar gastos de {MESES[month - 1]} a otros meses
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {exito && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-700">{exito}</p>
          </div>
        )}

        <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
          {MESES.map((mes, index) => {
            const mesNum = index + 1
            const isCurrentMonth = mesNum === month
            return (
              <label
                key={mesNum}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isCurrentMonth
                    ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                    : mesesSeleccionados.includes(mesNum)
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={mesesSeleccionados.includes(mesNum)}
                  onChange={() => toggleMes(mesNum)}
                  disabled={isCurrentMonth}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">{mes}</span>
              </label>
            )
          })}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setAbierto(false)
              setMesesSeleccionados([])
              setError('')
            }}
            variant="outline"
            disabled={cargando}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={cargando || mesesSeleccionados.length === 0}
            className="flex-1"
          >
            {cargando ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Duplicando...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
