import { Response } from 'express';

/**
 * Sets CORS headers on a response object
 * Must be called before sending any response
 */
export const setCorsHeaders = (res: Response, origin?: string | undefined): void => {
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Allow all origins if no origin specified (for debugging)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
};

/**
 * Sends a JSON response with CORS headers
 */
export const sendJsonWithCors = (
  res: Response,
  statusCode: number,
  data: any,
  origin?: string | undefined
): void => {
  setCorsHeaders(res, origin);
  res.status(statusCode).json(data);
};

