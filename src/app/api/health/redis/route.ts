import { NextResponse } from 'next/server'
import { verifySecret, unauthorized } from '../utils'
import { getRedisClient } from '@/lib/redis'

export async function GET(req: Request) {
  if (!verifySecret(req)) return unauthorized()
  const redis = getRedisClient()
  if (!redis) throw new Error('Redis not configured')
  await redis.set('raz:ping', 'ok', { ex: 10 })
  await redis.get('raz:ping')
  return NextResponse.json({ status: 'ok' })
}
