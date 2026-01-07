import { Response } from 'express';
import { userService } from '../services/user.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const userController = {
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const users = await userService.getUsers(req.companyId);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await userService.createUser(req.companyId, req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userId = req.params.id;
      const user = await userService.updateUser(req.companyId, userId, req.body);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userId = req.params.id;
      await userService.deleteUser(req.companyId, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
