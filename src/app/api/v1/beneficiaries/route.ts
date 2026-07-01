import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const beneficiaries = await prisma.beneficiary.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(beneficiaries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    firstName, lastName, cedula, state, city,
    situation, householdSize, hasMinors, hasElders, details,
    phone, altPhone, usdtWallet,
  } = body

  if (!firstName || !lastName || !state || !situation || !householdSize || !phone) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const beneficiary = await prisma.beneficiary.create({
    data: {
      firstName,
      lastName,
      cedula: cedula ?? null,
      state,
      city: city ?? null,
      situation,
      householdSize,
      hasMinors: hasMinors ?? false,
      hasElders: hasElders ?? false,
      details: details ?? null,
      phone,
      altPhone: altPhone ?? null,
      usdtWallet: usdtWallet ?? null,
      status: 'pending',
    },
  })

  return NextResponse.json(beneficiary, { status: 201 })
}
