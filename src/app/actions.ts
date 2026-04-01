'use server'

import { createClient } from '@/lib/supabase/server'
import { type Categoria, type MetodoPago, type Tarjeta } from '@/types'

export async function agregarGasto(data: {
  concepto: string
  categoria: Categoria
  monto: number
  metodo_pago: MetodoPago
  tarjeta?: Tarjeta | null
  fecha: string
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase.from('gastos').insert({
    user_id: user.id,
    concepto: data.concepto,
    categoria: data.categoria,
    monto: data.monto,
    metodo_pago: data.metodo_pago,
    tarjeta: data.tarjeta || null,
    fecha: data.fecha,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function eliminarGasto(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase
    .from('gastos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function actualizarGasto(id: string, data: {
  concepto: string
  categoria: Categoria
  monto: number
  metodo_pago: MetodoPago
  tarjeta?: Tarjeta | null
  fecha: string
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase
    .from('gastos')
    .update({
      concepto: data.concepto,
      categoria: data.categoria,
      monto: data.monto,
      metodo_pago: data.metodo_pago,
      tarjeta: data.tarjeta || null,
      fecha: data.fecha,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function duplicarGasto(id: string, meses: number[]) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  // Obtener el gasto a duplicar
  const { data: gastoOriginal, error: fetchError } = await supabase
    .from('gastos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !gastoOriginal) {
    return { error: 'Gasto no encontrado' }
  }

  // Crear copias para cada mes seleccionado
  const gastosDuplicados = meses.map((mes) => {
    const [year, , day] = gastoOriginal.fecha.split('-')
    const nuevaFecha = `${year}-${String(mes).padStart(2, '0')}-${day}`

    return {
      user_id: user.id,
      concepto: gastoOriginal.concepto,
      categoria: gastoOriginal.categoria,
      monto: gastoOriginal.monto,
      metodo_pago: gastoOriginal.metodo_pago,
      tarjeta: gastoOriginal.tarjeta,
      fecha: nuevaFecha,
    }
  })

  const { error } = await supabase
    .from('gastos')
    .insert(gastosDuplicados)

  if (error) {
    return { error: error.message }
  }

  return { success: true, count: gastosDuplicados.length }
}

export async function actualizarPresupuesto(data: {
  year: number
  month: number
  monto: number
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase.from('presupuestos').upsert(
    {
      user_id: user.id,
      anio: data.year,
      mes: data.month,
      monto: data.monto,
    },
    { onConflict: 'user_id,mes,anio' }
  )

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function procesarGastoDeVoz(textoVoz: string, mesActual: number, yearActual: number) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  try {
    const { Anthropic } = await import('@anthropic-ai/sdk')

    if (!process.env.ANTHROPIC_API_KEY) {
      return { error: 'API key de Anthropic no configurada en servidor' }
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const prompt = `Analiza este comando de voz para crear un gasto. Extrae los siguientes datos en formato JSON:
- monto (número, requerido): el monto en pesos
- concepto (string): una descripción corta del gasto
- categoria (string, opcional): Casa, Comida, Familia, Transporte, Viajes, Deudas, Salud, Suscripciones, Gastos anuales, Cuidado personal, Entretenimiento, u Otros. Default: Otros
- metodo_pago (string, opcional): Transferencia, Tarjeta, o Efectivo. Default: Transferencia
- tarjeta (string, opcional): si metodo_pago es Tarjeta, puede ser: Banco de Chile, Rappicard, o Falabella
- meses (array de números, 1-12, opcional): lista de meses. Si no se especifica, usa solo el mes actual (${mesActual})
- duplicar_todos_meses (boolean): si dice "todos los meses" o similar

Texto de voz: "${textoVoz}"

Responde SOLO con JSON válido, sin markdown ni explicaciones.`

    let message
    try {
      message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })
    } catch (apiError: any) {
      console.error('Error de Anthropic API:', apiError)
      return { error: `Error de API: ${apiError.error?.message || apiError.message || 'Error desconocido'}` }
    }

    const respuestaText = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsedData = JSON.parse(respuestaText)

    if (!parsedData.monto) {
      return { error: 'No se detectó un monto válido en el audio' }
    }

    // Determinar meses a usar
    let mesesAUsar = [mesActual]
    if (parsedData.duplicar_todos_meses) {
      mesesAUsar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    } else if (parsedData.meses && Array.isArray(parsedData.meses) && parsedData.meses.length > 0) {
      mesesAUsar = parsedData.meses
    }

    // Crear gastos para cada mes
    const gastosACrear = mesesAUsar.map((mes: number) => ({
      user_id: user.id,
      concepto: parsedData.concepto || 'Gasto por voz',
      categoria: (parsedData.categoria || 'Otros') as Categoria,
      monto: parseInt(parsedData.monto),
      metodo_pago: (parsedData.metodo_pago || 'Transferencia') as MetodoPago,
      tarjeta: parsedData.metodo_pago === 'Tarjeta' ? (parsedData.tarjeta || null) : null,
      fecha: `${yearActual}-${String(mes).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
    }))

    const { error } = await supabase.from('gastos').insert(gastosACrear)

    if (error) {
      return { error: `Error al guardar gasto: ${error.message}` }
    }

    return {
      success: true,
      gastosCreados: gastosACrear.length,
      detalle: {
        monto: parsedData.monto,
        concepto: parsedData.concepto || 'Gasto por voz',
        categoria: parsedData.categoria || 'Otros',
        metodo_pago: parsedData.metodo_pago || 'Transferencia',
        meses: mesesAUsar,
      },
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
    return { error: `No se pudo procesar el audio: ${errorMsg}` }
  }
}
