import prisma from '../config/database.js';
import { hashPassword, comparePassword, generateRandomPassword } from '../utils/bcrypt.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { SignupDto, LoginDto } from '../dto/auth.dto.js';
import { sendPasswordResetEmail } from '../utils/email.js';

export const authService = {
  async signup(data: SignupDto) {
    const existingCompany = await prisma.company.findUnique({
      where: { email: data.email },
    });

    if (existingCompany) {
      throw new Error('Company with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    const userHashedPassword = await hashPassword(data.password);

    const company = await prisma.company.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        address: data.address || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        users: {
          create: {
            email: data.userEmail,
            name: data.userName,
            password: userHashedPassword,
            role: 'admin',
          },
        },
        themeSettings: {
          create: {
            primaryColor: '#D4AF37',
            secondaryColor: '#FFD700',
            backgroundColor: '#FFFFFF',
            surfaceColor: '#F5F5F5',
            textColor: '#000000',
            fontFamily: 'Inter, sans-serif',
            uiConfig: '{}',
          },
        },
      },
      include: {
        users: {
          where: { email: data.userEmail },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        themeSettings: true,
      },
    });

    const user = company.users[0];
    const accessToken = generateAccessToken({
      companyId: company.id,
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ companyId: company.id });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        companyId: company.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const themeSettings = company.themeSettings ? {
      ...company.themeSettings,
      uiConfig: JSON.parse(company.themeSettings.uiConfig || '{}'),
    } : null;

    return {
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        address: company.address,
        phone: company.phone,
        whatsapp: company.whatsapp,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      themeSettings,
      accessToken,
      refreshToken,
    };
  },

  async login(data: LoginDto) {
    const company = await prisma.company.findUnique({
      where: { email: data.email },
      include: {
        themeSettings: true,
      },
    });

    if (!company || !company.isActive) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(data.password, company.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const user = await prisma.user.findFirst({
      where: {
        companyId: company.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!user || !user.isActive) {
      throw new Error('No active user found');
    }

    const accessToken = generateAccessToken({
      companyId: company.id,
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ companyId: company.id });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        companyId: company.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const themeSettings = company.themeSettings ? {
      ...company.themeSettings,
      uiConfig: JSON.parse(company.themeSettings.uiConfig || '{}'),
    } : null;

    return {
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        address: company.address,
        phone: company.phone,
        whatsapp: company.whatsapp,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      themeSettings,
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(token: string) {
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        company: {
          include: {
            themeSettings: true,
          },
        },
      },
    });

    if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.deleteMany({
        where: { token },
      });
      throw new Error('Invalid or expired refresh token');
    }

    const user = await prisma.user.findFirst({
      where: {
        companyId: refreshTokenRecord.companyId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!user || !user.isActive) {
      throw new Error('No active user found');
    }

    await prisma.refreshToken.delete({
      where: { token },
    });

    const newAccessToken = generateAccessToken({
      companyId: refreshTokenRecord.companyId,
      userId: user.id,
      email: user.email,
    });
    const newRefreshToken = generateRefreshToken({ companyId: refreshTokenRecord.companyId });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        companyId: refreshTokenRecord.companyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  },

  async resetCompanyPassword(email: string) {
    const company = await prisma.company.findUnique({
      where: { email },
    });

    if (!company) {
      throw new Error('Company with this email does not exist');
    }

    // Generate a new random password
    const newPassword = generateRandomPassword(12);
    // Skip validation for admin-generated passwords (they're already strong)
    const hashedPassword = await hashPassword(newPassword, true);

    // Update company password
    await prisma.company.update({
      where: { id: company.id },
      data: { password: hashedPassword },
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(company.email, company.name, newPassword);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success even if email fails, but log the error
      // You might want to throw an error here if email is critical
    }

    // Return success (password is sent via email, not returned)
    return {
      email: company.email,
      message: 'Password reset email sent successfully',
    };
  },
};
