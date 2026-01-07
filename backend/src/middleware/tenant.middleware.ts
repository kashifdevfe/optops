import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import prisma from '../config/database.js';

export const enforceTenantIsolation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.companyId) {
    res.status(401).json({ error: 'Company context required' });
    return;
  }

  const company = await prisma.company.findUnique({
    where: { id: req.companyId },
    select: { id: true, isActive: true },
  });

  if (!company || !company.isActive) {
    res.status(403).json({ error: 'Company access denied' });
    return;
  }

  next();
};
