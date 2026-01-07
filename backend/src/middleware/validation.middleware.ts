import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { setCorsHeaders } from '../utils/cors.js';

export const validate = (schema: ZodSchema, source: 'body' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = source === 'query' ? req.query : req.body;
      const validated = schema.parse(dataToValidate);
      
      if (source === 'query') {
        req.query = validated as any;
      } else {
        req.body = validated;
      }
      
      next();
    } catch (error: unknown) {
      // CRITICAL: Set CORS headers before sending validation error
      const origin = req.headers.origin as string | undefined;
      setCorsHeaders(res, origin);
      
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        res.status(400).json({
          error: errorMessages.join(', ') || 'Validation failed',
          details: error.errors,
        });
        return;
      }
      res.status(400).json({ error: 'Invalid request data' });
    }
  };
};
