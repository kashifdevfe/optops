import prisma from '../config/database.js';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from '../dto/inventory.dto.js';

export const inventoryService = {
  generateItemCode(categoryName: string): string {
    const categoryPrefix = categoryName.substring(0, 3).toUpperCase().padEnd(3, 'X');
    const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryPrefix}-${timestamp}-${random}`;
  },

  async getInventoryItems(companyId: string, categoryId?: string) {
    const where: any = { companyId };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return items;
  },

  async createInventoryItem(companyId: string, data: CreateInventoryItemDto) {
    // Verify category exists and belongs to company
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        companyId,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        name: data.name,
        companyId,
      },
    });

    if (existingItem) {
      throw new Error('Inventory item with this name already exists');
    }

    const itemCode = this.generateItemCode(category.name);

    const item = await prisma.inventoryItem.create({
      data: {
        companyId,
        name: data.name,
        unitPrice: data.unitPrice,
        itemCode,
        totalStock: data.totalStock,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });

    return item;
  },

  async updateInventoryItem(companyId: string, itemId: string, data: UpdateInventoryItemDto) {
    const item = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        companyId,
      },
    });

    if (!item) {
      throw new Error('Inventory item not found');
    }

    // If categoryId is being updated, verify it exists
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          companyId,
        },
      });

      if (!category) {
        throw new Error('Category not found');
      }
    }

    const updateData: any = { ...data };

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        category: true,
      },
    });

    return updatedItem;
  },

  async deleteInventoryItem(companyId: string, itemId: string) {
    const item = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        companyId,
      },
    });

    if (!item) {
      throw new Error('Inventory item not found');
    }

    await prisma.inventoryItem.delete({
      where: { id: itemId },
    });

    return { success: true };
  },

  // Calculate total inventory value based on current stock
  async getTotalInventoryValue(companyId: string): Promise<number> {
    const items = await prisma.inventoryItem.findMany({
      where: { companyId },
      select: {
        totalStock: true,
        unitPrice: true,
      },
    });

    return items.reduce((total: number, item: any) => {
      return total + (item.totalStock * item.unitPrice);
    }, 0);
  },

  // Get inventory summary with total value
  async getInventorySummary(companyId: string) {
    const items = await prisma.inventoryItem.findMany({
      where: { companyId },
      include: {
        category: true,
      },
    });

    const totalItems = items.length;
    const totalStock = items.reduce((sum: number, item: any) => sum + item.totalStock, 0);
    const totalValue = items.reduce((sum: number, item: any) => sum + (item.totalStock * item.unitPrice), 0);

    return {
      totalItems,
      totalStock,
      totalValue,
      items,
    };
  },
};