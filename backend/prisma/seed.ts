import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create super admin if it doesn't exist
  const existingSuperAdmin = await prisma.superAdmin.findUnique({
    where: { email: 'kashif.devfe@gmail.com' },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('optops123', 12);
    await prisma.superAdmin.create({
      data: {
        email: 'kashif.devfe@gmail.com',
        password: hashedPassword,
        name: 'Super Admin',
        isActive: true,
      },
    });
    console.log('Super Admin created successfully');
  } else {
    console.log('Super Admin already exists');
  }

  const company = await prisma.company.findFirst();
  
  if (!company) {
    console.log('No company found. Please create a company first.');
    return;
  }

  // No dummy products - companies will add their own products through the dashboard
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


