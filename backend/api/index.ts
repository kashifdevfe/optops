import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { config } from '../src/config/env.js';
import routes from '../src/routes/index.js';
import { errorHandler } from '../src/middleware/error.middleware.js';

const app = express();

// CORS configuration for production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_ECOMMERCE_URL,
  process.env.ECOMMERCE_URL, // Fallback for old env var name
  'http://localhost:5173', // Development frontend
  'http://localhost:3001', // Development ecommerce
  'https://optops-f7dh.vercel.app', // Add your frontend URL
].filter(Boolean);

// Handle CORS with proper preflight support
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Temporarily allow all origins for debugging - make strict later
      console.log(`CORS: Allowing origin ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Handle preflight requests explicitly - must be before other routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

app.use(express.json());
app.use(cookieParser());

// Session configuration - Use memory store for serverless (sessions won't persist across invocations)
// For production, consider using Redis or PostgreSQL session store
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

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

export default app;

