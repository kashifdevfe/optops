import { Response } from 'express';
import { categoryService } from '../services/category.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const categoryController = {
  async getCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const categories = await categoryService.getCategories(req.companyId);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const category = await categoryService.getCategoryById(req.companyId, req.params.id);
      res.json(category);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const category = await categoryService.createCategory(req.companyId, req.body);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const category = await categoryService.updateCategory(req.companyId, req.params.id, req.body);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await categoryService.deleteCategory(req.companyId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};

