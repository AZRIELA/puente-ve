'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  CheckCircle, XCircle, DollarSign, Users, TrendingUp,
  Send, Eye, Search, SlidersHorizontal, LogOut,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const router = useRouter()
  const [donations, setDonations] = useState<Donation[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [tab, setTab] = useState('donations')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'name_asc'>('date_desc')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (!sessionStorage.getItem('admin-auth')) router.replace('/login')
  }, [router])

  function handleLogout() {
    sessionStorage.removeItem('admin-auth')
    router.push('/login')
  }

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

  const filteredDonations = useMemo(() => {
    const q = search.toLowerCase()
    let list = donations.filter((d) => {
      const name = (d.isAnonymous ? 'anónimo' : d.donor ?? '').toLowerCase()
      const matchSearch = !q || name.includes(q) || d.channel.toLowerCase().includes(q) || d.createdAt.includes(q)
      const matchStatus = filterStatus === 'all' || d.status === filterStatus
      return matchSearch && matchStatus
    })
    if (sortBy === 'date_desc')   list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sortBy === 'date_asc')    list = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    if (sortBy === 'amount_desc') list = [...list].sort((a, b) => b.amount - a.amount)
    if (sortBy === 'name_asc')    list = [...list].sort((a, b) => (a.donor ?? '').localeCompare(b.donor ?? ''))
    return list
  }, [donations, search, sortBy, filterStatus])

  const filteredBeneficiaries = useMemo(() => {
    const q = search.toLowerCase()
    let list = beneficiaries.filter((b) => {
      const name = `${b.firstName} ${b.lastName}`.toLowerCase()
      const matchSearch = !q || name.includes(q) || b.state.toLowerCase().includes(q) || b.phone.includes(q)
      const matchStatus = filterStatus === 'all' || b.status === filterStatus
      return matchSearch && matchStatus
    })
    if (sortBy === 'date_desc') list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sortBy === 'date_asc')  list = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    if (sortBy === 'name_asc')  list = [...list].sort((a, b) => a.firstName.localeCompare(b.firstName))
    return list
  }, [beneficiaries, search, sortBy, filterStatus])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-xl tracking-wide text-primary">Puente VE</span>
            <span className="hidden sm:block text-xs text-muted-foreground border border-border rounded-full px-2.5 py-0.5">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            {(pendingDonations + pendingBeneficiaries) > 0 && (
              <span className="text-xs bg-destructive/15 text-destructive border border-destructive/30 rounded-full px-2.5 py-0.5 font-medium">
                {pendingDonations + pendingBeneficiaries} pendientes
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tight">
            Panel de gestión
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Fondo solidario · revisión y aprobación de registros</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <KpiCard
            label="Total confirmado"
            value={`$${confirmedTotal.toLocaleString('es-CL')}`}
            sub="CLP verificado"
            variant="primary"
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
            sub="requieren acción"
            variant="warning"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            {/* Tabs + search row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <TabsList className="h-10 bg-muted border border-border shrink-0">
                <TabsTrigger
                  value="donations"
                  className="h-full text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-1.5"
                >
                  Donaciones
                  {pendingDonations > 0 && (
                    <span className="bg-destructive text-white text-[10px] rounded-full px-1.5 py-px leading-none">{pendingDonations}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="beneficiaries"
                  className="h-full text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-1.5"
                >
                  Beneficiarios
                  {pendingBeneficiaries > 0 && (
                    <span className="bg-destructive text-white text-[10px] rounded-full px-1.5 py-px leading-none">{pendingBeneficiaries}</span>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar nombre, canal, teléfono…"
                    className="h-10 pl-9 bg-card border-border text-sm placeholder:text-muted-foreground"
                  />
                </div>
                <div className="relative shrink-0">
                  <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="h-10 pl-8 pr-3 rounded-lg bg-card border border-border text-sm text-foreground cursor-pointer appearance-none focus:outline-none focus:border-primary/60"
                  >
                    <option value="date_desc">Más reciente</option>
                    <option value="date_asc">Más antiguo</option>
                    <option value="amount_desc">Mayor monto</option>
                    <option value="name_asc">Nombre A–Z</option>
                  </select>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground cursor-pointer appearance-none focus:outline-none focus:border-primary/60 shrink-0"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendientes</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="verified">Verificados</option>
                  <option value="helped">Ayudados</option>
                  <option value="rejected">Rechazados</option>
                </select>
              </div>
            </div>

            <TabsContent value="donations">
              {filteredDonations.length === 0 && (
                <EmptyState text={search || filterStatus !== 'all' ? 'Sin resultados para los filtros aplicados.' : 'No hay donaciones aún.'} />
              )}
              {(['pending', 'confirmed', 'rejected'] as DonationStatus[]).map((sg) => {
                const group = filteredDonations.filter((d) => d.status === sg)
                if (!group.length) return null
                const labels = { pending: 'Por verificar', confirmed: 'Confirmadas', rejected: 'Rechazadas' }
                return (
                  <div key={sg} className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      {labels[sg]} <span className="text-primary">({group.length})</span>
                    </p>
                    <div className="space-y-2">
                      {group.map((d) => <DonationRow key={d.id} donation={d} onUpdate={updateDonation} />)}
                    </div>
                  </div>
                )
              })}
            </TabsContent>

            <TabsContent value="beneficiaries">
              {filteredBeneficiaries.length === 0 && (
                <EmptyState text={search || filterStatus !== 'all' ? 'Sin resultados para los filtros aplicados.' : 'No hay solicitudes aún.'} />
              )}
              {(['pending', 'verified', 'helped', 'rejected'] as BeneficiaryStatus[]).map((sg) => {
                const group = filteredBeneficiaries.filter((b) => b.status === sg)
                if (!group.length) return null
                const labels = {
                  pending: 'Por verificar',
                  verified: 'Verificados — listos para recibir ayuda',
                  helped: 'Ayuda entregada',
                  rejected: 'Rechazados',
                }
                return (
                  <div key={sg} className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      {labels[sg]} <span className="text-primary">({group.length})</span>
                    </p>
                    <div className="space-y-2">
                      {group.map((b) => <BeneficiaryRow key={b.id} beneficiary={b} onUpdate={updateBeneficiary} />)}
                    </div>
                  </div>
                )
              })}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

function DonationRow({ donation: d, onUpdate }: { donation: Donation; onUpdate: (id: string, s: DonationStatus) => void }) {
  const displayName = d.isAnonymous ? 'Anónimo' : (d.donor ?? 'Sin nombre')
  const date = new Date(d.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      d.status === 'pending'
        ? 'border-warning/40 bg-warning/5'
        : d.status === 'confirmed'
        ? 'border-border bg-card'
        : 'border-border bg-card opacity-50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-foreground">{displayName}</span>
            <StatusBadge status={d.status} />
            <span className="text-xs text-muted-foreground">{d.channel}</span>
          </div>
          <p className="font-score text-2xl text-primary tabular-nums">
            {d.currency === 'CLP' ? `$${d.amount.toLocaleString('es-CL')}` : `${d.currency} ${d.amount}`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
          {d.message && <p className="text-xs text-muted-foreground italic mt-1">"{d.message}"</p>}
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          {d.status === 'pending' && (
            <>
              <Button size="sm" onClick={() => onUpdate(d.id, 'confirmed')}
                className="bg-success hover:bg-success/90 text-white text-xs h-8 cursor-pointer">
                <CheckCircle className="w-3 h-3 mr-1" />Confirmar
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUpdate(d.id, 'rejected')}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs h-8 cursor-pointer">
                <XCircle className="w-3 h-3 mr-1" />Rechazar
              </Button>
            </>
          )}
          {d.proofUrl && (
            <a href={d.proofUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="text-xs h-8 cursor-pointer text-muted-foreground hover:text-foreground">
                <Eye className="w-3 h-3 mr-1" />Comprobante
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function BeneficiaryRow({ beneficiary: b, onUpdate }: { beneficiary: Beneficiary; onUpdate: (id: string, s: BeneficiaryStatus) => void }) {
  const date = new Date(b.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      b.status === 'pending'  ? 'border-warning/40 bg-warning/5'
      : b.status === 'verified' ? 'border-info/30 bg-info/5'
      : b.status === 'helped'   ? 'border-success/30 bg-success/5'
      : 'border-border bg-card opacity-50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-foreground">{b.firstName} {b.lastName}</span>
            <StatusBadge status={b.status} />
            {b.hasMinors && <span className="text-[10px] bg-info/15 text-info border border-info/25 px-1.5 py-0.5 rounded-full">menores</span>}
            {b.hasElders && <span className="text-[10px] bg-warning/15 text-warning border border-warning/25 px-1.5 py-0.5 rounded-full">adultos mayores</span>}
          </div>
          <p className="text-xs text-muted-foreground">{b.state} · {b.householdSize} personas · {b.situation}</p>
          <p className="text-xs text-muted-foreground">{b.cedula ?? 'Sin cédula'} · {b.phone}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          {b.status === 'pending' && (
            <>
              <Button size="sm" onClick={() => onUpdate(b.id, 'verified')}
                className="bg-info hover:bg-info/90 text-white text-xs h-8 cursor-pointer">
                <CheckCircle className="w-3 h-3 mr-1" />Verificar
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUpdate(b.id, 'rejected')}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs h-8 cursor-pointer">
                <XCircle className="w-3 h-3 mr-1" />Rechazar
              </Button>
            </>
          )}
          {b.status === 'verified' && (
            <Button size="sm" onClick={() => onUpdate(b.id, 'helped')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8 cursor-pointer">
              <Send className="w-3 h-3 mr-1" />Ayuda enviada
            </Button>
          )}
          {b.status === 'helped' && (
            <span className="text-xs text-success flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />Completado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, variant, icon }: {
  label: string; value: string; sub: string; variant?: 'primary' | 'warning'; icon: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border p-4 ${
      variant === 'primary' ? 'border-primary/30 bg-primary/8'
      : variant === 'warning' ? 'border-warning/30 bg-warning/5'
      : 'border-border bg-card'
    }`}>
      <div className={`mb-2 ${variant === 'primary' ? 'text-primary' : variant === 'warning' ? 'text-warning' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <p className={`font-score text-2xl tabular-nums ${variant === 'primary' ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; cls: string }> = {
    pending:   { label: 'Pendiente',  cls: 'bg-warning/15 text-warning border-warning/30' },
    confirmed: { label: 'Confirmada', cls: 'bg-success/15 text-success border-success/30' },
    rejected:  { label: 'Rechazada',  cls: 'bg-destructive/15 text-destructive border-destructive/30' },
    verified:  { label: 'Verificado', cls: 'bg-info/15 text-info border-info/30' },
    helped:    { label: 'Ayudado',    cls: 'bg-success/15 text-success border-success/30' },
  }
  const c = configs[status] ?? { label: status, cls: 'bg-muted text-muted-foreground border-border' }
  return (
    <span className={`text-[10px] font-semibold px-2 py-px rounded-full border ${c.cls}`}>{c.label}</span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground text-sm">{text}</div>
  )
}
