import type { Metadata } from 'next'
import { Geist, Geist_Mono, Barlow_Condensed, Bebas_Neue } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-barlow',
})
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
})

export const metadata: Metadata = {
  title: 'Puente VE — Fondo Solidario Venezuela',
  description: 'Conectamos donantes con familias damnificadas en Venezuela. Transparente, directo y sin intermediarios.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0A09" />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} ${barlowCondensed.variable} ${bebasNeue.variable} min-h-dvh antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
