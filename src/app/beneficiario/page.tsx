'use client'

import { useState } from 'react'
import { Users, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BackNav } from '@/components/shared/BackNav'

type Step = 'info' | 'situation' | 'contact' | 'success'

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

export default function BeneficiarioPage() {
  const [step, setStep] = useState<Step>('info')

  // Step 1
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [cedula, setCedula] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')

  // Step 2
  const [situation, setSituation] = useState('')
  const [householdSize, setHouseholdSize] = useState('')
  const [hasMinors, setHasMinors] = useState(false)
  const [hasElders, setHasElders] = useState(false)
  const [details, setDetails] = useState('')

  // Step 3
  const [phone, setPhone] = useState('')
  const [altPhone, setAltPhone] = useState('')
  const [usdtWallet, setUsdtWallet] = useState('')

  const step1Valid = firstName.trim() && lastName.trim() && state
  const step2Valid = situation && householdSize
  const step3Valid = phone.trim().length >= 8
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/v1/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, cedula: cedula || null, state, city: city || null,
          situation, householdSize, hasMinors, hasElders, details: details || null,
          phone, altPhone: altPhone || null, usdtWallet: usdtWallet || null,
        }),
      })
      if (!res.ok) throw new Error()
      setStep('success')
    } catch {
      setSubmitError('Error al enviar. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-dvh flex flex-col pb-10">
      <BackNav />

      <div className="flex-1 flex flex-col items-center px-5 pt-28 max-w-lg mx-auto w-full">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(['info', 'situation', 'contact'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                step === s ? 'bg-[oklch(0.82_0.16_85)] scale-125'
                : ['situation', 'contact', 'success'].indexOf(step) > i ? 'bg-[oklch(0.78_0.09_72/0.6)]'
                : 'bg-[oklch(0.25_0.04_255)]'
              }`} />
              {i < 2 && <div className="w-8 h-px bg-[oklch(0.25_0.04_255)]" />}
            </div>
          ))}
        </div>

        {/* Aviso de confianza */}
        {step !== 'success' && (
          <div className="w-full rounded-xl border border-[oklch(0.62_0.18_255/0.3)] bg-[oklch(0.62_0.18_255/0.06)] p-4 flex gap-3 mb-6">
            <AlertCircle className="w-4 h-4 text-[oklch(0.62_0.18_255)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[oklch(0.55_0.015_255)] leading-relaxed">
              Tus datos son confidenciales. Solo el equipo verificador los verá. No se publican en ningún lugar.
            </p>
          </div>
        )}

        {/* STEP 1: Datos personales */}
        {step === 'info' && (
          <div className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h1 className="font-display font-bold text-4xl uppercase">Tus datos</h1>
              <p className="text-[oklch(0.55_0.015_255)] mt-2 text-sm">Necesitamos verificar tu identidad para procesar tu solicitud.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nombre" value={firstName} onChange={setFirstName} placeholder="Ana" />
              <FormField label="Apellido" value={lastName} onChange={setLastName} placeholder="González" />
            </div>

            <FormField
              label="Cédula de identidad"
              value={cedula}
              onChange={setCedula}
              placeholder="V-12345678"
              hint="Si perdiste tus documentos, déjalo vacío y explícalo abajo."
            />

            <div>
              <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">Estado</Label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.82_0.16_85)] transition-colors cursor-pointer"
              >
                <option value="">Selecciona tu estado</option>
                {VENEZUELA_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <FormField label="Ciudad / Municipio" value={city} onChange={setCity} placeholder="Ej: Guarenas" />

            <Button
              onClick={() => setStep('situation')}
              disabled={!step1Valid}
              className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold text-base h-12 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-40"
            >
              Siguiente →
            </Button>
          </div>
        )}

        {/* STEP 2: Situación */}
        {step === 'situation' && (
          <div className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h1 className="font-display font-bold text-4xl uppercase">Tu situación</h1>
              <p className="text-[oklch(0.55_0.015_255)] mt-2 text-sm">Esto nos ayuda a priorizar la ayuda correctamente.</p>
            </div>

            <div className="space-y-3">
              {SITUATIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSituation(s.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer active:scale-[0.98] ${
                    situation === s.id
                      ? 'border-[oklch(0.82_0.16_85)] bg-[oklch(0.82_0.16_85/0.08)]'
                      : 'border-[oklch(0.25_0.04_255)] hover:border-[oklch(0.82_0.16_85/0.3)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${situation === s.id ? 'border-[oklch(0.82_0.16_85)]' : 'border-[oklch(0.55_0.015_255)]'}`}>
                      {situation === s.id && <div className="w-2 h-2 rounded-full bg-[oklch(0.82_0.16_85)]" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{s.label}</p>
                      <p className="text-xs text-[oklch(0.55_0.015_255)]">{s.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div>
              <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">Personas en el hogar</Label>
              <div className="grid grid-cols-5 gap-2">
                {['1', '2', '3', '4', '5+'].map((n) => (
                  <button
                    key={n}
                    onClick={() => setHouseholdSize(n)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer active:scale-[0.96] ${
                      householdSize === n
                        ? 'border-[oklch(0.82_0.16_85)] bg-[oklch(0.78_0.09_72/0.1)] text-[oklch(0.82_0.16_85)]'
                        : 'border-[oklch(0.25_0.04_255)] hover:border-[oklch(0.82_0.16_85/0.3)]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <CheckOption label="Hay menores de edad en el hogar" checked={hasMinors} onChange={setHasMinors} />
              <CheckOption label="Hay personas mayores o con discapacidad" checked={hasElders} onChange={setHasElders} />
            </div>

            <div>
              <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">Describe brevemente tu situación (opcional)</Label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Cuéntanos qué pasó y qué necesitas..."
                rows={3}
                className="w-full rounded-xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.82_0.16_85)] resize-none transition-colors"
              />
            </div>

            <Button
              onClick={() => setStep('contact')}
              disabled={!step2Valid}
              className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold text-base h-12 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-40"
            >
              Siguiente →
            </Button>
            <button onClick={() => setStep('info')} className="w-full text-sm text-[oklch(0.55_0.015_255)] hover:text-foreground transition-colors cursor-pointer">
              ← Volver
            </button>
          </div>
        )}

        {/* STEP 3: Contacto */}
        {step === 'contact' && (
          <div className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h1 className="font-display font-bold text-4xl uppercase">Contacto</h1>
              <p className="text-[oklch(0.55_0.015_255)] mt-2 text-sm">Para avisarte cuando la ayuda esté lista para enviarse.</p>
            </div>

            <FormField
              label="WhatsApp (con código de país)"
              value={phone}
              onChange={setPhone}
              placeholder="+58 412 1234567"
              hint="Este número solo lo usaremos para coordinarte la ayuda."
            />

            <FormField
              label="Otro teléfono / contacto alternativo (opcional)"
              value={altPhone}
              onChange={setAltPhone}
              placeholder="+58 414 xxxxxxx o email"
            />

            <FormField
              label="Dirección USDT TRC-20 (opcional)"
              value={usdtWallet}
              onChange={setUsdtWallet}
              placeholder="TRxxxxxxxxxxxxxxxxxx"
              hint="Si tienes wallet cripto podemos enviarte directamente. Si no, lo coordinamos por otro medio."
            />

            {submitError && <p className="text-sm text-[oklch(0.58_0.22_25)]">{submitError}</p>}
            <Button
              onClick={handleSubmit}
              disabled={!step3Valid || submitting}
              className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold text-base h-12 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {submitting ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
            <button onClick={() => setStep('situation')} className="w-full text-sm text-[oklch(0.55_0.015_255)] hover:text-foreground transition-colors cursor-pointer">
              ← Volver
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="w-full flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-[oklch(0.82_0.16_85/0.12)] border border-[oklch(0.82_0.16_85/0.3)] flex items-center justify-center ve-glow">
              <Users className="w-10 h-10 text-[oklch(0.82_0.16_85)]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-4xl uppercase">Solicitud enviada</h1>
              <p className="text-[oklch(0.55_0.015_255)] mt-3 text-base leading-relaxed max-w-sm">
                Recibimos tu información. Nuestro equipo te contactará a tu WhatsApp en las próximas 24–48 horas para verificar y coordinar la ayuda.
              </p>
            </div>
            <div className="rounded-2xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] p-5 w-full text-left">
              <p className="text-xs text-[oklch(0.55_0.015_255)] uppercase tracking-widest mb-3">Estado de tu solicitud</p>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[oklch(0.75_0.15_70)] animate-pulse" />
                <span className="text-sm font-semibold">En verificación</span>
              </div>
              <p className="text-xs text-[oklch(0.55_0.015_255)] mt-2">
                {firstName} {lastName} · {VENEZUELA_STATES.find(s => s === state) || state}
              </p>
            </div>
            <div className="rounded-2xl border border-[oklch(0.62_0.18_255/0.3)] bg-[oklch(0.62_0.18_255/0.06)] p-4 w-full">
              <p className="text-xs text-[oklch(0.55_0.015_255)] leading-relaxed">
                <strong className="text-foreground">Guarda este mensaje.</strong> Si no te contactamos en 48h, escríbenos a nuestro WhatsApp de soporte.
              </p>
            </div>
            <a href="/" className="w-full">
              <Button variant="outline" className="w-full border-[oklch(0.25_0.04_255)] cursor-pointer">
                Volver al inicio
              </Button>
            </a>
          </div>
        )}
      </div>
    </main>
  )
}

function FormField({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; hint?: string
}) {
  return (
    <div>
      <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[oklch(0.14_0.025_255)] border-[oklch(0.25_0.04_255)] focus:border-[oklch(0.82_0.16_85)]"
      />
      {hint && <p className="text-[10px] text-[oklch(0.55_0.015_255)] mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}

function CheckOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 cursor-pointer accent-[oklch(0.82_0.16_85)]"
      />
      <span className="text-sm">{label}</span>
    </label>
  )
}
