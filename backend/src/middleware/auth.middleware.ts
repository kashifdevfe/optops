import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../types/index.js';
import prisma from '../config/database.js';
import { setCorsHeaders } from '../utils/cors.js';

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // CRITICAL: Set CORS headers before sending auth error
      const origin = req.headers.origin as string | undefined;
      setCorsHeaders(res, origin);
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      // CRITICAL: Set CORS headers before sending auth error
      const origin = req.headers.origin as string | undefined;
      setCorsHeaders(res, origin);
      res.status(401).json({ error: 'Invalid or inactive user' });
      return;
    }

    const company = await prisma.company.findUnique({
      where: { id: decoded.companyId },
      select: { id: true, isActive: true },
    });

    if (!company || !company.isActive) {
      // CRITICAL: Set CORS headers before sending auth error
      const origin = req.headers.origin as string | undefined;
      setCorsHeaders(res, origin);
      res.status(401).json({ error: 'Invalid or inactive company' });
      return;
    }

    req.companyId = decoded.companyId;
    req.userId = decoded.userId;
    req.user = user;

    next();
  } catch (error) {
    // CRITICAL: Set CORS headers before sending auth error
    const origin = req.headers.origin as string | undefined;
    setCorsHeaders(res, origin);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Optional authentication - sets companyId if token is present, but doesn't fail if not
export const optionalAuth = async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // No token - continue without setting companyId (for public access)
      next();
      return;
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      const company = await prisma.company.findUnique({
        where: { id: decoded.companyId },
        select: { id: true, isActive: true },
      });

      if (company && company.isActive) {
        req.companyId = decoded.companyId;
        req.userId = decoded.userId;
        req.user = user;
      }
    }

    // Continue even if auth fails (for public access)
    next();
  } catch (error) {
    // Continue even if token is invalid (for public access)
    next();
  }
};