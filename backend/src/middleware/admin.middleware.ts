import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import prisma from '../config/database.js';

export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = req.session;
  
  if (!session || !session.isAdmin || !session.adminEmail) {
    res.status(403).json({ error: 'Super Admin access required' });
    return;
  }

  // Verify super admin exists and is active in database
  try {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email: session.adminEmail },
      select: { isActive: true },
    });

    if (!superAdmin || !superAdmin.isActive) {
      res.status(403).json({ error: 'Super Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking super admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

