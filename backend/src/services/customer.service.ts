import prisma from '../config/database.js';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto.js';

export const customerService = {
  async getCustomers(companyId: string) {
    const customers = await prisma.customer.findMany({
      where: { companyId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return customers;
  },

  async createCustomer(companyId: string, data: CreateCustomerDto) {
    const customer = await prisma.customer.create({
      data: {
        ...data,
        companyId,
      },
    });

    return customer;
  },

  async updateCustomer(companyId: string, customerId: string, data: UpdateCustomerDto) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        companyId,
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data,
    });

    return updatedCustomer;
  },

  async deleteCustomer(companyId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        companyId,
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    await prisma.customer.delete({
      where: { id: customerId },
    });

    return { success: true };
  },
};
