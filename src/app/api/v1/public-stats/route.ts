import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // 1. Get confirmed donations (safe public fields only)
    const donationsRes = await db.execute(`
      SELECT id, donor, isAnonymous, amount, currency, channel, createdAt 
      FROM Donation 
      WHERE status = 'confirmed' 
      ORDER BY createdAt DESC
    `)
    const confirmedDonations = donationsRes.rows

    // 2. Get helped beneficiaries (safe public fields only)
    const beneficiariesRes = await db.execute(`
      SELECT id, firstName, lastName, state, householdSize, situation, createdAt 
      FROM Beneficiary 
      WHERE status = 'helped' 
      ORDER BY createdAt DESC
    `)
    const helpedFamilies = beneficiariesRes.rows

    // 3. Count total registered beneficiaries (except rejected ones)
    const countRegisteredRes = await db.execute(`
      SELECT COUNT(*) as count 
      FROM Beneficiary 
      WHERE status != 'rejected'
    `)
    const registeredCount = Number(countRegisteredRes.rows[0]?.count ?? 0)

    // 4. Calculate totals
    const totalCLP = confirmedDonations
      .filter((d: any) => d.currency === 'CLP')
      .reduce((sum: number, d: any) => sum + Number(d.amount), 0)

    const totalUSD = confirmedDonations
      .filter((d: any) => d.currency === 'USD')
      .reduce((sum: number, d: any) => sum + Number(d.amount), 0)

    return NextResponse.json({
      totalCLP,
      totalUSD,
      donationsCount: confirmedDonations.length,
      registeredCount,
      helpedCount: helpedFamilies.length,
      confirmedDonations,
      helpedFamilies,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
