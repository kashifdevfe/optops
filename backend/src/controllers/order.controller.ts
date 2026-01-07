import { Response } from 'express';
import { orderService } from '../services/order.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const orderController = {
  async getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const orders = await orderService.getOrders(req.companyId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const order = await orderService.getOrderById(req.companyId, req.params.id);
      res.json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // If companyId is set (from auth), use it; otherwise, determine from products
      const companyId = req.companyId || null;
      const order = await orderService.createOrder(req.body, companyId);
      res.status(201).json(order);
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(400).json({ error: error.message });
    }
  },

  async updateOrderStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const order = await orderService.updateOrderStatus(req.companyId, req.params.id, req.body);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};

