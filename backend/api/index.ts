import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { config } from '../src/config/env.js';
import routes from '../src/routes/index.js';
import { errorHandler } from '../src/middleware/error.middleware.js';

const app = express();

// Manual CORS Middleware - Robust for Vercel/Serverless
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Debug log to verify if this code is running in Vercel logs
  console.log(`[CORS Request] Method: ${req.method}, Path: ${req.path}, Origin: ${origin}`);

  // Set the Origin header
  // If specific origin exists, echo it back.
  // We prioritize the incoming origin to support credentials.
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback for tools like Postman or S2S, but note: this conflicts with Credentials=true in browsers.
    // However, browsers ALWAYS send Origin.
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Allow credentials (cookies, sessions)
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Allow all standard methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');

  // Allow all headers that might be requested
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  })
);

// Explicitly handle OPTIONS for all API routes BEFORE mounting routes
// This is a backup handler in case the middleware doesn't catch it
// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Export for Vercel serverless
// Vercel's @vercel/node automatically wraps Express apps
export default app;
