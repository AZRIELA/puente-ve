'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json()
        setError(data.error || 'Credenciales incorrectas.')
      }
    } catch {
      setError('Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <Link href="/" className="mb-10">
        <span className="font-display font-bold text-3xl tracking-wide text-[oklch(0.82_0.16_85)]">
          Puente VE
        </span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] p-8 space-y-6">
          <div>
            <h1 className="font-display font-bold text-3xl uppercase">Acceso admin</h1>
            <p className="text-sm text-[oklch(0.55_0.015_255)] mt-1">Solo para el equipo de Puente VE</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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

            <div>
              <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            {error && <p className="text-sm text-[oklch(0.52_0.20_25)]">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold h-12 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Entrar al panel'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[oklch(0.55_0.015_255)] mt-6">
          <Link href="/" className="hover:text-[oklch(0.82_0.16_85)] transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  )
}
