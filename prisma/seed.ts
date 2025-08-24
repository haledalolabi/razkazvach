import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: { email: adminEmail, role: "ADMIN" },
  });

  const s1 = await prisma.story.upsert({
    where: { slug: "prikazka-za-lisicata" },
    update: {},
    create: {
      slug: "prikazka-za-lisicata",
      title: "Приказка за Лисицата",
      description: "Топла, кратка приказка за деца 3–8",
      tags: ["животни", "приятелство"],
      ageMin: 3,
      ageMax: 8,
      status: "DRAFT",
      body: {
        create: {
          lang: "bg",
          html: "<p>Имало едно време една умна лисица...</p>",
          readingTimeSec: 120,
        },
      },
    },
  });

  const s2 = await prisma.story.upsert({
    where: { slug: "interaktivna-prikazka-demo" },
    update: {},
    create: {
      slug: "interaktivna-prikazka-demo",
      title: "Интерактивна Приказка (Демо)",
      description: "Една изборна история с 3 възела",
      tags: ["интерактивна", "демо"],
      ageMin: 3,
      ageMax: 8,
      isInteractive: true,
      status: "DRAFT",
    },
  });

  const n1 = await prisma.interactiveNode.create({
    data: {
      storyId: s2.id,
      bodyHtml: "<p>Начало: лява или дясна пътека?</p>",
      title: "start",
    },
  });
  const n2 = await prisma.interactiveNode.create({
    data: {
      storyId: s2.id,
      bodyHtml: "<p>Ляво: намираш приятел.</p>",
      title: "left",
    },
  });
  const n3 = await prisma.interactiveNode.create({
    data: {
      storyId: s2.id,
      bodyHtml: "<p>Дясно: научаваш урок.</p>",
      title: "right",
    },
  });
  await prisma.interactiveChoice.createMany({
    data: [
      { fromNodeId: n1.id, toNodeId: n2.id, label: "Ляво" },
      { fromNodeId: n1.id, toNodeId: n3.id, label: "Дясно" },
    ],
  });

  console.log("Seed complete:", { adminEmail, s1: s1.slug, s2: s2.slug });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
