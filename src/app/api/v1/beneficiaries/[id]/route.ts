import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminRequest } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  const { id } = await params
  const body = await req.json()
  
  const fieldsToUpdate: string[] = []
  const args: any[] = []
  
  const allowedFields = [
    'firstName', 'lastName', 'cedula', 'state', 'city',
    'situation', 'householdSize', 'hasMinors', 'hasElders',
    'details', 'phone', 'altPhone', 'usdtWallet', 'status',
  ]
  
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      if (field === 'status' && !['pending', 'verified', 'helped', 'rejected'].includes(body.status)) {
        return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
      }
      
      fieldsToUpdate.push(`${field} = ?`)
      if (field === 'hasMinors' || field === 'hasElders') {
        args.push(body[field] ? 1 : 0)
      } else {
        args.push(body[field])
      }
    }
  }
  
  if (fieldsToUpdate.length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  }
  
  fieldsToUpdate.push('updatedAt = ?')
  args.push(new Date().toISOString())
  args.push(id)
  
  await db.execute({
    sql: `UPDATE Beneficiary SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
    args,
  })
  
  return NextResponse.json({ id, ...body })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  const { id } = await params
  await db.execute({
    sql: 'DELETE FROM Beneficiary WHERE id = ?',
    args: [id],
  })
  
  return NextResponse.json({ id, deleted: true })
}
