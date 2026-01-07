import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Session } from 'express-session';

export interface AuthTokenPayload extends JwtPayload {
  companyId: string;
  userId: string;
  email: string;
}

export interface SessionData extends Session {
  adminEmail?: string;
  isAdmin?: boolean;
}

export interface AuthenticatedRequest extends Request {
  companyId?: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string;
  };
  session?: SessionData;
}
