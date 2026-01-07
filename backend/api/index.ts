import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { config } from '../src/config/env.js';
import routes from '../src/routes/index.js';
import { errorHandler } from '../src/middleware/error.middleware.js';

const app = express();

// CRITICAL: CORS middleware MUST be first - handle ALL requests
// This middleware handles CORS for all requests including OPTIONS preflight
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;
  
  // Set CORS headers for ALL requests - ALWAYS set these headers
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Allow all origins if no origin (for debugging)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  
  // Handle OPTIONS preflight request - return immediately with proper headers
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] OPTIONS preflight from origin: ${origin || 'none'}`);
    console.log(`[CORS] Request path: ${req.path}`);
    console.log(`[CORS] Request method: ${req.method}`);
    return res.status(204).end();
  }
  
  // Wrap res.json to ensure CORS headers are always present
  const originalJson = res.json.bind(res);
  res.json = function(body: any) {
    // Ensure CORS headers are set before sending response
    if (origin) {
      this.setHeader('Access-Control-Allow-Origin', origin);
    }
    return originalJson(body);
  };
  
  next();
});

// Additional CORS middleware as backup
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins for debugging
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

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 404 handler - ensure CORS headers are set
app.use((req: Request, res: Response) => {
  const origin = req.headers.origin as string | undefined;
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
