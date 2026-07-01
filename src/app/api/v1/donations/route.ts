import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createId } from '@paralleldrive/cuid2'

export async function GET() {
  const result = await db.execute('SELECT * FROM Donation ORDER BY createdAt DESC')
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { donor, isAnonymous, amount, currency, channel, message, proofUrl } = body

  if (!amount || !currency || !channel) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const id = createId()
  const now = new Date().toISOString()

  await db.execute({
    sql: `INSERT INTO Donation (id, donor, isAnonymous, amount, currency, channel, message, proofUrl, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    args: [
      id,
      isAnonymous ? null : (donor ?? null),
      isAnonymous ? 1 : 0,
      parseFloat(amount),
      currency,
      channel,
      message ?? null,
      proofUrl ?? null,
      now,
      now,
    ],
  })

  return NextResponse.json({ id, status: 'pending' }, { status: 201 })
}
