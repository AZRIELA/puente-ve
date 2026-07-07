'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!token) {
      setError('Token de recuperación faltante.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        const data = await res.json()
        setError(data.error || 'Token inválido o expirado.')
      }
    } catch {
      setError('Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] p-8 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl uppercase">Nueva contraseña</h1>
        <p className="text-xs text-[oklch(0.55_0.015_255)] mt-1">
          Ingresa y confirma tu nueva contraseña.
        </p>
      </div>

      {!token ? (
        <p className="text-sm text-[oklch(0.52_0.20_25)] bg-[oklch(0.52_0.20_25/0.05)] border border-[oklch(0.52_0.20_25/0.25)] rounded-xl p-4">
          Error: Falta el token de recuperación en la dirección URL. Vuelve a iniciar el proceso.
        </p>
      ) : success ? (
        <p className="text-sm text-[oklch(0.64_0.17_145)] bg-[oklch(0.64_0.17_145/0.05)] border border-[oklch(0.64_0.17_145/0.25)] rounded-xl p-4">
          ¡Tu contraseña ha sido restablecida con éxito! Redirigiéndote al inicio de sesión...
        </p>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                required
                className="bg-[oklch(0.10_0.025_255)] border-[oklch(0.25_0.04_255)] focus:border-[oklch(0.82_0.16_85)] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.55_0.015_255)] hover:text-foreground cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">Confirmar Nueva Contraseña</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
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
            {loading ? 'Restableciendo...' : 'Guardar Nueva Contraseña'}
          </Button>
        </form>
      )}
    </div>
  )
}

export default function ResetPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5">
      <Link href="/" className="mb-10">
        <span className="font-display font-bold text-3xl tracking-wide text-[oklch(0.82_0.16_85)]">
          Puente VE
        </span>
      </Link>

      <div className="w-full max-w-sm">
        <Suspense fallback={
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-[oklch(0.82_0.16_85)] border-t-transparent animate-spin" />
          </div>
        }>
          <ResetForm />
        </Suspense>

        <p className="text-center text-xs text-[oklch(0.55_0.015_255)] mt-6">
          <Link href="/login" className="hover:text-[oklch(0.82_0.16_85)] transition-colors">
            ← Volver al login
          </Link>
        </p>
      </div>
    </main>
  )
}
