import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createId } from '@paralleldrive/cuid2'

export async function GET() {
  const result = await db.execute('SELECT * FROM Beneficiary ORDER BY createdAt DESC')
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    firstName, lastName, cedula, state, city,
    situation, householdSize, hasMinors, hasElders,
    details, phone, altPhone, usdtWallet,
  } = body

  if (!firstName || !lastName || !state || !situation || !householdSize || !phone) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const id = createId()
  const now = new Date().toISOString()

  await db.execute({
    sql: `INSERT INTO Beneficiary
          (id, firstName, lastName, cedula, state, city, situation, householdSize,
           hasMinors, hasElders, details, phone, altPhone, usdtWallet, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    args: [
      id, firstName, lastName,
      cedula ?? null, state, city ?? null,
      situation, householdSize,
      hasMinors ? 1 : 0, hasElders ? 1 : 0,
      details ?? null, phone,
      altPhone ?? null, usdtWallet ?? null,
      now, now,
    ],
  })

  return NextResponse.json({ id, status: 'pending' }, { status: 201 })
}
