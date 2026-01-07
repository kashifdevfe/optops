import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'kashif.devfe@gmail.com';
    const password = 'optops123';

    console.log('Testing login with:');
    console.log('Email:', email);
    console.log('Password:', password);

    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!superAdmin) {
      console.log('ERROR: Super Admin not found!');
      return;
    }

    console.log('\nSuper Admin found:');
    console.log('Email:', superAdmin.email);
    console.log('Is Active:', superAdmin.isActive);
    console.log('Password Hash:', superAdmin.password.substring(0, 30) + '...');

    console.log('\nTesting password comparison...');
    const isValid = await bcrypt.compare(password, superAdmin.password);
    console.log('Password valid:', isValid);

    if (isValid) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
    } else {
      console.log('\n❌ LOGIN FAILED - Password mismatch');
      console.log('Trying to hash password again...');
      const newHash = await bcrypt.hash(password, 12);
      console.log('New hash:', newHash.substring(0, 30) + '...');
      console.log('Current hash:', superAdmin.password.substring(0, 30) + '...');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

