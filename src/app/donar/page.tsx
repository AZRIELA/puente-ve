'use client'

import { useState } from 'react'
import { CheckCircle, Copy, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { BackNav } from '@/components/shared/BackNav'

type Channel = 'global66' | 'transfer' | 'wise' | 'usdt'
type Currency = 'CLP' | 'USD'
type Step = 'amount' | 'channel' | 'proof' | 'success'

const GLOBAL66_ACCOUNT = {
  titular: 'Feluis Enrique Liendo Echenique',
  rut: '25.837.311-1',
  banco: 'Global66 / Credicorp',
  tipo: 'Cuenta Vista',
  cuenta: '14090294',
  email: 'adrymcs@gmail.com',
}
const BANK_ACCOUNT = {
  titular: 'Feluis Enrique Liendo Echenique',
  rut: '25.837.311-1',
  banco: 'Global66 / Credicorp',
  tipo: 'Cuenta Vista',
  cuenta: '14090294',
  email: 'adrymcs@gmail.com',
}
const USDT_ADDRESS = 'TRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
const WISE_ACCOUNT = {
  email: 'fondopuenteve@gmail.com',
  usd: 'ACH / Wire: solicitar al equipo',
  eur: 'IBAN: solicitar al equipo',
}

const AMOUNTS_CLP = [2000, 5000, 10000, 25000, 50000]
const AMOUNTS_USD = [2, 5, 10, 25, 50]

export default function DonarPage() {
  const [step, setStep] = useState<Step>('amount')
  const [currency, setCurrency] = useState<Currency>('CLP')
  const [amount, setAmount] = useState('')
  const [channel, setChannel] = useState<Channel>('global66')
  const [donorName, setDonorName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [copied, setCopied] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const parsedAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setProofFile(file)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      let proofUrl: string | undefined

      if (proofFile) {
        const form = new FormData()
        form.append('file', proofFile)
        const uploadRes = await fetch('/api/v1/upload', { method: 'POST', body: form })
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          proofUrl = data.url
        }
      }

      const res = await fetch('/api/v1/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor: isAnonymous ? null : donorName || null,
          isAnonymous,
          amount: parsedAmount,
          currency,
          channel,
          message: message || null,
          proofUrl,
        }),
      })

      if (!res.ok) throw new Error('Error al registrar la donación')
      setStep('success')
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-dvh flex flex-col pb-10">
      <BackNav />

      <div className="flex-1 flex flex-col items-center px-5 pt-28 max-w-lg mx-auto w-full">
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-10">
          {(['amount', 'channel', 'proof'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'bg-[oklch(0.82_0.16_85)] scale-125'
                    : ['channel', 'proof', 'success'].indexOf(step) > i
                    ? 'bg-[oklch(0.78_0.09_72/0.6)]'
                    : 'bg-[oklch(0.25_0.04_255)]'
                }`}
              />
              {i < 2 && <div className="w-8 h-px bg-[oklch(0.25_0.04_255)]" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Monto */}
        {step === 'amount' && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h1 className="font-display font-bold text-4xl uppercase">¿Cuánto quieres donar?</h1>
              <p className="text-[oklch(0.55_0.015_255)] mt-2 text-sm">Elige la moneda y el monto. Cada peso cuenta.</p>
            </div>

            {/* Currency toggle */}
            <div className="flex rounded-xl overflow-hidden border border-[oklch(0.25_0.04_255)] w-fit">
              {(['CLP', 'USD'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCurrency(c); setAmount('') }}
                  className={`px-6 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    currency === c
                      ? 'bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)]'
                      : 'text-[oklch(0.55_0.015_255)] hover:text-foreground'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-3 gap-3">
              {(currency === 'CLP' ? AMOUNTS_CLP : AMOUNTS_USD).map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer active:scale-[0.96] ${
                    amount === String(a)
                      ? 'border-[oklch(0.82_0.16_85)] bg-[oklch(0.78_0.09_72/0.1)] text-[oklch(0.82_0.16_85)]'
                      : 'border-[oklch(0.25_0.04_255)] hover:border-[oklch(0.82_0.16_85/0.3)]'
                  }`}
                >
                  {currency === 'CLP' ? `$${a.toLocaleString('es-CL')}` : `USD ${a}`}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div>
              <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">O ingresa un monto personalizado</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[oklch(0.55_0.015_255)] text-sm">
                  {currency === 'CLP' ? '$' : 'USD'}
                </span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="pl-10 bg-[oklch(0.14_0.025_255)] border-[oklch(0.25_0.04_255)] focus:border-[oklch(0.82_0.16_85)] text-lg tabular"
                />
              </div>
            </div>

            <Button
              onClick={() => setStep('channel')}
              disabled={!parsedAmount || parsedAmount <= 0}
              className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold text-base h-12 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-40"
            >
              Continuar →
            </Button>
          </div>
        )}

        {/* STEP 2: Canal de pago */}
        {step === 'channel' && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h1 className="font-display font-bold text-4xl uppercase">¿Cómo quieres enviar?</h1>
              <p className="text-[oklch(0.55_0.015_255)] mt-2 text-sm">
                Donarás{' '}
                <span className="text-[oklch(0.82_0.16_85)] font-semibold">
                  {currency === 'CLP' ? `$${parsedAmount.toLocaleString('es-CL')} CLP` : `USD ${parsedAmount}`}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <ChannelCard
                id="global66"
                selected={channel}
                onSelect={setChannel}
                title="Global66"
                badge="Recomendado"
                desc="Envía desde tu cuenta Global66. Rápido, sin comisión."
              />
              <ChannelCard
                id="transfer"
                selected={channel}
                onSelect={setChannel}
                title="Transferencia bancaria"
                desc="Cualquier banco chileno. Sin costo."
              />
              <ChannelCard
                id="wise"
                selected={channel}
                onSelect={setChannel}
                title="Wise"
                badge="EEUU · Europa"
                desc="Transferencia bancaria internacional. Comisión ~1%. 80 países."
              />
              <ChannelCard
                id="usdt"
                selected={channel}
                onSelect={setChannel}
                title="USDT (TRC-20)"
                desc="Cripto desde cualquier país. Fee menor a $0.01."
              />
            </div>

            {/* Instrucciones según canal */}
            <div className="rounded-2xl border border-[oklch(0.82_0.16_85/0.3)] bg-[oklch(0.82_0.16_85/0.07)] p-5 space-y-3">
              <p className="text-xs uppercase tracking-widest text-[oklch(0.82_0.16_85)] font-semibold mb-3">Instrucciones de pago</p>

              {channel === 'global66' && (
                <div className="space-y-3">
                  <p className="text-sm text-[oklch(0.55_0.015_255)]">Abre tu app Global66 → Enviar → usa estos datos:</p>
                  <CopyRow label="Titular" value={GLOBAL66_ACCOUNT.titular} copied={copied} onCopy={copyText} id="g66titular" />
                  <CopyRow label="RUT" value={GLOBAL66_ACCOUNT.rut} copied={copied} onCopy={copyText} id="g66rut" />
                  <CopyRow label="Banco" value={GLOBAL66_ACCOUNT.banco} copied={copied} onCopy={copyText} id="g66banco" />
                  <CopyRow label="Tipo de cuenta" value={GLOBAL66_ACCOUNT.tipo} copied={copied} onCopy={copyText} id="g66tipo" />
                  <CopyRow label="N° de cuenta" value={GLOBAL66_ACCOUNT.cuenta} copied={copied} onCopy={copyText} id="g66cuenta" />
                  <CopyRow label="Email" value={GLOBAL66_ACCOUNT.email} copied={copied} onCopy={copyText} id="g66email" />
                </div>
              )}

              {channel === 'transfer' && (
                <div className="space-y-3">
                  <CopyRow label="Titular" value={BANK_ACCOUNT.titular} copied={copied} onCopy={copyText} id="btitular" />
                  <CopyRow label="RUT" value={BANK_ACCOUNT.rut} copied={copied} onCopy={copyText} id="brut" />
                  <CopyRow label="Banco" value={BANK_ACCOUNT.banco} copied={copied} onCopy={copyText} id="bbanco" />
                  <CopyRow label="Tipo de cuenta" value={BANK_ACCOUNT.tipo} copied={copied} onCopy={copyText} id="btipo" />
                  <CopyRow label="N° de cuenta" value={BANK_ACCOUNT.cuenta} copied={copied} onCopy={copyText} id="bcuenta" />
                  <CopyRow label="Email" value={BANK_ACCOUNT.email} copied={copied} onCopy={copyText} id="bemail" />
                </div>
              )}

              {channel === 'wise' && (
                <div className="space-y-3">
                  <p className="text-sm text-[oklch(0.55_0.015_255)]">Abre Wise → Enviar dinero → busca este email:</p>
                  <CopyRow label="Email Wise" value={WISE_ACCOUNT.email} copied={copied} onCopy={copyText} id="wise-email" />
                  <p className="text-xs text-[oklch(0.55_0.015_255)] pt-1">Si necesitas datos bancarios USD o EUR (ACH / IBAN) escríbenos por WhatsApp y te los damos en minutos.</p>
                </div>
              )}

              {channel === 'usdt' && (
                <div className="space-y-3">
                  <p className="text-sm text-[oklch(0.55_0.015_255)]">Red: TRC-20 (TRON). No uses otra red.</p>
                  <CopyRow label="Dirección USDT" value={USDT_ADDRESS} copied={copied} onCopy={copyText} id="usdt" />
                </div>
              )}
            </div>

            <Button
              onClick={() => setStep('proof')}
              className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold text-base h-12 cursor-pointer active:scale-[0.98] transition-all"
            >
              Ya envié el dinero →
            </Button>

            <button
              onClick={() => setStep('amount')}
              className="w-full text-sm text-[oklch(0.55_0.015_255)] hover:text-foreground transition-colors cursor-pointer"
            >
              ← Cambiar monto
            </button>
          </div>
        )}

        {/* STEP 3: Comprobante */}
        {step === 'proof' && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h1 className="font-display font-bold text-4xl uppercase">Sube tu comprobante</h1>
              <p className="text-[oklch(0.55_0.015_255)] mt-2 text-sm">
                Esto nos permite confirmar tu aporte y registrarlo en el fondo.
              </p>
            </div>

            {/* Upload area */}
            <label className="block cursor-pointer">
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
              <div
                className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                  proofFile
                    ? 'border-[oklch(0.82_0.16_85)] bg-[oklch(0.82_0.16_85/0.07)]'
                    : 'border-[oklch(0.25_0.04_255)] hover:border-[oklch(0.82_0.16_85/0.3)]'
                }`}
              >
                {proofFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-[oklch(0.82_0.16_85)]" />
                    <p className="text-sm font-medium">{proofFile.name}</p>
                    <button
                      onClick={(e) => { e.preventDefault(); setProofFile(null) }}
                      className="text-xs text-[oklch(0.55_0.015_255)] hover:text-[oklch(0.58_0.22_25)] flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Quitar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-[oklch(0.55_0.015_255)]" />
                    <p className="text-sm text-[oklch(0.55_0.015_255)]">Toca para subir imagen o PDF</p>
                  </div>
                )}
              </div>
            </label>

            {/* Datos opcionales */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="anon"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-[oklch(0.82_0.16_85)]"
                />
                <Label htmlFor="anon" className="text-sm cursor-pointer">Donar de forma anónima</Label>
              </div>

              {!isAnonymous && (
                <div>
                  <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">Tu nombre (opcional)</Label>
                  <Input
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Ej: María González"
                    className="bg-[oklch(0.14_0.025_255)] border-[oklch(0.25_0.04_255)] focus:border-[oklch(0.82_0.16_85)]"
                  />
                </div>
              )}

              <div>
                <Label className="text-xs text-[oklch(0.55_0.015_255)] mb-2 block">Mensaje para las familias (opcional)</Label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Un mensaje de aliento..."
                  rows={3}
                  className="w-full rounded-xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.82_0.16_85)] resize-none transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-sm text-[oklch(0.58_0.22_25)]">{error}</p>}
            <Button
              onClick={handleSubmit}
              disabled={!proofFile || submitting}
              className="w-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.10_0.025_255)] hover:bg-[oklch(0.90_0.14_85)] font-bold text-base h-12 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {submitting ? 'Enviando...' : 'Registrar donación'}
            </Button>

            <button
              onClick={() => setStep('channel')}
              className="w-full text-sm text-[oklch(0.55_0.015_255)] hover:text-foreground transition-colors cursor-pointer"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* STEP 4: Éxito */}
        {step === 'success' && (
          <div className="w-full flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-[oklch(0.82_0.16_85/0.12)] border border-[oklch(0.82_0.16_85/0.3)] flex items-center justify-center ve-glow">
              <CheckCircle className="w-10 h-10 text-[oklch(0.82_0.16_85)]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-4xl uppercase">¡Gracias!</h1>
              <p className="text-[oklch(0.55_0.015_255)] mt-3 text-base leading-relaxed max-w-sm">
                Tu donación fue registrada. La verificaremos en las próximas horas y quedará visible en el fondo.
              </p>
            </div>
            <div className="rounded-2xl border border-[oklch(0.25_0.04_255)] bg-[oklch(0.14_0.025_255)] p-5 w-full text-left space-y-2">
              <p className="text-xs text-[oklch(0.55_0.015_255)] uppercase tracking-widest">Resumen</p>
              <p className="font-score text-3xl text-[oklch(0.82_0.16_85)]">
                {currency === 'CLP' ? `$${parsedAmount.toLocaleString('es-CL')} CLP` : `USD ${parsedAmount}`}
              </p>
              <p className="text-sm text-[oklch(0.55_0.015_255)]">
                {isAnonymous ? 'Anónimo' : donorName || 'Sin nombre'} · {{ global66: 'Global66', transfer: 'Transferencia', wise: 'Wise', usdt: 'USDT' }[channel]}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <a
                href={`https://wa.me/?text=Doné%20al%20Fondo%20Puente%20VE%20para%20familias%20venezolanas%20damnificadas.%20Súmate%20en%20puenteve.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-[oklch(0.64_0.17_145)] text-white hover:bg-[oklch(0.58_0.17_145)] font-bold cursor-pointer">
                  Compartir en WhatsApp
                </Button>
              </a>
              <a href="/fondo" className="w-full">
                <Button variant="outline" className="w-full border-[oklch(0.25_0.04_255)] cursor-pointer">
                  Ver el fondo
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function ChannelCard({
  id, selected, onSelect, title, badge, desc,
}: {
  id: Channel; selected: Channel; onSelect: (c: Channel) => void
  title: string; badge?: string; desc: string
}) {
  const isSelected = selected === id
  return (
    <button
      onClick={() => onSelect(id)}
      className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer active:scale-[0.98] ${
        isSelected
          ? 'border-[oklch(0.82_0.16_85)] bg-[oklch(0.82_0.16_85/0.08)]'
          : 'border-[oklch(0.25_0.04_255)] hover:border-[oklch(0.82_0.16_85/0.3)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            isSelected ? 'border-[oklch(0.82_0.16_85)]' : 'border-[oklch(0.55_0.015_255)]'
          }`}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-[oklch(0.82_0.16_85)]" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{title}</span>
            {badge && (
              <Badge className="bg-[oklch(0.82_0.16_85/0.12)] text-[oklch(0.82_0.16_85)] border-[oklch(0.82_0.16_85/0.3)] text-[10px] px-2 py-0">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-[oklch(0.55_0.015_255)] mt-0.5">{desc}</p>
        </div>
      </div>
    </button>
  )
}

function CopyRow({
  label, value, copied, onCopy, id,
}: {
  label: string; value: string; copied: string; onCopy: (v: string, k: string) => void; id: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] text-[oklch(0.55_0.015_255)] uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, id)}
        className="flex-shrink-0 p-2 rounded-lg border border-[oklch(0.25_0.04_255)] hover:border-[oklch(0.82_0.16_85/0.3)] transition-colors cursor-pointer"
      >
        {copied === id ? (
          <CheckCircle className="w-4 h-4 text-[oklch(0.64_0.17_145)]" />
        ) : (
          <Copy className="w-4 h-4 text-[oklch(0.55_0.015_255)]" />
        )}
      </button>
    </div>
  )
}
