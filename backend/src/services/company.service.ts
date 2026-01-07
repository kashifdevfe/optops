import prisma from '../config/database.js';
import { UpdateCompanySettingsDto, UpdateThemeSettingsDto } from '../dto/company.dto.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';

export const companyService = {
  async getCompany(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        whatsapp: true,
        isActive: true,
        ecommerceEnabled: true,
        createdAt: true,
        updatedAt: true,
        themeSettings: {
          select: {
            id: true,
            companyId: true,
            primaryColor: true,
            secondaryColor: true,
            backgroundColor: true,
            surfaceColor: true,
            textColor: true,
            fontFamily: true,
            logoUrl: true,
            uiConfig: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    if (company.themeSettings) {
      company.themeSettings = {
        ...company.themeSettings,
        uiConfig: JSON.parse(company.themeSettings.uiConfig || '{}'),
      };
    }

    return company;
  },

  async updateCompanySettings(companyId: string, data: UpdateCompanySettingsDto) {
    const updateData: any = {};
    if (data.name !== undefined && data.name.trim() !== '') {
      updateData.name = data.name.trim();
    }
    if (data.address !== undefined) {
      updateData.address = data.address.trim() || null;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone.trim() || null;
    }
    if (data.whatsapp !== undefined) {
      updateData.whatsapp = data.whatsapp.trim() || null;
    }
    if (data.ecommerceEnabled !== undefined) {
      updateData.ecommerceEnabled = data.ecommerceEnabled;
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        whatsapp: true,
        isActive: true,
        ecommerceEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return company;
  },

  async updateThemeSettings(companyId: string, data: UpdateThemeSettingsDto) {
    const uiConfigString = data.uiConfig ? JSON.stringify(data.uiConfig) : '{}';
    
    const themeSettings = await prisma.themeSettings.upsert({
      where: { companyId },
      update: {
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        backgroundColor: data.backgroundColor,
        surfaceColor: data.surfaceColor,
        textColor: data.textColor,
        fontFamily: data.fontFamily,
        logoUrl: data.logoUrl,
        uiConfig: uiConfigString,
      },
      create: {
        companyId,
        primaryColor: data.primaryColor || '#D4AF37',
        secondaryColor: data.secondaryColor || '#FFD700',
        backgroundColor: data.backgroundColor || '#FFFFFF',
        surfaceColor: data.surfaceColor || '#F5F5F5',
        textColor: data.textColor || '#000000',
        fontFamily: data.fontFamily || 'Inter, sans-serif',
        logoUrl: data.logoUrl || null,
        uiConfig: uiConfigString,
      },
    });

    return {
      ...themeSettings,
      uiConfig: JSON.parse(themeSettings.uiConfig),
    };
  },

  async updatePassword(companyId: string, currentPassword: string, newPassword: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { password: true },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, company.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.company.update({
      where: { id: companyId },
      data: { password: hashedPassword },
    });

    return { success: true };
  },
};
