import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email: 'kashif.devfe@gmail.com' },
    });

    if (superAdmin) {
      console.log('Super Admin found:');
      console.log('ID:', superAdmin.id);
      console.log('Email:', superAdmin.email);
      console.log('Name:', superAdmin.name);
      console.log('Is Active:', superAdmin.isActive);
      console.log('Password Hash:', superAdmin.password.substring(0, 20) + '...');
      console.log('Created At:', superAdmin.createdAt);
    } else {
      console.log('Super Admin NOT FOUND in database!');
      console.log('Creating super admin...');
      
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.default.hash('optops123', 12);
      
      const newSuperAdmin = await prisma.superAdmin.create({
        data: {
          email: 'kashif.devfe@gmail.com',
          password: hashedPassword,
          name: 'Super Admin',
          isActive: true,
        },
      });
      
      console.log('Super Admin created successfully!');
      console.log('ID:', newSuperAdmin.id);
      console.log('Email:', newSuperAdmin.email);
    }

    // List all super admins
    const allSuperAdmins = await prisma.superAdmin.findMany();
    console.log('\nAll Super Admins:', allSuperAdmins.length);
    allSuperAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} - Active: ${admin.isActive}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin();

