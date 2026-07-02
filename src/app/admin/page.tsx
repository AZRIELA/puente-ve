'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  CheckCircle, XCircle, DollarSign, Users, TrendingUp,
  Send, Eye, Search, SlidersHorizontal, LogOut, Plus, Edit, Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

type DonationStatus = 'pending' | 'confirmed' | 'rejected'
type BeneficiaryStatus = 'pending' | 'verified' | 'helped' | 'rejected'

const VENEZUELA_STATES = [
  'Caracas (Distrito Capital)', 'Miranda', 'Aragua', 'Carabobo', 'Vargas (La Guaira)',
  'Anzoátegui', 'Bolívar', 'Zulia', 'Lara', 'Táchira', 'Mérida', 'Falcón',
  'Monagas', 'Sucre', 'Barinas', 'Portuguesa', 'Cojedes', 'Yaracuy',
  'Trujillo', 'Nueva Esparta', 'Apure', 'Guárico', 'Delta Amacuro',
  'Amazonas', 'Otro',
]

const SITUATIONS = [
  { id: 'sismo', label: 'Damnificado por el sismo', desc: 'Terremoto del 24 de junio 2026' },
  { id: 'desplazado', label: 'Persona desplazada', desc: 'Perdí mi hogar y debo reubicarse' },
  { id: 'sin_acceso', label: 'Sin acceso a agua/comida', desc: 'Crisis humanitaria severa' },
  { id: 'heridos', label: 'Heridos en el hogar', desc: 'Necesito apoyo médico o medicamentos' },
]

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
  city: string | null
  situation: string
  householdSize: string
  hasMinors: boolean
  hasElders: boolean
  details: string | null
  phone: string
  altPhone: string | null
  usdtWallet: string | null
  status: BeneficiaryStatus
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

  // Dialog and form states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null)

  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formCedula, setFormCedula] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAltPhone, setFormAltPhone] = useState('')
  const [formState, setFormState] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formSituation, setFormSituation] = useState('')
  const [formHouseholdSize, setFormHouseholdSize] = useState('')
  const [formUsdtWallet, setFormUsdtWallet] = useState('')
  const [formHasMinors, setFormHasMinors] = useState(false)
  const [formHasElders, setFormHasElders] = useState(false)
  const [formDetails, setFormDetails] = useState('')
  const [formStatus, setFormStatus] = useState<BeneficiaryStatus>('pending')
  const [formSubmitting, setFormSubmitting] = useState(false)

  function handleOpenAdd() {
    setEditingBeneficiary(null)
    setFormFirstName('')
    setFormLastName('')
    setFormCedula('')
    setFormPhone('')
    setFormAltPhone('')
    setFormState('Caracas (Distrito Capital)')
    setFormCity('')
    setFormSituation('sismo')
    setFormHouseholdSize('1-2')
    setFormUsdtWallet('')
    setFormHasMinors(false)
    setFormHasElders(false)
    setFormDetails('')
    setFormStatus('pending')
    setIsDialogOpen(true)
  }

  function handleOpenEdit(b: Beneficiary) {
    setEditingBeneficiary(b)
    setFormFirstName(b.firstName)
    setFormLastName(b.lastName)
    setFormCedula(b.cedula ?? '')
    setFormPhone(b.phone)
    setFormAltPhone(b.altPhone ?? '')
    setFormState(b.state)
    setFormCity(b.city ?? '')
    setFormSituation(b.situation)
    setFormHouseholdSize(b.householdSize)
    setFormUsdtWallet(b.usdtWallet ?? '')
    setFormHasMinors(b.hasMinors)
    setFormHasElders(b.hasElders)
    setFormDetails(b.details ?? '')
    setFormStatus(b.status)
    setIsDialogOpen(true)
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormSubmitting(true)

    const payload = {
      firstName: formFirstName,
      lastName: formLastName,
      cedula: formCedula || null,
      phone: formPhone,
      altPhone: formAltPhone || null,
      state: formState,
      city: formCity || null,
      situation: formSituation,
      householdSize: formHouseholdSize,
      usdtWallet: formUsdtWallet || null,
      hasMinors: formHasMinors,
      hasElders: formHasElders,
      details: formDetails || null,
      status: formStatus,
    }

    try {
      if (editingBeneficiary) {
        const res = await fetch(`/api/v1/beneficiaries/${editingBeneficiary.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const updated = await res.json()
          setBeneficiaries((prev) => prev.map((b) => (b.id === editingBeneficiary.id ? { ...b, ...updated } : b)))
          setIsDialogOpen(false)
        }
      } else {
        const res = await fetch('/api/v1/beneficiaries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const r = await fetch('/api/v1/beneficiaries')
          if (r.ok) {
            setBeneficiaries(await r.json())
          }
          setIsDialogOpen(false)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDeleteBeneficiary(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este beneficiario permanentemente?')) return

    try {
      const res = await fetch(`/api/v1/beneficiaries/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setBeneficiaries((prev) => prev.filter((b) => b.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleLogout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
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
              <div className="flex justify-between items-center mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Solicitudes de ayuda
                </p>
                <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 cursor-pointer font-semibold gap-1">
                  <Plus className="w-4 h-4" /> Agregar Beneficiario
                </Button>
              </div>
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
                      {group.map((b) => (
                        <BeneficiaryRow
                          key={b.id}
                          beneficiary={b}
                          onUpdate={updateBeneficiary}
                          onEdit={handleOpenEdit}
                          onDelete={handleDeleteBeneficiary}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </TabsContent>
          </Tabs>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase">
                {editingBeneficiary ? 'Editar Beneficiario' : 'Agregar Beneficiario'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {editingBeneficiary ? 'Modifica los datos del registro y presiona Guardar.' : 'Completa la información para registrar una nueva familia.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Nombres *</Label>
                  <Input required value={formFirstName} onChange={e => setFormFirstName(e.target.value)} className="bg-background border-border h-9" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Apellidos *</Label>
                  <Input required value={formLastName} onChange={e => setFormLastName(e.target.value)} className="bg-background border-border h-9" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Cédula</Label>
                  <Input value={formCedula} onChange={e => setFormCedula(e.target.value)} className="bg-background border-border h-9" />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Teléfono *</Label>
                  <Input required value={formPhone} onChange={e => setFormPhone(e.target.value)} className="bg-background border-border h-9" />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Teléfono Alt</Label>
                  <Input value={formAltPhone} onChange={e => setFormAltPhone(e.target.value)} className="bg-background border-border h-9" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Estado *</Label>
                  <select value={formState} onChange={e => setFormState(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 h-9 text-sm focus:outline-none">
                    {VENEZUELA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Ciudad</Label>
                  <Input value={formCity} onChange={e => setFormCity(e.target.value)} className="bg-background border-border h-9" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Situación *</Label>
                  <select value={formSituation} onChange={e => setFormSituation(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 h-9 text-sm focus:outline-none">
                    {SITUATIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Integrantes Hogar *</Label>
                  <select value={formHouseholdSize} onChange={e => setFormHouseholdSize(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 h-9 text-sm focus:outline-none">
                    <option value="1-2">1-2 personas</option>
                    <option value="3-4">3-4 personas</option>
                    <option value="5+">5 o más personas</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Billetera USDT (TRC-20)</Label>
                <Input value={formUsdtWallet} onChange={e => setFormUsdtWallet(e.target.value)} placeholder="Dirección de wallet" className="bg-background border-border h-9" />
              </div>

              <div className="flex gap-6 py-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={formHasMinors} onChange={e => setFormHasMinors(e.target.checked)} className="rounded border-border accent-primary w-4 h-4" />
                  Tiene menores en el hogar
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={formHasElders} onChange={e => setFormHasElders(e.target.checked)} className="rounded border-border accent-primary w-4 h-4" />
                  Tiene adultos mayores
                </label>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Detalles adicionales</Label>
                <Textarea value={formDetails} onChange={e => setFormDetails(e.target.value)} rows={2} className="bg-background border-border text-sm" />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Estado de la solicitud *</Label>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value as BeneficiaryStatus)} className="w-full bg-background border border-border rounded-md px-3 h-9 text-sm focus:outline-none">
                  <option value="pending">Pendiente por verificar</option>
                  <option value="verified">Verificado (listo para ayuda)</option>
                  <option value="helped">Ayuda enviada (completado)</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={formSubmitting} className="h-10 cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" disabled={formSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10 cursor-pointer">
                  {formSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
          {d.proofUrl ? (
            <a href={d.proofUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="text-xs h-8 cursor-pointer text-muted-foreground hover:text-foreground">
                <Eye className="w-3 h-3 mr-1" />Comprobante
              </Button>
            </a>
          ) : (
            <span className="text-[10px] text-muted-foreground border border-dashed border-border rounded px-2 py-1">
              Sin comprobante
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function BeneficiaryRow({
  beneficiary: b,
  onUpdate,
  onEdit,
  onDelete,
}: {
  beneficiary: Beneficiary
  onUpdate: (id: string, s: BeneficiaryStatus) => void
  onEdit: (b: Beneficiary) => void
  onDelete: (id: string) => void
}) {
  const date = new Date(b.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      b.status === 'pending'  ? 'border-warning/40 bg-warning/5'
      : b.status === 'verified' ? 'border-info/30 bg-info/5'
      : b.status === 'helped'   ? 'border-success/30 bg-success/5'
      : 'border-border bg-card opacity-50'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <div className="flex flex-row items-center gap-3 self-end sm:self-auto">
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={() => onEdit(b)}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs h-8 cursor-pointer px-2.5">
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(b.id)}
              className="border-destructive/30 hover:bg-destructive/15 text-destructive text-xs h-8 cursor-pointer px-2.5">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div className="flex gap-1.5">
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
              <span className="text-xs text-success flex items-center gap-1 py-1">
                <CheckCircle className="w-3 h-3" />Completado
              </span>
            )}
          </div>
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
