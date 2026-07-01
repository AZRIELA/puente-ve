'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, DollarSign, Users } from 'lucide-react'
import { BackNav } from '@/components/shared/BackNav'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Donation {
  id: string
  donor: string | null
  isAnonymous: boolean
  amount: number
  currency: string
  channel: string
  status: string
  createdAt: string
}

interface Beneficiary {
  id: string
  firstName: string
  lastName: string
  state: string
  situation: string
  householdSize: string
  status: string
  createdAt: string
}

export default function FondoPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/donations').then((r) => r.json()),
      fetch('/api/v1/beneficiaries').then((r) => r.json()),
    ]).then(([d, b]) => {
      setDonations(d)
      setBeneficiaries(b)
    }).finally(() => setLoading(false))
  }, [])

  const confirmed = donations.filter((d) => d.status === 'confirmed')
  const totalCLP = confirmed.reduce((s, d) => s + (d.currency === 'CLP' ? d.amount : 0), 0)
  const helped = beneficiaries.filter((b) => b.status === 'helped').length

  return (
    <main className="min-h-dvh flex flex-col pb-12">
      <BackNav label="Inicio" />

      <div className="flex-1 px-5 pt-28 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[oklch(0.82_0.16_85)] mb-2">Transparencia total</p>
          <h1 className="font-display font-bold text-4xl uppercase leading-tight">El fondo<br />en números</h1>
          <p className="text-[oklch(0.55_0.015_255)] mt-2 text-sm">Cada peso recibido y cada familia ayudada, visible para todos.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-[oklch(0.82_0.16_85)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="rounded-2xl border border-[oklch(0.82_0.16_85/0.3)] bg-[oklch(0.82_0.16_85/0.07)] p-5">
                <DollarSign className="w-4 h-4 text-[oklch(0.82_0.16_85)] mb-2" />
                <p className="font-score text-3xl text-[oklch(0.82_0.16_85)] tabular-nums">
                  ${totalCLP.toLocaleString('es-CL')}
                </p>
                <p className="text-xs text-[oklch(0.55_0.015_255)] mt-1">CLP confirmado</p>
              </div>
              <div className="rounded-2xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] p-5">
                <Users className="w-4 h-4 text-[oklch(0.55_0.015_255)] mb-2" />
                <p className="font-score text-3xl tabular-nums">{donations.length}</p>
                <p className="text-xs text-[oklch(0.55_0.015_255)] mt-1">donaciones recibidas</p>
              </div>
              <div className="rounded-2xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] p-5">
                <CheckCircle className="w-4 h-4 text-[oklch(0.64_0.17_145)] mb-2" />
                <p className="font-score text-3xl tabular-nums">{helped}</p>
                <p className="text-xs text-[oklch(0.55_0.015_255)] mt-1">familias ayudadas</p>
              </div>
              <div className="rounded-2xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] p-5">
                <Clock className="w-4 h-4 text-[oklch(0.55_0.015_255)] mb-2" />
                <p className="font-score text-3xl tabular-nums">{beneficiaries.length}</p>
                <p className="text-xs text-[oklch(0.55_0.015_255)] mt-1">familias registradas</p>
              </div>
            </div>

            {/* Donaciones confirmadas */}
            <section className="mb-10">
              <h2 className="font-display font-bold text-xl uppercase mb-4">
                Donaciones confirmadas
                <span className="ml-2 text-[oklch(0.82_0.16_85)]">({confirmed.length})</span>
              </h2>
              {confirmed.length === 0 ? (
                <p className="text-sm text-[oklch(0.55_0.015_255)]">Aún no hay donaciones confirmadas.</p>
              ) : (
                <div className="space-y-3">
                  {confirmed.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">
                          {d.isAnonymous ? 'Donante anónimo' : (d.donor ?? 'Sin nombre')}
                        </p>
                        <p className="text-xs text-[oklch(0.55_0.015_255)]">
                          {d.channel} · {new Date(d.createdAt).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <p className="font-score text-xl text-[oklch(0.82_0.16_85)] tabular-nums">
                        {d.currency === 'CLP' ? `$${d.amount.toLocaleString('es-CL')}` : `${d.currency} ${d.amount}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Familias ayudadas */}
            <section className="mb-10">
              <h2 className="font-display font-bold text-xl uppercase mb-4">
                Familias ayudadas
                <span className="ml-2 text-[oklch(0.64_0.17_145)]">({helped})</span>
              </h2>
              {helped === 0 ? (
                <p className="text-sm text-[oklch(0.55_0.015_255)]">Estamos procesando las primeras ayudas.</p>
              ) : (
                <div className="space-y-3">
                  {beneficiaries.filter((b) => b.status === 'helped').map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-xl border border-[oklch(0.64_0.17_145/0.25)] bg-[oklch(0.64_0.17_145/0.04)] px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{b.firstName} {b.lastName}</p>
                        <p className="text-xs text-[oklch(0.55_0.015_255)]">
                          {b.state} · {b.householdSize} personas · {b.situation}
                        </p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-[oklch(0.64_0.17_145)] flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[oklch(0.25_0.04_255)]">
          <Link href="/donar" className="flex-1">
            <Button className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold cursor-pointer active:scale-[0.96] transition-all">
              Quiero donar
            </Button>
          </Link>
          <Link href="/beneficiario" className="flex-1">
            <Button variant="outline" className="w-full cursor-pointer active:scale-[0.96] transition-all border-[oklch(0.25_0.04_255)] hover:border-[oklch(0.82_0.16_85/0.4)]">
              Soy beneficiario
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
