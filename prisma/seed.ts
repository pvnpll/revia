import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MOCK_USER_ID = process.env.MOCK_USER_ID ?? "00000000-0000-0000-0000-000000000001";
const MOCK_USER_EMAIL = process.env.MOCK_USER_EMAIL ?? "demo@decklearning.app";

async function main() {
  const user = await prisma.user.upsert({
    where: { id: MOCK_USER_ID },
    update: {},
    create: {
      id: MOCK_USER_ID,
      email: MOCK_USER_EMAIL,
      name: "Demo User",
      username: "demo-user",
    },
  });

  const deck = await prisma.deck.upsert({
    where: { id: "10000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "10000000-0000-0000-0000-000000000001",
      userId: user.id,
      title: "Getting Started",
      description: "Sample deck to explore Revia",
      subject: "Demo",
      color: "#6366f1",
    },
  });

  const lesson = await prisma.lesson.upsert({
    where: { id: "20000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "20000000-0000-0000-0000-000000000001",
      deckId: deck.id,
      title: "Basics",
      sortOrder: 0,
    },
  });

  const sampleCards = [
    {
      id: "30000000-0000-0000-0000-000000000001",
      front: "What is spaced repetition?",
      back: "A learning technique that increases intervals between reviews of previously learned material.",
      exampleSentence: "Spaced repetition helps long-term retention.",
    },
    {
      id: "30000000-0000-0000-0000-000000000002",
      front: "What does the scheduling engine receive?",
      back: "Card scheduling state, rating (1–5), and review history — never subject content.",
      exampleSentence: "The engine is subject-blind by design.",
    },
    {
      id: "30000000-0000-0000-0000-000000000003",
      front: "Name the five rating levels",
      back: "1 Forgot, 2 Hard, 3 Okay, 4 Good, 5 Perfect",
      notes: "Higher ratings → longer intervals",
    },
  ];

  const now = new Date();

  for (const sample of sampleCards) {
    await prisma.card.upsert({
      where: { id: sample.id },
      update: {},
      create: {
        id: sample.id,
        deckId: deck.id,
        lessonId: lesson.id,
        front: sample.front,
        back: sample.back,
        exampleSentence: sample.exampleSentence,
        notes: sample.notes,
        schedulingState: {
          create: {
            dueAt: now,
            intervalDays: 0,
            easeFactor: 2.5,
            repetitions: 0,
            lapses: 0,
            algorithmVersion: "simple-v1",
          },
        },
      },
    });
  }

  console.log("Seed complete:", { user: user.email, deck: deck.title, cards: sampleCards.length });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
