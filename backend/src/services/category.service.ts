import prisma from '../config/database.js';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto.js';

export const categoryService = {
  async getCategories(companyId: string) {
    const categories = await prisma.category.findMany({
      where: { companyId },
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

  async getCategoryById(companyId: string, categoryId: string) {
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

    return category;
  },

  async createCategory(companyId: string, data: CreateCategoryDto) {
    // Check if category with same name already exists for this company
    const existing = await prisma.category.findFirst({
      where: {
        companyId,
        name: data.name.trim(),
      },
    });

    if (existing) {
      throw new Error('Category with this name already exists');
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

