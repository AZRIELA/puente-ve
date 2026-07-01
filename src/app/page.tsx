import Link from 'next/link'
import { Heart, Users, ArrowRight, Globe, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STATS = {
  totalCLP: 4_850_000,
  totalUSD: 5_280,
  familiesRegistered: 47,
  familiesHelped: 23,
  donors: 312,
}

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col">
      {/* Nav */}
      <nav className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-5 py-3 rounded-2xl glass-card max-w-5xl mx-auto">
        <span className="font-display font-bold text-xl tracking-wide text-[oklch(0.82_0.16_85)]">
          Puente VE
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-sm cursor-pointer">
              Entrar
            </Button>
          </Link>
          <Link href="/donar">
            <Button
              size="sm"
              className="bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-semibold cursor-pointer active:scale-[0.96] transition-all"
            >
              Donar ahora
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-5 pt-36 pb-16 min-h-[80dvh]">
        <Badge className="mb-6 bg-[oklch(0.82_0.16_85/0.12)] text-[oklch(0.82_0.16_85)] border border-[oklch(0.82_0.16_85/0.3)] text-xs uppercase tracking-widest font-semibold">
          Terremoto Venezuela · Junio 2026
        </Badge>

        <h1 className="font-display font-extrabold text-[clamp(3rem,10vw,6rem)] leading-[0.95] tracking-tight uppercase mb-6">
          Cada peso
          <br />
          <span className="text-[oklch(0.82_0.16_85)]">construye</span>
          <br />
          un puente
        </h1>

        <p className="text-[oklch(0.55_0.015_255)] text-lg max-w-md mb-10 leading-relaxed">
          Familias venezolanas damnificadas necesitan ayuda urgente.
          Tú eliges cuánto. Nosotros garantizamos que llegue.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link href="/donar" className="flex-1">
            <Button
              size="lg"
              className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold text-base ve-glow cursor-pointer active:scale-[0.96] transition-all gap-2"
            >
              <Heart className="w-4 h-4" />
              Quiero donar
            </Button>
          </Link>
          <Link href="/beneficiario" className="flex-1">
            <Button
              size="lg"
              variant="outline"
              className="w-full font-semibold text-base cursor-pointer active:scale-[0.96] transition-all gap-2 border-[oklch(0.25_0.04_255)] hover:border-[oklch(0.82_0.16_85/0.4)] hover:text-[oklch(0.82_0.16_85)]"
            >
              <Users className="w-4 h-4" />
              Soy beneficiario
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 pb-16 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Recaudado"
            value={formatCLP(STATS.totalCLP)}
            sub={`≈ USD ${STATS.totalUSD.toLocaleString()}`}
            highlight
          />
          <StatCard label="Donantes" value={String(STATS.donors)} sub="de Chile y el mundo" />
          <StatCard label="Familias registradas" value={String(STATS.familiesRegistered)} sub="en Venezuela" />
          <StatCard label="Familias ayudadas" value={String(STATS.familiesHelped)} sub="ayuda entregada" />
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="px-5 pb-20 max-w-5xl mx-auto w-full">
        <h2 className="font-display font-bold text-3xl uppercase mb-8 text-center">
          Cómo <span className="text-[oklch(0.82_0.16_85)]">funciona</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          <Link href="/donar">
            <StepCard
              n="01"
              title="Elige cómo donar"
              desc="Global66, transferencia bancaria, Wise o USDT. Desde Chile, Latinoamérica, EEUU, Europa o cualquier país."
              icon={<Globe className="w-5 h-5" />}
              cta="Donar ahora →"
            />
          </Link>
          <Link href="/beneficiario">
            <StepCard
              n="02"
              title="Verificamos familias"
              desc="Cada beneficiario es revisado por nuestro equipo antes de recibir ayuda."
              icon={<Shield className="w-5 h-5" />}
              cta="Registrarse como beneficiario →"
            />
          </Link>
          <Link href="/fondo">
            <StepCard
              n="03"
              title="La ayuda llega directo"
              desc="Transferencia directa a la familia. Tú ves el comprobante en tu panel."
              icon={<ArrowRight className="w-5 h-5" />}
              cta="Ver el fondo →"
            />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[oklch(0.25_0.04_255)] px-5 py-8 text-center">
        <p className="text-[oklch(0.55_0.015_255)] text-sm">
          Puente VE · Fondo solidario independiente · 100% transparente
        </p>
        <div className="flex justify-center gap-6 mt-3">
          <Link
            href="/fondo"
            className="text-sm text-[oklch(0.55_0.015_255)] hover:text-[oklch(0.82_0.16_85)] transition-colors cursor-pointer"
          >
            Ver el fondo
          </Link>
          <Link
            href="/admin"
            className="text-sm text-[oklch(0.55_0.015_255)] hover:text-[oklch(0.82_0.16_85)] transition-colors cursor-pointer"
          >
            Admin
          </Link>
        </div>
      </footer>
    </main>
  )
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        highlight
          ? 'border-[oklch(0.82_0.16_85/0.3)] bg-[oklch(0.82_0.16_85/0.07)] ve-glow'
          : 'border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)]'
      }`}
    >
      <p
        className={`font-score text-3xl tabular ${
          highlight ? 'text-[oklch(0.82_0.16_85)]' : 'text-foreground'
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-[oklch(0.55_0.015_255)] mt-1 leading-snug">{label}</p>
      <p className="text-xs text-[oklch(0.55_0.015_255)] opacity-60">{sub}</p>
    </div>
  )
}

function StepCard({
  n,
  title,
  desc,
  icon,
  cta,
}: {
  n: string
  title: string
  desc: string
  icon: React.ReactNode
  cta?: string
}) {
  return (
    <div className="rounded-2xl p-6 border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] interactive-card cursor-pointer hover:border-[oklch(0.82_0.16_85/0.4)] transition-colors group">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-score text-4xl text-[oklch(0.82_0.16_85/0.4)]">{n}</span>
        <span className="text-[oklch(0.82_0.16_85)]">{icon}</span>
      </div>
      <h3 className="font-display font-bold text-lg uppercase mb-2">{title}</h3>
      <p className="text-sm text-[oklch(0.55_0.015_255)] leading-relaxed mb-4">{desc}</p>
      {cta && <p className="text-xs text-[oklch(0.82_0.16_85)] font-semibold group-hover:underline">{cta}</p>}
    </div>
  )
}
