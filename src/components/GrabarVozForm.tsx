'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { procesarGastoDeVoz } from '@/app/actions'

interface GrabarVozFormProps {
  mesActual: number
  yearActual: number
}

export default function GrabarVozForm({ mesActual, yearActual }: GrabarVozFormProps) {
  const router = useRouter()
  const [grabando, setGrabando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [textoReconocido, setTextoReconocido] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const recognitionRef = useRef<any>(null)

  const procesarTranscripcion = async (transcript: string) => {
    if (!transcript.trim()) {
      setError('No se detectó audio. Intenta de nuevo.')
      return
    }

    setTextoReconocido(transcript)
    setProcesando(true)

    try {
      const result = await procesarGastoDeVoz(transcript, mesActual, yearActual)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setExito(
          `✅ ${result.gastosCreados} gasto(s) creado(s): $${result.detalle.monto.toLocaleString('es-CL')} - ${result.detalle.concepto} en ${result.detalle.meses.length > 1 ? result.detalle.meses.length + ' meses' : 'este mes'}`
        )
        setTimeout(() => {
          router.refresh()
          setTextoReconocido('')
          setExito('')
        }, 2000)
      }
    } catch (err) {
      setError('Error al procesar el audio')
    } finally {
      setProcesando(false)
    }
  }

  const iniciarGrabacion = () => {
    setError('')
    setExito('')
    setTextoReconocido('')

    // Verificar soporte de Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta grabación de voz. Usa Chrome, Edge o Safari.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    let finalTranscript = ''
    let timeoutId: NodeJS.Timeout

    recognition.onstart = (): void => {
      setGrabando(true)
      setError('')

      // Timeout automático después de 15 segundos
      timeoutId = setTimeout(() => {
        recognition.stop()
      }, 15000)
    }

    recognition.onresult = (event: any): void => {
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      // Mostrar texto mientras se está hablando
      if (interimTranscript || finalTranscript) {
        setTextoReconocido(finalTranscript + interimTranscript)
      }
    }

    recognition.onerror = (event: any): void => {
      setGrabando(false)
      clearTimeout(timeoutId)
      const mensajesError: { [key: string]: string } = {
        'no-speech': 'No se detectó audio. Intenta de nuevo.',
        'audio-capture': 'No hay acceso al micrófono. Verifica los permisos.',
        'network': 'Error de conexión. Intenta de nuevo.',
        'permission-denied': 'Permiso de micrófono denegado. Verifica los permisos del navegador.',
      }
      setError(mensajesError[event.error] || `Error: ${event.error}`)
    }

    recognition.onend = (): void => {
      clearTimeout(timeoutId)
      setGrabando(false)

      // Procesar el texto transcrito al final
      if (finalTranscript.trim()) {
        procesarTranscripcion(finalTranscript.trim())
      }
    }

    recognition.start()
  }

  const detenerGrabacion = () => {
    if (recognitionRef.current) {
      // En iOS Safari, a veces necesita abort() en lugar de stop()
      try {
        recognitionRef.current.stop()
      } catch (err) {
        recognitionRef.current.abort()
      }
      setGrabando(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          onClick={grabando ? detenerGrabacion : iniciarGrabacion}
          disabled={procesando}
          className={`flex-1 ${
            grabando
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {procesando ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : grabando ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Detener
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Grabar gasto
            </>
          )}
        </Button>
      </div>

      {textoReconocido && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700 font-medium">Reconocido:</p>
          <p className="text-sm text-blue-900">{textoReconocido}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {exito && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">{exito}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        💡 <strong>Ejemplos:</strong> "500000 deuda transferencia" | "1000000 en abril mayo junio comida tarjeta falabella" | "200000 todos los meses casa efectivo"
      </p>
    </div>
  )
}
