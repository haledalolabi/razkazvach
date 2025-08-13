import { NextResponse } from 'next/server'
import { verifySecret, unauthorized } from '../utils'
import { ensureIndex } from '@/lib/search'

export async function GET(req: Request) {
  if (!verifySecret(req)) return unauthorized()
  await ensureIndex('stories')
  return NextResponse.json({ status: 'ok' })
}
