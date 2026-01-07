import prisma from '../config/database.js';
import { hashPassword } from '../utils/bcrypt.js';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto.js';

export const userService = {
  async getUsers(companyId: string) {
    const users = await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  },

  async createUser(companyId: string, data: CreateUserDto) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email_companyId: {
          email: data.email,
          companyId,
        },
      },
    });

    if (existingUser) {
      throw new Error('User with this email already exists in this company');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
        companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },

  async updateUser(companyId: string, userId: string, data: UpdateUserDto) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updateData: any = {
      email: data.email,
      name: data.name,
      role: data.role,
      isActive: data.isActive,
    };

    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  },

  async deleteUser(companyId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  },
};
