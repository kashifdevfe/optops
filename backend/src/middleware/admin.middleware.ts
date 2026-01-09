import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import prisma from '../config/database.js';

import { verifyAccessToken } from '../utils/jwt.js';

export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('Admin Middleware: No token provided');
      res.status(401).json({ error: 'Authentication required (No Token)' });
      return;
    }

    const decoded = verifyAccessToken(token) as any; // Cast to any to access role if not in type
    console.log('Admin Middleware: Decoded token:', JSON.stringify(decoded, null, 2));

    // Check if it's an admin token
    if (decoded.role !== 'super-admin') {
      console.log('Admin Middleware: Role mismatch. Expected super-admin, got:', decoded.role);
      res.status(403).json({ error: `Super Admin access required (Role mismatch: ${decoded.role})` });
      return;
    }

    // Verify super admin exists and is active in database
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, isActive: true },
    });

    if (!superAdmin || !superAdmin.isActive) {
      console.log('Admin Middleware: Admin not found or inactive in DB for ID:', decoded.userId);
      res.status(403).json({ error: `Super Admin access required (Admin not found in DB: ${decoded.userId})` });
      return;
    }

    // Attach admin info to request if needed, or just proceed
    // req.user could be used but types might mismatch
    // req.session = { ...req.session, isAdmin: true, adminEmail: superAdmin.email }; // Removed to fix TS error and we don't need session


    next();
  } catch (error) {
    console.error('Error checking super admin:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

