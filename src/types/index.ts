export type Categoria =
  | 'Casa'
  | 'Comida'
  | 'Familia'
  | 'Transporte'
  | 'Viajes'
  | 'Deudas'
  | 'Salud'
  | 'Suscripciones'
  | 'Gastos anuales'
  | 'Cuidado personal'
  | 'Entretenimiento'
  | 'Otros'

export type MetodoPago = 'Transferencia' | 'Tarjeta' | 'Efectivo'
export type Tarjeta = 'Banco de Chile' | 'Rappicard' | 'Falabella'

export interface Gasto {
  id: string
  user_id: string
  fecha: string
  concepto: string
  categoria: Categoria
  monto: number
  metodo_pago: MetodoPago
  tarjeta?: Tarjeta | null
  recurrente?: boolean
  cuota_actual?: number | null
  cuota_total?: number | null
  created_at: string
}

export interface Presupuesto {
  id: string
  user_id: string
  mes: number
  anio: number
  monto: number
}

export interface CategoriaConfig {
  nombre: Categoria
  icon: string
  color: string
  bgColor: string
  textColor: string
}

export const CATEGORIAS: CategoriaConfig[] = [
  { nombre: 'Casa', icon: '🏠', color: '#3b82f6', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  { nombre: 'Comida', icon: '🍎', color: '#22c55e', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  { nombre: 'Familia', icon: '❤️', color: '#ef4444', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  { nombre: 'Transporte', icon: '🚗', color: '#f97316', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  { nombre: 'Viajes', icon: '✈️', color: '#06b6d4', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' },
  { nombre: 'Deudas', icon: '🏦', color: '#6b7280', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
  { nombre: 'Salud', icon: '🏥', color: '#ec4899', bgColor: 'bg-pink-100', textColor: 'text-pink-800' },
  { nombre: 'Suscripciones', icon: '📱', color: '#a855f7', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  { nombre: 'Gastos anuales', icon: '📅', color: '#eab308', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { nombre: 'Cuidado personal', icon: '💆', color: '#8b5cf6', bgColor: 'bg-violet-100', textColor: 'text-violet-800' },
  { nombre: 'Entretenimiento', icon: '🎮', color: '#6366f1', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
  { nombre: 'Otros', icon: '💰', color: '#64748b', bgColor: 'bg-slate-100', textColor: 'text-slate-800' },
]

export const METODOS_PAGO: MetodoPago[] = ['Transferencia', 'Tarjeta', 'Efectivo']
export const TARJETAS: Tarjeta[] = ['Banco de Chile', 'Rappicard', 'Falabella']

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
