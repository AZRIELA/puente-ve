'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function TestGatePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    await new Promise((r) => setTimeout(r, 300))
    const correct = process.env.NEXT_PUBLIC_TEST_CODE ?? ''
    if (correct && code.trim() === correct) {
      // Cookie leída por el middleware en cada request
      document.cookie = 'test-access=1; path=/; max-age=86400'
      router.push('/')
    } else {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5 bg-background">
      <div className="w-full max-w-xs text-center">
        <p className="font-display font-bold text-3xl tracking-wide text-primary mb-2">
          Puente VE
        </p>
        <p className="text-muted-foreground text-sm mb-10">
          Acceso beta · solo para testers
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false) }}
            placeholder="Código de acceso"
            autoComplete="off"
            autoFocus
            className={`h-12 text-center text-base bg-card border-border ${
              error ? 'border-destructive' : ''
            }`}
          />
          {error && (
            <p className="text-xs text-destructive">Código incorrecto.</p>
          )}
          <Button
            type="submit"
            disabled={loading || !code}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer active:scale-[0.97] transition-all disabled:opacity-40"
          >
            {loading ? 'Verificando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </main>
  )
}
