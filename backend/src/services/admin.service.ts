import prisma from '../config/database.js';
import { comparePassword, hashPassword } from '../utils/bcrypt.js';

// Import necessary utils
import { generateAccessToken } from '../utils/jwt.js';

export const adminService = {
  async login(email: string, password: string) {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!superAdmin || !superAdmin.isActive) {
      throw new Error('Invalid super admin credentials');
    }

    const isValidPassword = await comparePassword(password, superAdmin.password);

    if (!isValidPassword) {
      throw new Error('Invalid super admin credentials');
    }

    // Generate token - using same JWT util but payload might need to distinguish admin
    // Or we just encode isAdmin: true in it?
    // The current JWT util might expect specific payload format.
    // Let's assume standard payload. If verifyAccessToken expects specific fields, we might need to adjust.
    // However, verifyAccessToken usually just decodes.
    // Ideally we should use a specific admin token, but for reuse/simplicity with existing middleware:
    // We'll create a token that passes the authenticate/optionalAuth but also carries admin info

    // For now, let's just create a token with the admin ID as userId (though it's not in user table)
    // and a dummy companyId if needed, OR better:
    // The authenticate middleware checks prisma.user.findUnique. This will fail for admin ID.
    // So we need a separate middleware for admin or update the middleware to handle admin tokens.

    // BUT since we are switching to token-based for users, admins also need token.
    // We should return an accessToken here.

    // Hack/Quick Fix: Generate a token that bypasses standard auth middleware if we use a specific admin middleware
    // We already have 'requireAdmin' middleware. Let's update THAT to verify token.

    const token = generateAccessToken({
      userId: superAdmin.id,
      companyId: 'super-admin',
      role: 'super-admin'
    });

    return {
      email: superAdmin.email,
      name: superAdmin.name,
      isAdmin: true,
      role: 'super-admin',
      accessToken: token
    };
  },

  async getAllCompanies() {
    const companies = await prisma.company.findMany({
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
        _count: {
          select: {
            customers: true,
            sales: true,
            inventoryItems: true,
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return companies;
  },

  async getCompanyDetails(companyId: string) {
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
        customers: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            createdAt: true,
            _count: {
              select: {
                sales: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        sales: {
          select: {
            id: true,
            orderNo: true,
            total: true,
            status: true,
            createdAt: true,
            customer: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            customers: true,
            sales: true,
            inventoryItems: true,
            users: true,
          },
        },
      },
    });

    return company;
  },

  async getAllCustomers() {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            sales: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return customers;
  },

  async getCustomerDetails(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sales: {
          select: {
            id: true,
            orderNo: true,
            total: true,
            status: true,
            frame: true,
            lens: true,
            createdAt: true,
            deliveryDate: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return customer;
  },

  async updateCompany(companyId: string, data: {
    name?: string;
    email?: string;
    address?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    isActive?: boolean;
    ecommerceEnabled?: boolean;
    password?: string;
  }) {
    const updateData: any = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.address !== undefined && { address: data.address || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.ecommerceEnabled !== undefined && { ecommerceEnabled: data.ecommerceEnabled }),
    };

    // Handle password update separately to hash it
    if (data.password !== undefined && data.password !== '') {
      updateData.password = await hashPassword(data.password);
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
        _count: {
          select: {
            customers: true,
            sales: true,
            inventoryItems: true,
            users: true,
          },
        },
      },
    });

    return company;
  },

  async deleteCompany(companyId: string) {
    // Prisma will cascade delete related records
    await prisma.company.delete({
      where: { id: companyId },
    });
  },

  async updateCustomer(customerId: string, data: {
    name?: string;
    phone?: string;
    address?: string;
  }) {
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            sales: true,
          },
        },
      },
    });

    return customer;
  },

  async deleteCustomer(customerId: string) {
    // Prisma will cascade delete related sales
    await prisma.customer.delete({
      where: { id: customerId },
    });
  },
};

