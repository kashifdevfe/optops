import { Response } from 'express';
import { auditService } from '../services/audit.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { getAuditsQuerySchema, createAuditSchema, updateAuditSchema } from '../dto/audit.dto.js';

export const auditController = {
  async getAudits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const query = getAuditsQuerySchema.parse(req.query);
      const result = await auditService.getAudits(req.companyId, query);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        return;
      }
      res.status(500).json({ error: error.message || 'Failed to fetch audits' });
    }
  },

  async getAudit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const audit = await auditService.getAuditById(req.companyId, req.params.id);
      res.json(audit);
    } catch (error: any) {
      res.status(404).json({ error: error.message || 'Audit not found' });
    }
  },

  async getInventoryItemsForAudit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const items = await auditService.getInventoryItemsForAudit(req.companyId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch inventory items' });
    }
  },

  async createAudit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data = createAuditSchema.parse(req.body);
      const audit = await auditService.createAudit(req.companyId, data);
      res.status(201).json(audit);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message || 'Failed to create audit' });
    }
  },

  async updateAudit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data = updateAuditSchema.parse(req.body);
      const audit = await auditService.updateAudit(req.companyId, req.params.id, data);
      res.json(audit);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message || 'Failed to update audit' });
    }
  },

  async deleteAudit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await auditService.deleteAudit(req.companyId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to delete audit' });
    }
  },
};

