import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const userSession = await getCurrentUser(req)
    if (!userSession) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const result = await db.execute({
      sql: 'SELECT * FROM User WHERE id = ? LIMIT 1',
      args: [userSession.userId],
    })
    const user = result.rows[0]

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const isMatch = verifyPassword(currentPassword, user.passwordHash as string)
    if (!isMatch) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })
    }

    const newHash = hashPassword(newPassword)
    await db.execute({
      sql: 'UPDATE User SET passwordHash = ?, updatedAt = ? WHERE id = ?',
      args: [newHash, new Date().toISOString(), userSession.userId],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
