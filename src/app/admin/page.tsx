'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, DollarSign, Users, TrendingUp, Send, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BackNav } from '@/components/shared/BackNav'

type DonationStatus = 'pending' | 'confirmed' | 'rejected'
type BeneficiaryStatus = 'pending' | 'verified' | 'helped' | 'rejected'

interface Donation {
  id: string
  donor: string | null
  isAnonymous: boolean
  amount: number
  currency: string
  channel: string
  status: DonationStatus
  message: string | null
  proofUrl: string | null
  createdAt: string
}

interface Beneficiary {
  id: string
  firstName: string
  lastName: string
  cedula: string | null
  state: string
  situation: string
  householdSize: string
  phone: string
  status: BeneficiaryStatus
  hasMinors: boolean
  hasElders: boolean
  createdAt: string
}

export default function AdminPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [tab, setTab] = useState('donations')
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

  async function updateDonation(id: string, status: DonationStatus) {
    setDonations((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)))
    await fetch(`/api/v1/donations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  async function updateBeneficiary(id: string, status: BeneficiaryStatus) {
    setBeneficiaries((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    await fetch(`/api/v1/beneficiaries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  const pendingDonations = donations.filter((d) => d.status === 'pending').length
  const pendingBeneficiaries = beneficiaries.filter((b) => b.status === 'pending').length
  const helpedCount = beneficiaries.filter((b) => b.status === 'helped').length
  const confirmedTotal = donations
    .filter((d) => d.status === 'confirmed')
    .reduce((sum, d) => sum + (d.currency === 'CLP' ? d.amount : 0), 0)

  return (
    <main className="min-h-dvh flex flex-col pb-10">
      <BackNav label="Salir" />

      <div className="flex-1 px-5 pt-28 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-display font-bold text-4xl uppercase">Panel Admin</h1>
          <p className="text-[oklch(0.52_0.005_72)] mt-1 text-sm">Puente VE · Gestión del fondo solidario</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KpiCard
            label="Total confirmado"
            value={`$${confirmedTotal.toLocaleString('es-CL')}`}
            sub="CLP verificado"
            color="gold"
            icon={<DollarSign className="w-4 h-4" />}
          />
          <KpiCard
            label="Donaciones"
            value={String(donations.length)}
            sub={`${pendingDonations} por verificar`}
            icon={<Send className="w-4 h-4" />}
          />
          <KpiCard
            label="Familias ayudadas"
            value={String(helpedCount)}
            sub={`de ${beneficiaries.length} registradas`}
            icon={<Users className="w-4 h-4" />}
          />
          <KpiCard
            label="Pendientes"
            value={String(pendingDonations + pendingBeneficiaries)}
            sub="acciones requeridas"
            color="warning"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-[oklch(0.78_0.09_72)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-[oklch(0.13_0.006_72)] border border-[oklch(0.28_0.007_72)] mb-6 w-full">
              <TabsTrigger value="donations" className="flex-1 data-[state=active]:bg-[oklch(0.78_0.09_72)] data-[state=active]:text-[oklch(0.09_0.005_72)] cursor-pointer">
                Donaciones
                {pendingDonations > 0 && (
                  <span className="ml-2 bg-[oklch(0.58_0.22_25)] text-white text-[10px] rounded-full px-1.5 py-0.5">{pendingDonations}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="beneficiaries" className="flex-1 data-[state=active]:bg-[oklch(0.78_0.09_72)] data-[state=active]:text-[oklch(0.09_0.005_72)] cursor-pointer">
                Beneficiarios
                {pendingBeneficiaries > 0 && (
                  <span className="ml-2 bg-[oklch(0.58_0.22_25)] text-white text-[10px] rounded-full px-1.5 py-0.5">{pendingBeneficiaries}</span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="donations" className="space-y-3">
              {donations.length === 0 && (
                <p className="text-center text-[oklch(0.52_0.005_72)] py-12 text-sm">No hay donaciones aún.</p>
              )}
              {(['pending', 'confirmed', 'rejected'] as DonationStatus[]).map((statusGroup) => {
                const group = donations.filter((d) => d.status === statusGroup)
                if (!group.length) return null
                const labels = { pending: 'Por verificar', confirmed: 'Confirmadas', rejected: 'Rechazadas' }
                return (
                  <div key={statusGroup}>
                    <p className="text-xs uppercase tracking-widest text-[oklch(0.52_0.005_72)] mb-3 mt-4">{labels[statusGroup]}</p>
                    {group.map((d) => <DonationRow key={d.id} donation={d} onUpdate={updateDonation} />)}
                  </div>
                )
              })}
            </TabsContent>

            <TabsContent value="beneficiaries" className="space-y-3">
              {beneficiaries.length === 0 && (
                <p className="text-center text-[oklch(0.52_0.005_72)] py-12 text-sm">No hay solicitudes aún.</p>
              )}
              {(['pending', 'verified', 'helped', 'rejected'] as BeneficiaryStatus[]).map((statusGroup) => {
                const group = beneficiaries.filter((b) => b.status === statusGroup)
                if (!group.length) return null
                const labels = {
                  pending: 'Por verificar',
                  verified: 'Verificados — listos para recibir ayuda',
                  helped: 'Ayuda entregada',
                  rejected: 'Rechazados',
                }
                return (
                  <div key={statusGroup}>
                    <p className="text-xs uppercase tracking-widest text-[oklch(0.52_0.005_72)] mb-3 mt-4">{labels[statusGroup]}</p>
                    {group.map((b) => <BeneficiaryRow key={b.id} beneficiary={b} onUpdate={updateBeneficiary} />)}
                  </div>
                )
              })}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  )
}

function DonationRow({ donation: d, onUpdate }: { donation: Donation; onUpdate: (id: string, s: DonationStatus) => void }) {
  const displayName = d.isAnonymous ? 'Anónimo' : (d.donor ?? 'Sin nombre')
  const date = new Date(d.createdAt).toLocaleDateString('es-CL')

  return (
    <div className={`rounded-2xl border p-4 mb-3 transition-all ${
      d.status === 'pending'   ? 'border-[oklch(0.75_0.15_70/0.4)] bg-[oklch(0.75_0.15_70/0.04)]'
      : d.status === 'confirmed' ? 'border-[oklch(0.28_0.007_72)] bg-[oklch(0.13_0.006_72)]'
      : 'border-[oklch(0.28_0.007_72)] bg-[oklch(0.13_0.006_72)] opacity-50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{displayName}</span>
            <StatusBadge status={d.status} />
          </div>
          <p className="font-score text-2xl text-[oklch(0.78_0.09_72)] mt-1 tabular">
            {d.currency === 'CLP' ? `$${d.amount.toLocaleString('es-CL')}` : `${d.currency} ${d.amount}`}
          </p>
          <p className="text-xs text-[oklch(0.52_0.005_72)] mt-1">{d.channel} · {date}</p>
          {d.message && <p className="text-xs text-[oklch(0.52_0.005_72)] italic mt-1">"{d.message}"</p>}
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {d.status === 'pending' && (
            <>
              <Button size="sm" onClick={() => onUpdate(d.id, 'confirmed')} className="bg-[oklch(0.64_0.17_145)] hover:bg-[oklch(0.58_0.17_145)] text-white text-xs h-8 cursor-pointer">
                <CheckCircle className="w-3 h-3 mr-1" /> Confirmar
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUpdate(d.id, 'rejected')} className="border-[oklch(0.58_0.22_25/0.4)] text-[oklch(0.58_0.22_25)] hover:bg-[oklch(0.58_0.22_25/0.1)] text-xs h-8 cursor-pointer">
                <XCircle className="w-3 h-3 mr-1" /> Rechazar
              </Button>
            </>
          )}
          {d.proofUrl && (
            <a href={d.proofUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="text-xs h-8 cursor-pointer text-[oklch(0.52_0.005_72)]">
                <Eye className="w-3 h-3 mr-1" /> Comprobante
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function BeneficiaryRow({ beneficiary: b, onUpdate }: { beneficiary: Beneficiary; onUpdate: (id: string, s: BeneficiaryStatus) => void }) {
  const date = new Date(b.createdAt).toLocaleDateString('es-CL')

  return (
    <div className={`rounded-2xl border p-4 mb-3 transition-all ${
      b.status === 'pending'  ? 'border-[oklch(0.75_0.15_70/0.4)] bg-[oklch(0.75_0.15_70/0.04)]'
      : b.status === 'verified' ? 'border-[oklch(0.62_0.18_255/0.3)] bg-[oklch(0.62_0.18_255/0.04)]'
      : b.status === 'helped'   ? 'border-[oklch(0.64_0.17_145/0.3)] bg-[oklch(0.64_0.17_145/0.04)]'
      : 'border-[oklch(0.28_0.007_72)] bg-[oklch(0.13_0.006_72)] opacity-50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{b.firstName} {b.lastName}</span>
            <StatusBadge status={b.status} />
            {b.hasMinors && <span className="text-[10px] bg-[oklch(0.62_0.18_255/0.15)] text-[oklch(0.62_0.18_255)] px-1.5 py-0.5 rounded-full">menores</span>}
            {b.hasElders && <span className="text-[10px] bg-[oklch(0.75_0.15_70/0.15)] text-[oklch(0.75_0.15_70)] px-1.5 py-0.5 rounded-full">adultos mayores</span>}
          </div>
          <p className="text-xs text-[oklch(0.52_0.005_72)] mt-1">{b.situation} · {b.householdSize} personas</p>
          <p className="text-xs text-[oklch(0.52_0.005_72)]">{b.state} · {date}</p>
          <p className="text-xs text-[oklch(0.52_0.005_72)]">{b.cedula ?? 'Sin cédula'} · {b.phone}</p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {b.status === 'pending' && (
            <>
              <Button size="sm" onClick={() => onUpdate(b.id, 'verified')} className="bg-[oklch(0.62_0.18_255)] hover:bg-[oklch(0.55_0.18_255)] text-white text-xs h-8 cursor-pointer">
                <CheckCircle className="w-3 h-3 mr-1" /> Verificar
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUpdate(b.id, 'rejected')} className="border-[oklch(0.58_0.22_25/0.4)] text-[oklch(0.58_0.22_25)] hover:bg-[oklch(0.58_0.22_25/0.1)] text-xs h-8 cursor-pointer">
                <XCircle className="w-3 h-3 mr-1" /> Rechazar
              </Button>
            </>
          )}
          {b.status === 'verified' && (
            <Button size="sm" onClick={() => onUpdate(b.id, 'helped')} className="bg-[oklch(0.78_0.09_72)] text-[oklch(0.09_0.005_72)] hover:bg-[oklch(0.84_0.08_72)] text-xs h-8 cursor-pointer">
              <Send className="w-3 h-3 mr-1" /> Ayuda enviada
            </Button>
          )}
          {b.status === 'helped' && (
            <span className="text-xs text-[oklch(0.64_0.17_145)] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Completado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string; color?: 'gold' | 'warning'; icon: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl border p-4 ${
      color === 'gold'    ? 'border-[oklch(0.78_0.09_72/0.4)] bg-[oklch(0.78_0.09_72/0.06)]'
      : color === 'warning' ? 'border-[oklch(0.75_0.15_70/0.3)] bg-[oklch(0.75_0.15_70/0.05)]'
      : 'border-[oklch(0.28_0.007_72)] bg-[oklch(0.13_0.006_72)]'
    }`}>
      <div className={`mb-2 ${color === 'gold' ? 'text-[oklch(0.78_0.09_72)]' : color === 'warning' ? 'text-[oklch(0.75_0.15_70)]' : 'text-[oklch(0.52_0.005_72)]'}`}>
        {icon}
      </div>
      <p className={`font-score text-2xl tabular ${color === 'gold' ? 'text-[oklch(0.78_0.09_72)]' : 'text-foreground'}`}>{value}</p>
      <p className="text-[10px] text-[oklch(0.52_0.005_72)] mt-0.5 leading-snug">{label}</p>
      <p className="text-[10px] text-[oklch(0.52_0.005_72)] opacity-60">{sub}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string }> = {
    pending:   { label: 'Pendiente',  color: 'bg-[oklch(0.75_0.15_70/0.15)] text-[oklch(0.75_0.15_70)] border-[oklch(0.75_0.15_70/0.3)]' },
    confirmed: { label: 'Confirmada', color: 'bg-[oklch(0.64_0.17_145/0.15)] text-[oklch(0.64_0.17_145)] border-[oklch(0.64_0.17_145/0.3)]' },
    rejected:  { label: 'Rechazada',  color: 'bg-[oklch(0.58_0.22_25/0.15)] text-[oklch(0.58_0.22_25)] border-[oklch(0.58_0.22_25/0.3)]' },
    verified:  { label: 'Verificado', color: 'bg-[oklch(0.62_0.18_255/0.15)] text-[oklch(0.62_0.18_255)] border-[oklch(0.62_0.18_255/0.3)]' },
    helped:    { label: 'Ayudado',    color: 'bg-[oklch(0.64_0.17_145/0.15)] text-[oklch(0.64_0.17_145)] border-[oklch(0.64_0.17_145/0.3)]' },
  }
  const c = configs[status] ?? { label: status, color: '' }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.color}`}>{c.label}</span>
}
