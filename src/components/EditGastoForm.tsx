'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIAS, METODOS_PAGO, TARJETAS, type Categoria, type MetodoPago, type Tarjeta, type Gasto } from '@/types'
import { actualizarGasto } from '@/app/actions'

interface EditGastoFormProps {
  gasto: Gasto
}

export default function EditGastoForm({ gasto }: EditGastoFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [concepto, setConcepto] = useState(gasto.concepto)
  const [categoria, setCategoria] = useState<Categoria>(gasto.categoria)
  const [monto, setMonto] = useState(gasto.monto.toString())
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(gasto.metodo_pago)
  const [tarjeta, setTarjeta] = useState<Tarjeta | ''>(gasto.tarjeta || '')
  const [fecha, setFecha] = useState(gasto.fecha)
  const [error, setError] = useState('')

  const resetForm = () => {
    setConcepto(gasto.concepto)
    setCategoria(gasto.categoria)
    setMonto(gasto.monto.toString())
    setMetodoPago(gasto.metodo_pago)
    setTarjeta(gasto.tarjeta || '')
    setFecha(gasto.fecha)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const montoNum = parseInt(monto.replace(/\./g, ''), 10)
    if (!concepto.trim()) return setError('El concepto es requerido')
    if (isNaN(montoNum) || montoNum <= 0) return setError('El monto debe ser un número positivo')

    startTransition(async () => {
      const result = await actualizarGasto(gasto.id, {
        concepto: concepto.trim(),
        categoria,
        monto: montoNum,
        metodo_pago: metodoPago,
        tarjeta: metodoPago === 'Tarjeta' && tarjeta ? tarjeta : null,
        fecha,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        resetForm()
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>Editar gasto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="concepto">Concepto</Label>
            <Input
              id="concepto"
              placeholder="ej. Supermercado Unimarc"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as Categoria)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat.nombre} value={cat.nombre}>
                    {cat.icon} {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="monto">Monto (CLP)</Label>
            <Input
              id="monto"
              type="number"
              placeholder="ej. 15000"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              min={1}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Método de pago</Label>
            <Select value={metodoPago} onValueChange={(v) => {
              setMetodoPago(v as MetodoPago)
              setTarjeta('')
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METODOS_PAGO.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {metodoPago === 'Tarjeta' && (
            <div className="space-y-1.5">
              <Label>Tarjeta</Label>
              <Select value={tarjeta} onValueChange={(v) => setTarjeta(v as Tarjeta)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tarjeta" />
                </SelectTrigger>
                <SelectContent>
                  {TARJETAS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
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
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
