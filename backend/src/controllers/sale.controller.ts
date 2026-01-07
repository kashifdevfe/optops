import { Response } from 'express';
import { saleService } from '../services/sale.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const saleController = {
  async getSales(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const sales = await saleService.getSales(req.companyId);
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createSale(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const sale = await saleService.createSale(req.companyId, req.body);
      res.status(201).json(sale);
    } catch (error: any) {
      console.error('Create sale error:', error);
      res.status(400).json({ error: error.message || 'Failed to create sale' });
    }
  },

  async updateSale(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const saleId = req.params.id;
      const sale = await saleService.updateSale(req.companyId, saleId, req.body);
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteSale(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const saleId = req.params.id;
      await saleService.deleteSale(req.companyId, saleId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
