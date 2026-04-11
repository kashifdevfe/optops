import prisma from '../config/database.js';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto.js';

const DEFAULT_ECOMMERCE_CATEGORIES = ['Eyeglasses', 'Sunglasses', 'Contact Lenses', 'Frames'];

export const categoryService = {
  async getCategories(companyId: string | null, type?: string) {
    const where: any = {};
    
    // If it's an ecommerce request (type='ecommerce'), ensure default categories exist
    if (companyId && type === 'ecommerce') {
      for (const catName of DEFAULT_ECOMMERCE_CATEGORIES) {
        const existing = await prisma.category.findFirst({
          where: { 
            companyId, 
            name: { equals: catName, mode: 'insensitive' } 
          }
        });
        
        if (!existing) {
          await prisma.category.create({
            data: {
              companyId,
              name: catName,
              type: 'ecommerce'
            }
          });
        } else if (existing.type !== 'ecommerce' && existing.type === null) {
          // If it exists but has no type, mark it as ecommerce
          await prisma.category.update({
            where: { id: existing.id },
            data: { type: 'ecommerce' }
          });
        }
      }
    }

    if (companyId) {
      where.companyId = companyId;
    } else {
      // Get all companies with ecommerce enabled
      const companiesWithEcommerce = await prisma.company.findMany({
        where: { ecommerceEnabled: true },
        select: { id: true },
      });
      const companyIds = companiesWithEcommerce.map((c: any) => c.id);
      if (companyIds.length > 0) {
        where.companyId = { in: companyIds };
      } else {
        return [];
      }
    }

    if (type !== undefined) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    return categories;
  },

  async getCategoryById(companyId: string | null, categoryId: string) {
    const where: any = { id: categoryId };
    if (companyId) {
      where.companyId = companyId;
    }

    const category = await prisma.category.findFirst({
      where,
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  },

  async createCategory(companyId: string, data: CreateCategoryDto) {
    // Check if category with same name already exists for this company
    const existing = await prisma.category.findFirst({
      where: {
        companyId,
        name: {
          equals: data.name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      // If it exists but has a different type, update it
      if (existing.type !== data.type) {
        return await prisma.category.update({
          where: { id: existing.id },
          data: { type: data.type || null },
        });
      }
      return existing;
    }

    const category = await prisma.category.create({
      data: {
        companyId,
        name: data.name.trim(),
        type: data.type || null,
      },
    });

    return category;
  },

  async updateCategory(companyId: string, categoryId: string, data: UpdateCategoryDto) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if another category with same name exists
    const existing = await prisma.category.findFirst({
      where: {
        companyId,
        name: data.name.trim(),
        id: {
          not: categoryId,
        },
      },
    });

    if (existing) {
      throw new Error('Category with this name already exists');
    }

    const updateData: { name: string; type?: string | null } = {
      name: data.name.trim(),
    };

    // Only update type if it's explicitly provided (including null to clear it)
    if (data.type !== undefined) {
      updateData.type = data.type || null;
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return updatedCategory;
  },

  async deleteCategory(companyId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId,
      },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has items
    if (category._count.items > 0) {
      throw new Error('Cannot delete category with existing inventory items');
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { success: true };
  },
};

