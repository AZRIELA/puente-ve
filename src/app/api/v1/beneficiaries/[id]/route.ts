import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json()

  if (!['pending', 'verified', 'helped', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  await db.execute({
    sql: `UPDATE Beneficiary SET status = ?, updatedAt = ? WHERE id = ?`,
    args: [status, new Date().toISOString(), id],
  })

  return NextResponse.json({ id, status })
}
