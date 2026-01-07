import { Response } from 'express';
import { customerService } from '../services/customer.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const customerController = {
  async getCustomers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const customers = await customerService.getCustomers(req.companyId);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const customer = await customerService.createCustomer(req.companyId, req.body);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const customerId = req.params.id;
      const customer = await customerService.updateCustomer(req.companyId, customerId, req.body);
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const customerId = req.params.id;
      await customerService.deleteCustomer(req.companyId, customerId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
