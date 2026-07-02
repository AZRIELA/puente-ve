import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

import { verifyAdminRequest } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const { status } = await req.json()

  if (!['pending', 'confirmed', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  await db.execute({
    sql: `UPDATE Donation SET status = ?, updatedAt = ? WHERE id = ?`,
    args: [status, new Date().toISOString(), id],
  })

  return NextResponse.json({ id, status })
}
