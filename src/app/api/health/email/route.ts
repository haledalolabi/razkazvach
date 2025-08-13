import { NextResponse } from 'next/server'
import { verifySecret, unauthorized } from '../utils'
import { sendTestEmail } from '@/lib/email'

export async function GET(req: Request) {
  if (!verifySecret(req)) return unauthorized()
  const url = new URL(req.url)
  const to = url.searchParams.get('to')
  if (process.env.NODE_ENV === 'development' && to) {
    await sendTestEmail(to)
  }
  return NextResponse.json({ status: 'ok' })
}
