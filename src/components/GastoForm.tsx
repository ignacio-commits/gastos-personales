'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
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
import { CATEGORIAS, METODOS_PAGO, TARJETAS, type Categoria, type MetodoPago, type Tarjeta } from '@/types'
import { agregarGasto } from '@/app/actions'

interface GastoFormProps {
  year: number
  month: number
}

export default function GastoForm({ year, month }: GastoFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const [concepto, setConcepto] = useState('')
  const [categoria, setCategoria] = useState<Categoria>('Comida')
  const [monto, setMonto] = useState('')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Transferencia')
  const [tarjeta, setTarjeta] = useState<Tarjeta | ''>('')
  const [fecha, setFecha] = useState(todayStr)
  const [error, setError] = useState('')

  const resetForm = () => {
    setConcepto('')
    setCategoria('Comida')
    setMonto('')
    setMetodoPago('Transferencia')
    setTarjeta('')
    setFecha(todayStr)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const montoNum = parseInt(monto.replace(/\./g, ''), 10)
    if (!concepto.trim()) return setError('El concepto es requerido')
    if (isNaN(montoNum) || montoNum <= 0) return setError('El monto debe ser un número positivo')

    startTransition(async () => {
      const result = await agregarGasto({
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
        <Button size="icon" className="h-10 w-10 rounded-full bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar gasto</DialogTitle>
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
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
