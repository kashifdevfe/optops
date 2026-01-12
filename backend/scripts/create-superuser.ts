import prisma from '../src/config/database.js';
import bcrypt from 'bcrypt';

async function createSuperAdmin() {
    const email = 'kashif.devfe@gmail.com';
    const password = 'optops123';
    const name = 'Kashif Developer';

    try {
        // Check if super admin already exists
        const existingAdmin = await prisma.superAdmin.findUnique({
            where: { email },
        });

        if (existingAdmin) {
            console.log('Super Admin already exists:', existingAdmin.email);
            // Update password just in case
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.superAdmin.update({
                where: { id: existingAdmin.id },
                data: { password: hashedPassword },
            });
            console.log('Super Admin password updated');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create super admin
        const newAdmin = await prisma.superAdmin.create({
            data: {
                email,
                password: hashedPassword,
                name,
                isActive: true,
            },
        });

        console.log('Super Admin created successfully:', newAdmin.email);
    } catch (error) {
        console.error('Error creating super admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin();
