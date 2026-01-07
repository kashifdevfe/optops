import { Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const dashboardController = {
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stats = await dashboardService.getStats(req.companyId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
