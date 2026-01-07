import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { config } from '../src/config/env.js';
import routes from '../src/routes/index.js';
import { errorHandler } from '../src/middleware/error.middleware.js';

const app = express();

// CRITICAL: CORS middleware MUST be the absolute first middleware
// Handle ALL requests including OPTIONS preflight BEFORE anything else
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;
  
  // CRITICAL: When credentials: true, we CANNOT use '*' - must use specific origin
  // Always set the origin from the request (browser will send it)
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  // If no origin, don't set the header (for non-browser requests like curl)
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  
  // Handle OPTIONS preflight request - MUST return immediately
  // This MUST happen before any other middleware runs
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] OPTIONS preflight received`);
    console.log(`[CORS] Origin: ${origin || 'none'}`);
    console.log(`[CORS] Path: ${req.path}`);
    console.log(`[CORS] URL: ${req.url}`);
    console.log(`[CORS] Headers:`, JSON.stringify(req.headers, null, 2));
    // Send 204 No Content with CORS headers - use send() not end()
    res.status(204).send();
    return;
  }
  
  next();
});

// Additional CORS middleware as backup
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins for debugging
    console.log(`[CORS] cors middleware - origin: ${origin || 'none'}`);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

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
app.options('/api/*', (req: Request, res: Response) => {
  const origin = req.headers.origin as string | undefined;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  console.log(`[CORS] Explicit OPTIONS handler for /api/* from origin: ${origin || 'none'}`);
  res.status(204).send();
});

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 404 handler - ensure CORS headers are set
app.use((req: Request, res: Response) => {
  const origin = req.headers.origin as string | undefined;
  // Set CORS headers before sending 404
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Export for Vercel serverless
// Vercel's @vercel/node automatically wraps Express apps
export default app;
