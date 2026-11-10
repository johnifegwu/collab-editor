import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing seed data
  await prisma.documentAccess.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // Create two mock users
  const alice = await prisma.user.create({
    data: {
      id: "user_alice",
      email: "alice@example.com",
      name: "Alice",
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: "user_bob",
      email: "bob@example.com",
      name: "Bob",
    },
  });

  // Alice owns two documents
  const doc1 = await prisma.document.create({
    data: {
      title: "Project Kickoff Notes",
      content:
        "<h2>Project Kickoff</h2><p>Welcome to the collaborative document editor!</p><ul><li>Review requirements</li><li>Assign owners</li></ul>",
      ownerId: alice.id,
    },
  });

  await prisma.document.create({
    data: {
      title: "Personal Draft",
      content: "<p>This is Alice's private draft document.</p>",
      ownerId: alice.id,
    },
  });

  // Bob owns one document
  const doc3 = await prisma.document.create({
    data: {
      title: "Bob's Meeting Notes",
      content: "<p>Notes from the last sprint planning session.</p>",
      ownerId: bob.id,
    },
  });

  // Alice shares doc1 with Bob; Bob shares doc3 with Alice
  await prisma.documentAccess.create({
    data: { documentId: doc1.id, userId: bob.id },
  });

  await prisma.documentAccess.create({
    data: { documentId: doc3.id, userId: alice.id },
  });

  console.log("✅ Seeded users: alice@example.com, bob@example.com");
  console.log("✅ Seeded documents with sharing");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
