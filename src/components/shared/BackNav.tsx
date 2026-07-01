'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function BackNav({ href = '/', label = 'Inicio' }: { href?: string; label?: string }) {
  return (
    <nav className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-5 py-3 rounded-2xl glass-card max-w-5xl mx-auto">
      <Link
        href={href}
        className="flex items-center gap-2 text-sm text-[oklch(0.55_0.015_255)] hover:text-[oklch(0.82_0.16_85)] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        {label}
      </Link>
      <span className="font-display font-bold text-lg text-[oklch(0.82_0.16_85)]">Puente VE</span>
    </nav>
  )
}
