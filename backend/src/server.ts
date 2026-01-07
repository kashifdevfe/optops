import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import helmet from 'helmet';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security: Helmet helps secure Express apps by setting HTTP response headers
// Protects against XSS, clickjacking, MIME sniffing, and other attacks
// Reference: https://helmetjs.github.io/
app.use(
  helmet({
    // Disable Content Security Policy for API routes
    // CSP is meant for HTML pages, not API JSON responses
    // The frontend server (Vite) should handle CSP for the frontend
    contentSecurityPolicy: false,
    // Cross-Origin policies - configured to work with CORS credentials
    crossOriginEmbedderPolicy: false, // Disable to allow CORS with credentials
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
    // HSTS (HTTP Strict Transport Security) - only in production
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    } : false,
  })
);

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.FRONTEND_ECOMMERCE_URL || 'http://localhost:3001',
      'http://localhost:3001',
      'http://localhost:5173',
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production, reject unknown origins for security
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Not allowed by CORS'));
      } else {
        // In development, allow but log warning
        callback(null, true);
      }
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Ensure sessions directory exists
const sessionsDir = path.join(__dirname, '../prisma');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

// Session configuration for admin with SQLite store
const SQLiteStoreSession = SQLiteStore(session);
app.use(
  session({
    store: new SQLiteStoreSession({
      db: 'sessions.db',
      dir: sessionsDir,
      table: 'sessions',
    }),
    name: 'admin.sid',
    secret: process.env.SESSION_SECRET || 'optops-admin-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true for HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/', // Ensure cookie is sent for all paths
    },
  })
);

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const PORT = config.port;

app.listen(PORT);
