'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
      <h1 className="text-xl font-bold text-white min-w-[180px] text-center">
        {monthName} {year}
      </h1>
      <Button variant="ghost" size="icon" onClick={goToNext} className="text-white hover:bg-blue-600">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
