import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Falta el correo electrónico' }, { status: 400 })
    }

    const result = await db.execute({
      sql: 'SELECT * FROM User WHERE email = ? LIMIT 1',
      args: [email.toLowerCase().trim()],
    })
    const user = result.rows[0]

    if (!user) {
      console.log(`[RECUPERACIÓN] Intento para email inexistente: ${email}`)
      return NextResponse.json({ success: true })
    }

    const token = randomBytes(20).toString('hex')
    const expires = new Date(Date.now() + 3600000).toISOString() // 1 hour

    await db.execute({
      sql: 'UPDATE User SET resetToken = ?, resetTokenExpires = ?, updatedAt = ? WHERE id = ?',
      args: [token, expires, new Date().toISOString(), user.id],
    })

    console.log(`\n==================================================`)
    console.log(`[RECUPERACIÓN DE CONTRASEÑA]`)
    console.log(`Usuario: ${user.name} (${email})`)
    console.log(`Token: ${token}`)
    console.log(`Enlace de restablecimiento: http://localhost:3000/login/reset?token=${token}`)
    console.log(`==================================================\n`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
