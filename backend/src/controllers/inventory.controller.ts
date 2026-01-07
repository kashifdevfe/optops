import { Response } from 'express';
import { inventoryService } from '../services/inventory.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const inventoryController = {
  async getInventoryItems(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const category = req.query.category as string | undefined;
      const items = await inventoryService.getInventoryItems(req.companyId, category);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createInventoryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const item = await inventoryService.createInventoryItem(req.companyId, req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateInventoryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const itemId = req.params.id;
      const item = await inventoryService.updateInventoryItem(req.companyId, itemId, req.body);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteInventoryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const itemId = req.params.id;
      await inventoryService.deleteInventoryItem(req.companyId, itemId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getInventorySummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const summary = await inventoryService.getInventorySummary(req.companyId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTotalInventoryValue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const totalValue = await inventoryService.getTotalInventoryValue(req.companyId);
      res.json({ totalValue });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
