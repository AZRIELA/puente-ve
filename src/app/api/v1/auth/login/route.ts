import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass = process.env.ADMIN_PASSWORD
    
    if (!adminEmail || !adminPass) {
      return NextResponse.json({ error: 'Servidor no configurado correctamente' }, { status: 500 })
    }
    
    if (email === adminEmail && password === adminPass) {
      const token = await signToken({ role: 'admin', exp: Date.now() + 24 * 60 * 60 * 1000 })
      
      const response = NextResponse.json({ success: true })
      
      response.cookies.set('admin-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours in seconds
        path: '/',
      })
      
      return response
    }
    
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
