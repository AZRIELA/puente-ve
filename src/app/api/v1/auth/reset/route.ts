import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const result = await db.execute({
      sql: 'SELECT * FROM User WHERE resetToken = ? LIMIT 1',
      args: [token],
    })
    const user = result.rows[0]

    if (!user) {
      return NextResponse.json({ error: 'Token de recuperación inválido o expirado' }, { status: 400 })
    }

    const expiresStr = user.resetTokenExpires as string
    if (expiresStr) {
      const expires = new Date(expiresStr)
      if (Date.now() > expires.getTime()) {
        return NextResponse.json({ error: 'Token de recuperación expirado' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Token de recuperación inválido' }, { status: 400 })
    }

    const newHash = hashPassword(newPassword)
    await db.execute({
      sql: 'UPDATE User SET passwordHash = ?, resetToken = NULL, resetTokenExpires = NULL, updatedAt = ? WHERE id = ?',
      args: [newHash, new Date().toISOString(), user.id],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
