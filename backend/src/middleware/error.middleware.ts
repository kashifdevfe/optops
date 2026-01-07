import { Request, Response, NextFunction } from 'express';
import { setCorsHeaders } from '../utils/cors.js';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err);
  
  // CRITICAL: Set CORS headers before sending error response
  const origin = req.headers.origin as string | undefined;
  setCorsHeaders(res, origin);

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
