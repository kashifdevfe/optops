import { Response } from 'express';
import { companyService } from '../services/company.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const companyController = {
  async getCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const company = await companyService.getCompany(req.companyId);
      res.json(company);
    } catch (error: any) {
      console.error('Error in getCompany:', error);
      if (error.message === 'Company not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },

  async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const company = await companyService.updateCompanySettings(req.companyId, req.body);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateThemeSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const themeSettings = await companyService.updateThemeSettings(req.companyId, req.body);
      res.json(themeSettings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      // Password validation is handled in hashPassword function
      await companyService.updatePassword(req.companyId, currentPassword, newPassword);
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
