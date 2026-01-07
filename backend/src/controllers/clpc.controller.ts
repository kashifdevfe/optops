import { Request, Response } from 'express';
import { clpcService } from '../services/clpc.service.js';
import { validate } from '../middleware/validation.middleware.js';

export const clpcController = {
  calculate(req: Request, res: Response): void {
    try {
      const result = clpcService.calculate(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
