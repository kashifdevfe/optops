import prisma from '../config/database.js';

export const dashboardService = {
  async getStats(companyId: string) {
    const [customers, sales, inventoryItems, todaySales] = await Promise.all([
      prisma.customer.count({
        where: { companyId },
      }),
      prisma.sale.count({
        where: { companyId, status: 'completed' },
      }),
      prisma.inventoryItem.count({
        where: { companyId },
      }),
      prisma.sale.count({
        where: {
          companyId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const monthlySales = await prisma.sale.findMany({
      where: { companyId },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const monthlyData = monthlySales.reduce((acc: any, sale: any) => {
      const month = new Date(sale.createdAt).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += sale.total;
      return acc;
    }, {} as Record<string, number>);

    // Get sales with details for category breakdown
    const salesWithDetails = await prisma.sale.findMany({
      where: { companyId },
      select: {
        total: true,
        frame: true,
        lens: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get inventory items for category mapping
    const inventoryItemsList = await prisma.inventoryItem.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        categoryId: true,
        unitPrice: true,
        totalStock: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const itemCategoryMap = new Map<string, string>(
      inventoryItemsList.map((item: any) => [item.name, item.category?.name || 'Uncategorized'])
    );

    // Calculate sales by category
    const salesByCategory: Record<string, number> = {};
    salesWithDetails.forEach((sale: any) => {
      if (sale.frame && itemCategoryMap.has(sale.frame)) {
        const category = itemCategoryMap.get(sale.frame)!;
        salesByCategory[category] = (salesByCategory[category] || 0) + sale.total;
      }
      if (sale.lens && itemCategoryMap.has(sale.lens)) {
        const category = itemCategoryMap.get(sale.lens)!;
        salesByCategory[category] = (salesByCategory[category] || 0) + sale.total;
      }
    });

    // Calculate top selling items
    const itemSales: Record<string, number> = {};
    salesWithDetails.forEach((sale: any) => {
      if (sale.frame) {
        itemSales[sale.frame] = (itemSales[sale.frame] || 0) + 1;
      }
      if (sale.lens) {
        itemSales[sale.lens] = (itemSales[sale.lens] || 0) + 1;
      }
    });

    const topSellingItems = Object.entries(itemSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Calculate sales by status
    const salesByStatus: Record<string, number> = {};
    salesWithDetails.forEach((sale: any) => {
      salesByStatus[sale.status] = (salesByStatus[sale.status] || 0) + 1;
    });

    // Calculate weekly sales (last 8 weeks)
    const weeklySales: Record<string, number> = {};
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekLabel = `Week ${i === 0 ? 'Current' : i}`;
      weeklySales[weekLabel] = salesWithDetails
        .filter((sale: any) => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= weekStart && saleDate <= weekEnd;
        })
        .reduce((sum: number, sale: any) => sum + sale.total, 0);
    }

    // Calculate revenue and profit (last 6 months)
    const monthlyRevenue: Record<string, number> = {};
    const monthlyProfit: Record<string, number> = {};

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      last6Months.push(monthKey);
      monthlyRevenue[monthKey] = 0;
      monthlyProfit[monthKey] = 0;
    }

    salesWithDetails.forEach((sale: any) => {
      const saleDate = new Date(sale.createdAt);
      const monthKey = saleDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyRevenue[monthKey] !== undefined) {
        monthlyRevenue[monthKey] += sale.total;
        // Estimate profit (assuming 40% margin for simplicity, or calculate from inventory)
        monthlyProfit[monthKey] += sale.total * 0.4;
      }
    });

    // Calculate inventory value by category
    const inventoryByCategory: Record<string, number> = {};
    inventoryItemsList.forEach((item: any) => {
      const category = item.category?.name || 'Uncategorized';
      inventoryByCategory[category] = (inventoryByCategory[category] || 0) +
        (item.unitPrice * item.totalStock);
    });

    return {
      totalCustomers: customers,
      totalSales: sales,
      totalInventoryItems: inventoryItems,
      todayOrders: todaySales,
      monthlySales: monthlyData,
      salesByCategory,
      topSellingItems,
      salesByStatus,
      weeklySales,
      monthlyRevenue,
      monthlyProfit,
      inventoryByCategory,
    };
  },
};
