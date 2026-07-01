import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(donations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { donor, isAnonymous, amount, currency, channel, message, proofUrl } = body

  if (!amount || !currency || !channel) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const donation = await prisma.donation.create({
    data: {
      donor: isAnonymous ? null : (donor ?? null),
      isAnonymous: isAnonymous ?? false,
      amount: parseFloat(amount),
      currency,
      channel,
      message: message ?? null,
      proofUrl: proofUrl ?? null,
      status: 'pending',
    },
  })

  return NextResponse.json(donation, { status: 201 })
}
