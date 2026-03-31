'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCLP } from '@/lib/utils'
import { actualizarPresupuesto } from '@/app/actions'

interface PresupuestoEditorProps {
  presupuesto: number
  year: number
  month: number
}

export default function PresupuestoEditor({ presupuesto, year, month }: PresupuestoEditorProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(presupuesto))
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    const num = parseInt(value.replace(/\./g, ''), 10)
    if (isNaN(num) || num <= 0) return
    startTransition(async () => {
      await actualizarPresupuesto({ year, month, monto: num })
      setEditing(false)
      router.refresh()
    })
  }

  const handleCancel = () => {
    setValue(String(presupuesto))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 w-36 text-sm bg-blue-600 border-blue-400 text-white placeholder:text-blue-300"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-white hover:bg-blue-600"
          onClick={handleSave}
          disabled={isPending}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-white hover:bg-blue-600"
          onClick={handleCancel}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-blue-200">Presupuesto:</span>
      <span className="text-sm font-semibold text-white">{formatCLP(presupuesto)}</span>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-blue-300 hover:text-white hover:bg-blue-600"
        onClick={() => setEditing(true)}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  )
}
