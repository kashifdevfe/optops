import prisma from '../config/database.js';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto/order.dto.js';

export const orderService = {
  generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ECO-${timestamp}-${random}`;
  },

  async getOrders(companyId: string) {
    const orders = await prisma.ecommerceOrder.findMany({
      where: { companyId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  },

  async getOrderById(companyId: string, orderId: string) {
    const order = await prisma.ecommerceOrder.findFirst({
      where: {
        id: orderId,
        companyId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  },

  async createOrder(data: CreateOrderDto, companyId: string | null = null) {
    const orderNumber = this.generateOrderNumber();

    let totalAmount = 0;
    const orderItems = [];
    let determinedCompanyId: string | null = companyId;

    // If companyId is not provided, determine it from the first product
    if (!determinedCompanyId && data.items.length > 0) {
      const firstProduct = await prisma.ecommerceProduct.findUnique({
        where: { id: data.items[0].productId },
        select: { companyId: true },
      });
      
      if (firstProduct) {
        determinedCompanyId = firstProduct.companyId;
      }
    }

    if (!determinedCompanyId) {
      throw new Error('Unable to determine company for order');
    }

    for (const item of data.items) {
      const product = await prisma.ecommerceProduct.findFirst({
        where: {
          id: item.productId,
          companyId: determinedCompanyId,
        },
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (!product.inStock || product.stockCount < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = await prisma.ecommerceOrder.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        prescriptionNotes: data.prescriptionNotes || null,
        isCustomOrder: data.isCustomOrder || false,
        frameName: data.frameName && data.frameName.trim() !== '' ? data.frameName.trim() : null,
        rightEyeSphere: data.rightEyeSphere && data.rightEyeSphere.trim() !== '' ? data.rightEyeSphere.trim() : null,
        rightEyeCylinder: data.rightEyeCylinder && data.rightEyeCylinder.trim() !== '' ? data.rightEyeCylinder.trim() : null,
        rightEyeAxis: data.rightEyeAxis && data.rightEyeAxis.trim() !== '' ? data.rightEyeAxis.trim() : null,
        leftEyeSphere: data.leftEyeSphere && data.leftEyeSphere.trim() !== '' ? data.leftEyeSphere.trim() : null,
        leftEyeCylinder: data.leftEyeCylinder && data.leftEyeCylinder.trim() !== '' ? data.leftEyeCylinder.trim() : null,
        leftEyeAxis: data.leftEyeAxis && data.leftEyeAxis.trim() !== '' ? data.leftEyeAxis.trim() : null,
        nearAdd: data.nearAdd && data.nearAdd.trim() !== '' ? data.nearAdd.trim() : null,
        totalAmount,
        companyId: determinedCompanyId,
        status: 'pending',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update stock for each product
    for (const item of data.items) {
      const updatedProduct = await prisma.ecommerceProduct.update({
        where: { id: item.productId },
        data: {
          stockCount: {
            decrement: item.quantity,
          },
        },
      });
      
      // Update inStock based on remaining stock
      if (updatedProduct.stockCount <= 0) {
        await prisma.ecommerceProduct.update({
          where: { id: item.productId },
          data: {
            inStock: false,
          },
        });
      }
    }

    return order;
  },

  async updateOrderStatus(companyId: string, orderId: string, data: UpdateOrderStatusDto) {
    const order = await prisma.ecommerceOrder.findFirst({
      where: {
        id: orderId,
        companyId,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const updatedOrder = await prisma.ecommerceOrder.update({
      where: { id: orderId },
      data: {
        status: data.status,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return updatedOrder;
  },
};

