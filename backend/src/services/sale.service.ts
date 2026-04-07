import prisma from '../config/database.js';
import { CreateSaleDto, UpdateSaleDto } from '../dto/sale.dto.js';

export const saleService = {
  generateOrderNo(): string {
    // Short, human-friendly order number for receipts/tables
    // Format: ORD-YYMMDD-XXX (e.g., ORD-260407-A9K)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
    return `ORD-${yy}${mm}${dd}-${rand}`;
  },

  async deductInventory(companyId: string, frameName: string, lensName: string): Promise<{ frameValue: number; lensValue: number }> {
    let frameValue = 0;
    let lensValue = 0;

    // Find and deduct frame by name (category-agnostic)
    if (frameName && frameName.trim() !== '') {
      const frame = await prisma.inventoryItem.findFirst({
        where: {
          companyId,
          name: frameName.trim(),
        },
        include: {
          category: true,
        },
      });

      if (frame) {
        if (frame.totalStock <= 0) {
          throw new Error(`Insufficient stock for frame: ${frameName}`);
        }

        // Calculate value before deduction
        frameValue = frame.unitPrice;

        await prisma.inventoryItem.update({
          where: { id: frame.id },
          data: {
            totalStock: {
              decrement: 1,
            },
          },
        });
      } else {
        throw new Error(`Frame not found in inventory: ${frameName}`);
      }
    }

    // Find and deduct lens by name (category-agnostic)
    if (lensName && lensName.trim() !== '') {
      const lens = await prisma.inventoryItem.findFirst({
        where: {
          companyId,
          name: lensName.trim(),
        },
        include: {
          category: true,
        },
      });

      if (lens) {
        if (lens.totalStock <= 0) {
          throw new Error(`Insufficient stock for lens: ${lensName}`);
        }

        // Calculate value before deduction
        lensValue = lens.unitPrice;

        await prisma.inventoryItem.update({
          where: { id: lens.id },
          data: {
            totalStock: {
              decrement: 1,
            },
          },
        });
      } else {
        throw new Error(`Lens not found in inventory: ${lensName}`);
      }
    }

    return { frameValue, lensValue };
  },

  async restoreInventory(companyId: string, frameName: string, lensName: string): Promise<void> {
    // Restore frame by name (category-agnostic)
    if (frameName && frameName.trim() !== '') {
      const frame = await prisma.inventoryItem.findFirst({
        where: {
          companyId,
          name: frameName.trim(),
        },
      });

      if (frame) {
        await prisma.inventoryItem.update({
          where: { id: frame.id },
          data: {
            totalStock: {
              increment: 1,
            },
          },
        });
      }
    }

    // Restore lens by name (category-agnostic)
    if (lensName && lensName.trim() !== '') {
      const lens = await prisma.inventoryItem.findFirst({
        where: {
          companyId,
          name: lensName.trim(),
        },
      });

      if (lens) {
        await prisma.inventoryItem.update({
          where: { id: lens.id },
          data: {
            totalStock: {
              increment: 1,
            },
          },
        });
      }
    }
  },

  async getSales(companyId: string) {
    const sales = await prisma.sale.findMany({
      where: { companyId },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sales;
  },

  async createSale(companyId: string, data: CreateSaleDto) {
    const remaining = data.total - (data.received || 0);

    const entryDate = data.entryDate ? new Date(data.entryDate) : null;
    const deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null;

    const orderNo = this.generateOrderNo();
    const frame = data.frame ?? '';
    const lens = data.lens ?? '';

    // Deduct inventory before creating sale (this reduces stock and tracks value)
    try {
      await this.deductInventory(companyId, frame, lens);
      // Inventory value is automatically reduced because stock is decremented
      // Total inventory value = sum of (totalStock * unitPrice) for all items
      // This will be reflected in audits which calculate based on current stock
    } catch (error: any) {
      throw new Error(`Failed to deduct inventory: ${error.message}`);
    }

    const sale = await prisma.sale.create({
      data: {
        orderNo,
        customerId: data.customerId,
        rightEyeSphere: data.rightEyeSphere,
        rightEyeCylinder: data.rightEyeCylinder,
        rightEyeAxis: data.rightEyeAxis,
        leftEyeSphere: data.leftEyeSphere,
        leftEyeCylinder: data.leftEyeCylinder,
        leftEyeAxis: data.leftEyeAxis,
        nearAdd: data.nearAdd,
        customEntry: data.customEntry || null,
        total: data.total,
        received: data.received || 0,
        remaining,
        frame,
        lens,
        entryDate,
        deliveryDate,
        status: data.status,
        companyId,
      },
      include: {
        customer: true,
      },
    });

    return sale;
  },

  async updateSale(companyId: string, saleId: string, data: UpdateSaleDto) {
    const sale = await prisma.sale.findFirst({
      where: {
        id: saleId,
        companyId,
      },
    });

    if (!sale) {
      throw new Error('Sale not found');
    }

    // Handle inventory changes if frame or lens is updated
    if (data.frame !== undefined || data.lens !== undefined) {
      // Restore old inventory
      await this.restoreInventory(companyId, sale.frame, sale.lens);

      // Deduct new inventory
      const newFrame = data.frame !== undefined ? data.frame : sale.frame;
      const newLens = data.lens !== undefined ? data.lens : sale.lens;

      try {
        await this.deductInventory(companyId, newFrame, newLens);
      } catch (error: any) {
        // If deduction fails, try to restore old inventory back
        await this.deductInventory(companyId, sale.frame, sale.lens);
        throw new Error(`Failed to deduct inventory: ${error.message}`);
      }
    }

    const updateData: any = {
      orderNo: data.orderNo,
      customerId: data.customerId,
      rightEyeSphere: data.rightEyeSphere,
      rightEyeCylinder: data.rightEyeCylinder,
      rightEyeAxis: data.rightEyeAxis,
      leftEyeSphere: data.leftEyeSphere,
      leftEyeCylinder: data.leftEyeCylinder,
      leftEyeAxis: data.leftEyeAxis,
      nearAdd: data.nearAdd,
      customEntry: data.customEntry,
      total: data.total,
      received: data.received,
      frame: data.frame,
      lens: data.lens,
      status: data.status,
    };

    if (data.entryDate !== undefined) {
      updateData.entryDate = data.entryDate ? new Date(data.entryDate) : null;
    }
    if (data.deliveryDate !== undefined) {
      updateData.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null;
    }

    if (updateData.total !== undefined && updateData.received !== undefined) {
      updateData.remaining = updateData.total - updateData.received;
    } else if (updateData.total !== undefined) {
      updateData.remaining = updateData.total - sale.received;
    } else if (updateData.received !== undefined) {
      updateData.remaining = sale.total - updateData.received;
    }

    const updatedSale = await prisma.sale.update({
      where: { id: saleId },
      data: updateData,
      include: {
        customer: true,
      },
    });

    return updatedSale;
  },

  async deleteSale(companyId: string, saleId: string) {
    const sale = await prisma.sale.findFirst({
      where: {
        id: saleId,
        companyId,
      },
    });

    if (!sale) {
      throw new Error('Sale not found');
    }

    // Restore inventory when sale is deleted
    await this.restoreInventory(companyId, sale.frame, sale.lens);

    await prisma.sale.delete({
      where: { id: saleId },
    });

    return { success: true };
  },
};