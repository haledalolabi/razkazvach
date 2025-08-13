import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const story = await prisma.story.findUnique({
    where: { slug: 'hello-world' },
  })
  return NextResponse.json(story)
}
