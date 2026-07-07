import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { verifyPassword } from '@/lib/crypto'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const result = await db.execute({
      sql: 'SELECT * FROM User WHERE email = ? LIMIT 1',
      args: [email.toLowerCase().trim()],
    })

    const user = result.rows[0]

    if (!user) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    const isValid = verifyPassword(password, user.passwordHash as string)

    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })

    const response = NextResponse.json({ success: true })

    response.cookies.set('admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours in seconds
      path: '/',
    })

    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
