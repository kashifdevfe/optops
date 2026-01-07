import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  console.log('Companies found:', companies.length);
  
  if (companies.length > 0) {
    console.log('First company ID:', companies[0].id);
    
    const products = await prisma.ecommerceProduct.findMany({
      where: { companyId: companies[0].id },
    });
    console.log('Products found:', products.length);
    
    if (products.length > 0) {
      console.log('First product:', {
        id: products[0].id,
        name: products[0].name,
        companyId: products[0].companyId,
      });
    } else {
      console.log('No products found. Running seed...');
      const seed = await import('../prisma/seed.js');
    }
  } else {
    console.log('No companies found. Please create a company first.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


