// Standalone Express server (replacement for Firebase Functions)
// Load environment variables from .env.local FIRST, before any other imports
// This is critical because Clerk SDK reads CLERK_SECRET_KEY during module initialization
import './config/loadEnv';

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { getDatabasePool } from './shared/infra/database';
import { createUsersRepository } from './shared/infra/repositories/repositoryFactory';
import { db } from './config/bootstrap';
import { logger } from './shared/utils/logger';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware - CORS must be first!
// CORS configuration with environment-based origin whitelist
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }

  // Development: Allow all origins for local development
  // Production: Must set CORS_ALLOWED_ORIGINS environment variable
  if (process.env.NODE_ENV === 'production') {
    logger.warn('CORS_ALLOWED_ORIGINS not set in production - this is insecure!');
    return [];
  }

  // Development fallback
  return ['*'];
};

const allowedOrigins = getAllowedOrigins();
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (direct API calls, mobile apps, Postman, etc.)
    // In production, we still allow no-origin requests (they're not from browsers)
    if (!origin) {
      logger.debug('CORS: Request with no origin (direct API call)', { isDevelopment });
      return callback(null, true);
    }

    // Check if origin is allowed
    if (allowedOrigins.includes('*')) {
      logger.debug('CORS: Allowing all origins (*)', { origin });
      return callback(null, true);
    }

    if (origin && allowedOrigins.includes(origin)) {
      logger.debug('CORS: Allowed origin', { origin });
      return callback(null, true);
    }

    // Origin not allowed
    logger.warn('CORS: Blocked origin', {
      origin,
      allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : 'none configured'
    });
    callback(new Error(`CORS: Origin ${origin} is not allowed. Allowed origins: ${allowedOrigins.join(', ') || 'none configured'}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle OPTIONS preflight requests explicitly
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const isAllowed = !origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin);

  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204);
  } else {
    res.status(403).json({ error: 'CORS: Origin not allowed' });
  }
});

app.use((req, res, next) => {
  logger.httpRequest(req.method, req.url);
  next();
});
app.use(bodyParser.json({ limit: '50mb' })); // Increased for file uploads
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Import routes
import { usersRouter } from './modules/users/infra/restRoutes';
import { subscriptionsRouter } from './modules/userFinances/infra/restRoutes';
import { authRouter } from './modules/auth/infra/restRoutes';
import { testRouter } from './modules/userFinances/infra/testRoutes';
import { uploadRouter } from './modules/upload/infra/uploadRoutes';

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
// All finance routes (subscriptions, insurances, loans) are in one router
app.use('/api', subscriptionsRouter);
app.use('/api/test', testRouter);
app.use('/api/upload', uploadRouter);

// Error handler
interface ErrorWithStatus extends Error {
  status?: number;
}

app.use((err: ErrorWithStatus, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Request error', err, { url: req.url, method: req.method });
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
if (require.main === module) {
  const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces
  app.listen(PORT, HOST, () => {
    logger.info(`🚀 API Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    logger.info(`📊 Database: MariaDB (${process.env.DB_NAME || 'Finanse'})`);
    logger.info(`🌐 CORS: Enabled for all origins`);
    // Log Supabase configuration status
    if (process.env.VITE_SUPABASE_URL) {
      logger.info(`✅ Supabase: URL is configured`);
    } else {
      logger.warn(`⚠️  Supabase: URL is NOT configured - API authentication will fail!`);
    }
  });
}

export default app;
