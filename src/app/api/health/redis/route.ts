import { NextResponse } from 'next/server'
import { verifySecret, unauthorized } from '../utils'
import redis from '@/lib/redis'

export async function GET(req: Request) {
  if (!verifySecret(req)) return unauthorized()
  await redis.set('raz:ping', 'ok', { ex: 10 })
  await redis.get('raz:ping')
  return NextResponse.json({ status: 'ok' })
}
