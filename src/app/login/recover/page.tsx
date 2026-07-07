'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function RecoverPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleRecover(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Ocurrió un error al procesar tu solicitud.')
      }
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5">
      <Link href="/" className="mb-10">
        <span className="font-display font-bold text-3xl tracking-wide text-[oklch(0.82_0.16_85)]">
          Puente VE
        </span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] p-8 space-y-6">
          <div>
            <h1 className="font-display font-bold text-2xl uppercase">Recuperar contraseña</h1>
            <p className="text-xs text-[oklch(0.55_0.015_255)] mt-1">
              Ingresa tu correo para generar un enlace de restablecimiento.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <p className="text-sm text-[oklch(0.82_0.16_85)] bg-[oklch(0.82_0.16_85/0.05)] border border-[oklch(0.82_0.16_85/0.25)] rounded-xl p-4 leading-relaxed">
                Si el correo está registrado, se ha impreso el enlace de recuperación en los logs de la consola del servidor. Por favor, cópialo de la terminal para continuar con el cambio de clave.
              </p>
              <Link href="/login" className="block text-center mt-4">
                <Button className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold cursor-pointer">
                  Volver al login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRecover} className="space-y-4">
              <div>
                <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">Correo</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@puenteve.com"
                  required
                  className="bg-[oklch(0.10_0.025_255)] border-[oklch(0.25_0.04_255)] focus:border-[oklch(0.82_0.16_85)]"
                />
              </div>

              {error && <p className="text-sm text-[oklch(0.52_0.20_25)]">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold h-12 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Obtener Enlace'}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[oklch(0.55_0.015_255)] mt-6">
          <Link href="/login" className="hover:text-[oklch(0.82_0.16_85)] transition-colors">
            ← Cancelar y volver
          </Link>
        </p>
      </div>
    </main>
  )
}
