'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PiggyBank, Plus, Trash2, Pencil, Check, X, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCLP } from '@/lib/utils'
import { agregarAhorro, eliminarAhorro, actualizarMetaAhorro } from '@/app/actions'

interface Ahorro {
  id: string
  monto: number
  concepto: string | null
  fecha: string
}

interface AhorroSectionProps {
  year: number
  month: number
  metaAnual: number
  totalAhorradoAnio: number
  ahorrosMes: Ahorro[]
}

function formatFecha(fecha: string) {
  const [, , day] = fecha.split('-')
  return `día ${parseInt(day)}`
}

export default function AhorroSection({
  year,
  month,
  metaAnual,
  totalAhorradoAnio,
  ahorrosMes,
}: AhorroSectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Estado formulario agregar
  const [mostrarForm, setMostrarForm] = useState(false)
  const [monto, setMonto] = useState('')
  const [concepto, setConcepto] = useState('')
  const [error, setError] = useState('')

  // Estado editar meta
  const [editandoMeta, setEditandoMeta] = useState(false)
  const [nuevaMeta, setNuevaMeta] = useState(metaAnual > 0 ? metaAnual.toString() : '')
  const [errorMeta, setErrorMeta] = useState('')

  const pct = metaAnual > 0 ? Math.min(Math.round((totalAhorradoAnio / metaAnual) * 100), 100) : 0
  const faltan = metaAnual - totalAhorradoAnio

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const handleAgregar = () => {
    setError('')
    const montoNum = parseInt(monto.replace(/\./g, ''), 10)
    if (isNaN(montoNum) || montoNum <= 0) { setError('Ingresa un monto válido'); return }

    startTransition(async () => {
      const result = await agregarAhorro({ monto: montoNum, concepto: concepto.trim(), fecha: todayStr })
      if (result.error) { setError(result.error); return }
      setMonto('')
      setConcepto('')
      setMostrarForm(false)
      router.refresh()
    })
  }

  const handleEliminar = (id: string) => {
    if (!confirm('¿Eliminar este ahorro?')) return
    startTransition(async () => {
      await eliminarAhorro(id)
      router.refresh()
    })
  }

  const handleGuardarMeta = () => {
    setErrorMeta('')
    const metaNum = parseInt(nuevaMeta.replace(/\./g, ''), 10)
    if (isNaN(metaNum) || metaNum <= 0) {
      setErrorMeta('Ingresa un monto válido')
      return
    }
    startTransition(async () => {
      const result = await actualizarMetaAhorro(year, metaNum)
      if (result.error) {
        setErrorMeta(result.error)
      } else {
        setEditandoMeta(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">Ahorro {year}</h2>
        </div>
        <Button
          onClick={() => setMostrarForm(!mostrarForm)}
          size="sm"
          className="bg-green-600 hover:bg-green-700 gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar ahorro
        </Button>
      </div>

      {/* Formulario agregar */}
      {mostrarForm && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Monto</Label>
              <Input
                type="number"
                placeholder="ej. 50000"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Concepto (opcional)</Label>
              <Input
                placeholder="ej. Sueldo extra"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={() => setMostrarForm(false)} variant="outline" size="sm" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleAgregar} disabled={isPending} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
              {isPending ? <Loader className="h-3.5 w-3.5 animate-spin" /> : 'Guardar'}
            </Button>
          </div>
        </div>
      )}

      {/* Meta anual */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Meta {year}</span>
          {editandoMeta ? (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={nuevaMeta}
                  onChange={(e) => setNuevaMeta(e.target.value)}
                  placeholder="ej. 1000000"
                  className="h-6 text-xs w-32 px-2"
                  autoFocus
                />
                <button onClick={handleGuardarMeta} disabled={isPending} className="text-green-600 hover:text-green-700">
                  {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEditandoMeta(false); setErrorMeta(''); setNuevaMeta(metaAnual > 0 ? metaAnual.toString() : '') }} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {errorMeta && <p className="text-xs text-red-600">{errorMeta}</p>}
            </div>
          ) : (
            <button
              onClick={() => setEditandoMeta(true)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              {formatCLP(metaAnual)}
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${
              pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-emerald-400' : pct >= 30 ? 'bg-yellow-400' : 'bg-gray-300'
            }`}
            style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%` }}
          >
            {pct >= 15 && <span className="text-xs font-bold text-white">{pct}%</span>}
          </div>
        </div>

        <div className="flex justify-between mt-1.5">
          <span className="text-xs font-semibold text-green-700">{formatCLP(totalAhorradoAnio)} ahorrado</span>
          {faltan > 0
            ? <span className="text-xs text-gray-400">Faltan {formatCLP(faltan)}</span>
            : <span className="text-xs font-semibold text-green-600">🎉 ¡Meta lograda!</span>
          }
        </div>
      </div>

      {/* Ahorros del mes */}
      {ahorrosMes.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">Este mes</p>
          <div className="space-y-2">
            {ahorrosMes.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-1.5 border-t border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{formatCLP(a.monto)}</p>
                  <p className="text-xs text-gray-400">
                    {a.concepto ? `${a.concepto} · ` : ''}{formatFecha(a.fecha)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-300 hover:text-red-500 hover:bg-red-50"
                  onClick={() => handleEliminar(a.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {ahorrosMes.length === 0 && !mostrarForm && (
        <p className="text-xs text-gray-400 text-center py-2">Sin ahorros este mes</p>
      )}
    </div>
  )
}
