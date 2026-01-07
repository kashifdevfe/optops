import prisma from '../config/database.js';
import { CreateProductDto, UpdateProductDto, GetProductsQueryDto } from '../dto/product.dto.js';

export const productService = {
  async getProducts(companyId: string | null, filters?: GetProductsQueryDto) {
    const where: any = {};

    // If companyId is provided, filter by company
    // If not provided (ecommerce frontend), show products from all companies with ecommerce enabled
    if (companyId) {
      where.companyId = companyId;
    } else {
      // Get all companies with ecommerce enabled
      const companiesWithEcommerce = await prisma.company.findMany({
        where: { ecommerceEnabled: true },
        select: { id: true },
      });
      const companyIds = companiesWithEcommerce.map((c) => c.id);
      if (companyIds.length > 0) {
        where.companyId = { in: companyIds };
      } else {
        // If no companies have ecommerce enabled, return empty array
        return [];
      }
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.gender) {
      where.gender = filters.gender;
    }

    if (filters?.frameType) {
      where.frameType = filters.frameType;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.featured !== undefined) {
      // Convert string to boolean if needed
      const featuredValue = filters.featured;
      where.featured = typeof featuredValue === 'boolean' 
        ? featuredValue 
        : featuredValue === 'true' || featuredValue === '1';
    }

    const products = await prisma.ecommerceProduct.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  },

  async getProductById(companyId: string | null, productId: string) {
    const where: any = { id: productId };
    if (companyId) {
      where.companyId = companyId;
    }
    const product = await prisma.ecommerceProduct.findFirst({
      where,
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  },

  async createProduct(companyId: string, data: CreateProductDto) {
    const product = await prisma.ecommerceProduct.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        images: data.images,
        category: data.category,
        gender: data.gender || null,
        frameType: data.frameType || null,
        lensType: data.lensType || null,
        frameSize: data.frameSize || null,
        inStock: data.inStock !== undefined ? data.inStock : true,
        stockCount: data.stockCount || 0,
        featured: data.featured || false,
        companyId,
      },
    });

    return product;
  },

  async updateProduct(companyId: string, productId: string, data: UpdateProductDto) {
    const product = await prisma.ecommerceProduct.findFirst({
      where: {
        id: productId,
        companyId,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const updatedProduct = await prisma.ecommerceProduct.update({
      where: { id: productId },
      data,
    });

    return updatedProduct;
  },

  async deleteProduct(companyId: string, productId: string) {
    const product = await prisma.ecommerceProduct.findFirst({
      where: {
        id: productId,
        companyId,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    await prisma.ecommerceProduct.delete({
      where: { id: productId },
    });

    return { success: true };
  },
};

