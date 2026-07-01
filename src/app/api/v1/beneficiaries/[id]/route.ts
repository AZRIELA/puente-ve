import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json()

  if (!['pending', 'verified', 'helped', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const beneficiary = await prisma.beneficiary.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json(beneficiary)
}
