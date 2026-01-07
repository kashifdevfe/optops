import { Response } from 'express';
import { productService } from '../services/product.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const productController = {
  async getProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // If companyId is set (from auth middleware), use it
      // Otherwise, pass null to get products from all companies with ecommerce enabled
      const companyId = req.companyId || null;
      const products = await productService.getProducts(companyId, req.query as any);
      res.json(products);
    } catch (error: any) {
      console.error('Error in getProducts:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // If companyId is set (from auth middleware), use it
      // Otherwise, pass null to get product from any company with ecommerce enabled
      const companyId = req.companyId || null;
      const product = await productService.getProductById(companyId, req.params.id);
      res.json(product);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const product = await productService.createProduct(req.companyId, req.body);
      res.status(201).json(product);
    } catch (error: any) {
      console.error('Error creating product:', error);
      res.status(400).json({ error: error.message || 'Failed to create product' });
    }
  },

  async updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const product = await productService.updateProduct(req.companyId, req.params.id, req.body);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await productService.deleteProduct(req.companyId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};

