import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.story.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: { slug: 'hello-world' },
  })
}

main().finally(async () => {
  await prisma.$disconnect()
})
