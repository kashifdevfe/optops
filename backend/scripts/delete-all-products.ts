import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all ecommerce products...');
  
  const result = await prisma.ecommerceProduct.deleteMany({});
  
  console.log(`Deleted ${result.count} products successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

