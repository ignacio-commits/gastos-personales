'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader } from 'lucide-react'

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError('No pudimos encontrar esa cuenta. Verifica el email.')
      setLoading(false)
    } else {
      setSuccess('Se envió un link de recuperación a tu email. Revisa tu bandeja de entrada.')
      setEmail('')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <Link href="/login" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mb-6 font-medium">
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al login
        </Link>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💸</div>
          <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="text-gray-500 text-sm mt-1">Ingresa tu email para recibir un link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleRecover} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar link de recuperación'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          El link llegará en unos minutos. Si no ves el email, revisa la carpeta de spam.
        </p>
      </div>
    </div>
  )
}
