import { NextResponse } from 'next/server'
import { verifySecret, unauthorized } from '../utils'
import { headBucket } from '@/lib/s3'

export async function GET(req: Request) {
  if (!verifySecret(req)) return unauthorized()
  await headBucket()
  return NextResponse.json({ status: 'ok' })
}
