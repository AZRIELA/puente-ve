import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createId } from '@paralleldrive/cuid2'

import { verifyAdminRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
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

  const isAdmin = await verifyAdminRequest(req)
  let status = 'pending'

  if (isAdmin && body.status) {
    if (['pending', 'verified', 'helped', 'rejected'].includes(body.status)) {
      status = body.status
    }
  }

  const id = createId()
  const now = new Date().toISOString()

  await db.execute({
    sql: `INSERT INTO Beneficiary
          (id, firstName, lastName, cedula, state, city, situation, householdSize,
           hasMinors, hasElders, details, phone, altPhone, usdtWallet, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, firstName, lastName,
      cedula ?? null, state, city ?? null,
      situation, householdSize,
      hasMinors ? 1 : 0, hasElders ? 1 : 0,
      details ?? null, phone,
      altPhone ?? null, usdtWallet ?? null,
      status,
      now, now,
    ],
  })

  return NextResponse.json({ id, status }, { status: 201 })
}
