import { NextResponse } from 'next/server'
import { verifySecret, unauthorized } from '../utils'
import { checkConfig } from '@/lib/stripe'

export async function GET(req: Request) {
  if (!verifySecret(req)) return unauthorized()
  await checkConfig()
  return NextResponse.json({ status: 'ok' })
}
