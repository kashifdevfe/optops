import prisma from '../config/database.js';
import { CreateAuditDto, UpdateAuditDto, GetAuditsQueryDto } from '../dto/audit.dto.js';

// Helper function to calculate category breakdown and financial metrics
async function calculateAuditFinancials(
  companyId: string,
  startDate: Date,
  endDate: Date,
  includeExpenses: boolean
) {
  // Get sales for the audit period
  const sales = await prisma.sale.findMany({
    where: {
      companyId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Get all inventory items with categories for category breakdown
  const allInventoryItems = await prisma.inventoryItem.findMany({
    where: { companyId },
    include: { category: true },
  });

  // Create maps for quick lookup
  const inventoryItemMap = new Map<string, any>(allInventoryItems.map((item: any) => [item.name, item]));

  // Calculate category-wise breakdown
  const categoryBreakdown: Record<string, {
    categoryName: string;
    itemsSold: number;
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
    items: Array<{
      itemName: string;
      quantity: number;
      unitPrice: number;
      totalCost: number;
      totalRevenue: number;
      profit: number;
    }>;
  }> = {};

  let grossSales = 0;
  let costOfGoodsSold = 0;

  // Process each sale to calculate category-wise metrics
  for (const sale of sales) {
    grossSales += sale.total;

    // Get frame and lens for this sale
    const frame = sale.frame ? inventoryItemMap.get(sale.frame) : null;
    const lens = sale.lens ? inventoryItemMap.get(sale.lens) : null;

    // Calculate total cost for this sale
    const frameCost = frame ? frame.unitPrice : 0;
    const lensCost = lens ? lens.unitPrice : 0;
    const totalCost = frameCost + lensCost;
    costOfGoodsSold += totalCost;

    // Calculate revenue: split sale.total proportionally by cost
    let frameRevenue = 0;
    let lensRevenue = 0;

    if (frame && lens) {
      // Both frame and lens: split proportionally by cost
      const totalCostForSplit = frameCost + lensCost;
      if (totalCostForSplit > 0) {
        frameRevenue = (frameCost / totalCostForSplit) * sale.total;
        lensRevenue = (lensCost / totalCostForSplit) * sale.total;
      } else {
        // If both costs are 0, split equally
        frameRevenue = sale.total / 2;
        lensRevenue = sale.total / 2;
      }
    } else if (frame) {
      // Only frame: gets full sale total
      frameRevenue = sale.total;
    } else if (lens) {
      // Only lens: gets full sale total
      lensRevenue = sale.total;
    }

    // Process frame
    if (frame) {
      const categoryId = frame.categoryId;
      const categoryName = frame.category?.name || 'Uncategorized';

      if (!categoryBreakdown[categoryId]) {
        categoryBreakdown[categoryId] = {
          categoryName,
          itemsSold: 0,
          totalCost: 0,
          totalRevenue: 0,
          totalProfit: 0,
          items: [],
        };
      }

      const profit = frameRevenue - frameCost;

      categoryBreakdown[categoryId].itemsSold += 1;
      categoryBreakdown[categoryId].totalCost += frameCost;
      categoryBreakdown[categoryId].totalRevenue += frameRevenue;
      categoryBreakdown[categoryId].totalProfit += profit;

      // Update or add item entry
      const existingItem = categoryBreakdown[categoryId].items.find(item => item.itemName === frame.name);
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalCost += frameCost;
        existingItem.totalRevenue += frameRevenue;
        existingItem.profit += profit;
      } else {
        categoryBreakdown[categoryId].items.push({
          itemName: frame.name,
          quantity: 1,
          unitPrice: frameCost,
          totalCost: frameCost,
          totalRevenue: frameRevenue,
          profit,
        });
      }
    }

    // Process lens
    if (lens) {
      const categoryId = lens.categoryId;
      const categoryName = lens.category?.name || 'Uncategorized';

      if (!categoryBreakdown[categoryId]) {
        categoryBreakdown[categoryId] = {
          categoryName,
          itemsSold: 0,
          totalCost: 0,
          totalRevenue: 0,
          totalProfit: 0,
          items: [],
        };
      }

      const profit = lensRevenue - lensCost;

      categoryBreakdown[categoryId].itemsSold += 1;
      categoryBreakdown[categoryId].totalCost += lensCost;
      categoryBreakdown[categoryId].totalRevenue += lensRevenue;
      categoryBreakdown[categoryId].totalProfit += profit;

      // Update or add item entry
      const existingItem = categoryBreakdown[categoryId].items.find(item => item.itemName === lens.name);
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalCost += lensCost;
        existingItem.totalRevenue += lensRevenue;
        existingItem.profit += profit;
      } else {
        categoryBreakdown[categoryId].items.push({
          itemName: lens.name,
          quantity: 1,
          unitPrice: lensCost,
          totalCost: lensCost,
          totalRevenue: lensRevenue,
          profit,
        });
      }
    }
  }

  const netProfit = grossSales - costOfGoodsSold;
  const profitMargin = grossSales > 0 ? (netProfit / grossSales) * 100 : 0;

  // Calculate expenses (bills + salaries) if includeExpenses is true
  let totalExpenses = 0;
  if (includeExpenses) {
    // Get bills for the period
    const bills = await prisma.bill.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    const totalBills = bills.reduce((sum: number, bill: any) => sum + bill.amount, 0);

    // Get salaries for the period
    const salaries = await prisma.salary.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    const totalSalaries = salaries.reduce((sum: number, salary: any) => sum + salary.amount, 0);

    totalExpenses = totalBills + totalSalaries;
  }

  const finalNetProfit = netProfit - totalExpenses;

  return {
    grossSales,
    costOfGoodsSold,
    netProfit,
    profitMargin,
    totalExpenses,
    finalNetProfit,
    categoryBreakdown,
  };
}

export const auditService = {
  async getAudits(companyId: string, query: GetAuditsQueryDto = {}) {
    const { startDate, endDate, period } = query;

    const where: any = { companyId };

    if (period) {
      const now = new Date();
      let periodStart: Date;

      switch (period) {
        case 'week':
          periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          periodStart = new Date(0);
      }

      where.auditDate = {
        gte: periodStart,
      };
    } else if (startDate || endDate) {
      where.auditDate = {};
      if (startDate) {
        where.auditDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.auditDate.lte = new Date(endDate);
      }
    }

    const audits = await prisma.audit.findMany({
      where,
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
      orderBy: {
        auditDate: 'desc',
      },
    });

    // Get sales data for the period
    const salesWhere: any = { companyId };
    if (period || startDate || endDate) {
      salesWhere.createdAt = where.auditDate || {};
    }

    const sales = await prisma.sale.findMany({
      where: salesWhere,
    });

    const totalSalesValue = sales.reduce((sum: number, sale: any) => sum + sale.total, 0);

    // Calculate financial summary from audits
    const totalGrossSales = audits.reduce((sum: number, audit: any) => sum + (audit.grossSales || 0), 0);
    const totalCOGS = audits.reduce((sum: number, audit: any) => sum + (audit.costOfGoodsSold || 0), 0);
    const totalNetProfit = audits.reduce((sum: number, audit: any) => sum + (audit.netProfit || 0), 0);
    const avgProfitMargin = audits.length > 0
      ? audits.reduce((sum: number, audit: any) => sum + (audit.profitMargin || 0), 0) / audits.length
      : 0;

    // Calculate summary
    const summary = {
      totalAudits: audits.length,
      totalInventoryValue: audits.reduce((sum: number, audit: any) => sum + audit.totalInventoryValue, 0),
      totalSalesValue,
      totalGrossSales,
      totalCOGS,
      totalNetProfit,
      avgProfitMargin,
      totalDiscrepancies: audits.reduce(
        (sum: number, audit: any) =>
          sum +
          audit.items.reduce((itemSum: number, item: any) => itemSum + Math.abs(item.discrepancy) * item.unitPrice, 0),
        0
      ),
    };

    return {
      audits,
      summary,
    };
  },

  async getAuditById(companyId: string, auditId: string) {
    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        companyId,
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (!audit) {
      throw new Error('Audit not found');
    }

    return audit;
  },

  async createAudit(companyId: string, data: CreateAuditDto) {
    const auditDate = data.auditDate ? new Date(data.auditDate) : new Date();
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const includeExpenses = data.includeExpenses || false;

    // Ensure dates are at start/end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Calculate total inventory value and create audit items
    // Use current stock from database as expectedQuantity to ensure sync with sales
    let totalInventoryValue = 0;
    const auditItems = [];

    for (const item of data.items) {
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: {
          id: item.inventoryItemId,
          companyId,
        },
      });

      if (!inventoryItem) {
        throw new Error(`Inventory item with ID ${item.inventoryItemId} not found`);
      }

      // Always use current stock from database as expected quantity (synced with sales)
      // This ensures audits reflect the actual inventory state after all sales transactions
      const expectedQuantity = inventoryItem.totalStock; // Current stock after all sales
      const actualQuantity = item.actualQuantity; // What was physically counted
      const discrepancy = actualQuantity - expectedQuantity;
      const totalValue = actualQuantity * inventoryItem.unitPrice;
      totalInventoryValue += totalValue;

      auditItems.push({
        inventoryItemId: item.inventoryItemId,
        expectedQuantity,
        actualQuantity,
        discrepancy,
        unitPrice: inventoryItem.unitPrice,
        totalValue,
        notes: item.notes || null,
      });
    }

    // Calculate financial metrics using helper function
    const financials = await calculateAuditFinancials(companyId, startDate, endDate, includeExpenses);

    const audit = await prisma.audit.create({
      data: {
        auditDate,
        startDate,
        endDate,
        period: data.period || null,
        notes: data.notes || null,
        totalInventoryValue,
        totalSalesValue: financials.grossSales, // Keep for backward compatibility
        grossSales: financials.grossSales,
        costOfGoodsSold: financials.costOfGoodsSold,
        netProfit: financials.netProfit,
        profitMargin: financials.profitMargin,
        includeExpenses,
        totalExpenses: financials.totalExpenses,
        finalNetProfit: financials.finalNetProfit,
        categoryBreakdown: JSON.stringify(financials.categoryBreakdown),
        companyId,
        items: {
          create: auditItems,
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    return audit;
  },

  async updateAudit(companyId: string, auditId: string, data: UpdateAuditDto) {
    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        companyId,
      },
    });

    if (!audit) {
      throw new Error('Audit not found');
    }

    const updateData: any = {};
    if (data.auditDate !== undefined) updateData.auditDate = new Date(data.auditDate);
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.period !== undefined) updateData.period = data.period;
    if (data.includeExpenses !== undefined) updateData.includeExpenses = data.includeExpenses;

    // If dates or includeExpenses changed, recalculate financial metrics
    const shouldRecalculate = data.startDate !== undefined || data.endDate !== undefined || data.includeExpenses !== undefined;
    const startDate = data.startDate ? new Date(data.startDate) : (audit.startDate ? new Date(audit.startDate) : null);
    const endDate = data.endDate ? new Date(data.endDate) : (audit.endDate ? new Date(audit.endDate) : null);
    const includeExpenses = data.includeExpenses !== undefined ? data.includeExpenses : audit.includeExpenses;

    // If items are being updated, recalculate totals
    if (data.items) {
      // Delete existing items
      await prisma.auditItem.deleteMany({
        where: { auditId },
      });

      // Calculate new totals
      let totalInventoryValue = 0;
      const auditItems = [];

      for (const item of data.items) {
        const inventoryItem = await prisma.inventoryItem.findFirst({
          where: {
            id: item.inventoryItemId,
            companyId,
          },
        });

        if (!inventoryItem) {
          throw new Error(`Inventory item with ID ${item.inventoryItemId} not found`);
        }

        // Use current stock as expected quantity
        const expectedQuantity = inventoryItem.totalStock;
        const actualQuantity = item.actualQuantity;
        const discrepancy = actualQuantity - expectedQuantity;
        const totalValue = actualQuantity * inventoryItem.unitPrice;
        totalInventoryValue += totalValue;

        auditItems.push({
          inventoryItemId: item.inventoryItemId,
          expectedQuantity,
          actualQuantity,
          discrepancy,
          unitPrice: inventoryItem.unitPrice,
          totalValue,
          notes: item.notes || null,
        });
      }

      updateData.totalInventoryValue = totalInventoryValue;

      // Create new items
      await prisma.auditItem.createMany({
        data: auditItems.map((item: any) => ({
          ...item,
          auditId,
        })),
      });
    }

    // Recalculate financial metrics if dates or includeExpenses changed
    if (shouldRecalculate && startDate && endDate) {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      const financials = await calculateAuditFinancials(companyId, startDate, endDate, includeExpenses);

      updateData.totalSalesValue = financials.grossSales;
      updateData.grossSales = financials.grossSales;
      updateData.costOfGoodsSold = financials.costOfGoodsSold;
      updateData.netProfit = financials.netProfit;
      updateData.profitMargin = financials.profitMargin;
      updateData.totalExpenses = financials.totalExpenses;
      updateData.finalNetProfit = financials.finalNetProfit;
      updateData.categoryBreakdown = JSON.stringify(financials.categoryBreakdown);
    }

    const updatedAudit = await prisma.audit.update({
      where: { id: auditId },
      data: updateData,
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    return updatedAudit;
  },

  async deleteAudit(companyId: string, auditId: string) {
    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        companyId,
      },
    });

    if (!audit) {
      throw new Error('Audit not found');
    }

    await prisma.audit.delete({
      where: { id: auditId },
    });

    return { success: true };
  },

  async getInventoryItemsForAudit(companyId: string) {
    const items = await prisma.inventoryItem.findMany({
      where: { companyId },
      include: {
        category: true,
      },
      orderBy: {
        category: {
          name: 'asc',
        },
      },
    });

    return items;
  },
};

