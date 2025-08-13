import { NextResponse } from 'next/server'
import { verifySecret, unauthorized } from '../utils'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  if (!verifySecret(req)) return unauthorized()
  await prisma.$queryRaw`SELECT 1`
  return NextResponse.json({ status: 'ok' })
}
