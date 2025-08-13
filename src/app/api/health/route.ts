import { NextResponse } from 'next/server'
import { verifySecret, unauthorized } from './utils'

export function GET(req: Request) {
  if (!verifySecret(req)) return unauthorized()
  return NextResponse.json({ status: 'ok', timestamp: Date.now() })
}
