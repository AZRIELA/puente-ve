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
        <span className="font-display font-bold text-xl tracking-wide text-[oklch(0.78_0.09_72)]">
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
              className="bg-[oklch(0.78_0.09_72)] text-[oklch(0.09_0.005_72)] hover:bg-[oklch(0.84_0.08_72)] font-semibold cursor-pointer active:scale-[0.96] transition-all"
            >
              Donar ahora
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-5 pt-36 pb-16 min-h-[80dvh]">
        <Badge className="mb-6 bg-[oklch(0.78_0.09_72/0.15)] text-[oklch(0.78_0.09_72)] border border-[oklch(0.78_0.09_72/0.3)] text-xs uppercase tracking-widest font-semibold">
          Terremoto Venezuela · Junio 2026
        </Badge>

        <h1 className="font-display font-extrabold text-[clamp(3rem,10vw,6rem)] leading-[0.95] tracking-tight uppercase mb-6">
          Cada peso
          <br />
          <span className="text-[oklch(0.78_0.09_72)]">construye</span>
          <br />
          un puente
        </h1>

        <p className="text-[oklch(0.52_0.005_72)] text-lg max-w-md mb-10 leading-relaxed">
          Familias venezolanas damnificadas necesitan ayuda urgente.
          Tú decides cuánto. Nosotros garantizamos que llegue.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link href="/donar" className="flex-1">
            <Button
              size="lg"
              className="w-full bg-[oklch(0.78_0.09_72)] text-[oklch(0.09_0.005_72)] hover:bg-[oklch(0.84_0.08_72)] font-bold text-base gold-glow cursor-pointer active:scale-[0.96] transition-all gap-2"
            >
              <Heart className="w-4 h-4" />
              Quiero donar
            </Button>
          </Link>
          <Link href="/beneficiario" className="flex-1">
            <Button
              size="lg"
              variant="outline"
              className="w-full font-semibold text-base cursor-pointer active:scale-[0.96] transition-all gap-2 border-[oklch(0.28_0.007_72)] hover:border-[oklch(0.78_0.09_72/0.5)] hover:text-[oklch(0.78_0.09_72)]"
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
          Cómo <span className="text-[oklch(0.78_0.09_72)]">funciona</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          <StepCard
            n="01"
            title="Donás desde Chile"
            desc="Vía transferencia bancaria CLP o Global66. Sin comisiones extras."
            icon={<Globe className="w-5 h-5" />}
          />
          <StepCard
            n="02"
            title="Verificamos familias"
            desc="Cada beneficiario es verificado por nuestro equipo antes de recibir ayuda."
            icon={<Shield className="w-5 h-5" />}
          />
          <StepCard
            n="03"
            title="La ayuda llega directo"
            desc="Transferencia directa a la familia. Tú ves el comprobante en tu panel."
            icon={<ArrowRight className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[oklch(0.28_0.007_72)] px-5 py-8 text-center">
        <p className="text-[oklch(0.52_0.005_72)] text-sm">
          Puente VE · Fondo solidario independiente · 100% transparente
        </p>
        <div className="flex justify-center gap-6 mt-3">
          <Link
            href="/fondo"
            className="text-sm text-[oklch(0.52_0.005_72)] hover:text-[oklch(0.78_0.09_72)] transition-colors cursor-pointer"
          >
            Ver el fondo
          </Link>
          <Link
            href="/admin"
            className="text-sm text-[oklch(0.52_0.005_72)] hover:text-[oklch(0.78_0.09_72)] transition-colors cursor-pointer"
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
          ? 'border-[oklch(0.78_0.09_72/0.4)] bg-[oklch(0.78_0.09_72/0.06)] gold-glow'
          : 'border-[oklch(0.28_0.007_72)] bg-[oklch(0.13_0.006_72)]'
      }`}
    >
      <p
        className={`font-score text-3xl tabular ${
          highlight ? 'text-[oklch(0.78_0.09_72)]' : 'text-foreground'
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-[oklch(0.52_0.005_72)] mt-1 leading-snug">{label}</p>
      <p className="text-xs text-[oklch(0.52_0.005_72)] opacity-60">{sub}</p>
    </div>
  )
}

function StepCard({
  n,
  title,
  desc,
  icon,
}: {
  n: string
  title: string
  desc: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl p-6 border border-[oklch(0.28_0.007_72)] bg-[oklch(0.13_0.006_72)] interactive-card">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-score text-4xl text-[oklch(0.78_0.09_72/0.5)]">{n}</span>
        <span className="text-[oklch(0.78_0.09_72)]">{icon}</span>
      </div>
      <h3 className="font-display font-bold text-lg uppercase mb-2">{title}</h3>
      <p className="text-sm text-[oklch(0.52_0.005_72)] leading-relaxed">{desc}</p>
    </div>
  )
}
