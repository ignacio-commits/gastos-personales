'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MESES } from '@/types'

interface NavMesesProps {
  year: number
  month: number
}

export default function NavMeses({ year, month }: NavMesesProps) {
  const router = useRouter()

  const goToPrev = () => {
    let prevMonth = month - 1
    let prevYear = year
    if (prevMonth < 1) {
      prevMonth = 12
      prevYear -= 1
    }
    router.push(`/gastos/${prevYear}/${prevMonth}`)
  }

  const goToNext = () => {
    let nextMonth = month + 1
    let nextYear = year
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    }
    router.push(`/gastos/${nextYear}/${nextMonth}`)
  }

  const monthName = MESES[month - 1]

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={goToPrev} className="text-white hover:bg-blue-600">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="flex flex-col items-center">
        <h1 className="text-xl font-bold text-white min-w-[180px] text-center">
          {monthName} {year}
        </h1>
        <Link
          href={`/gastos/${year}`}
          className="flex items-center gap-1 text-xs text-blue-200 hover:text-white transition-colors"
        >
          <BarChart3 className="h-3 w-3" />
          Ver año completo
        </Link>
      </div>
      <Button variant="ghost" size="icon" onClick={goToNext} className="text-white hover:bg-blue-600">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
