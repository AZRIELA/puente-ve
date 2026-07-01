import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
  }

  const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'El archivo supera 5 MB' }, { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
  }

  const blob = await put(`comprobantes/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  return NextResponse.json({ url: blob.url })
}
