import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed some example data
  await prisma.customer.createMany({
    data: [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ],
    skipDuplicates: true,
  });

  await prisma.product.createMany({
    data: [
      { sku: 'SKU001', name: 'Lipstick', price: 19.99 },
      { sku: 'SKU002', name: 'Foundation', price: 29.99 },
    ],
    skipDuplicates: true,
  });

  console.log('🌱 Seed data inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
