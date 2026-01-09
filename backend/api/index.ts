import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import routes from '../src/routes/index.js';
import { errorHandler } from '../src/middleware/error.middleware.js';

const app = express();

// Trust Vercel Proxy (Required for secure cookies)
app.set('trust proxy', 1);

// CORS Configuration - Allow ALL origins for now to debug
app.use((req: Request, res: Response, next: NextFunction) => {
  // Set CORS headers manually for maximum compatibility
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
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
      sameSite: 'none', // Changed to 'none' for cross-origin cookies
    },
  })
);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Export for Vercel serverless
export default app;

