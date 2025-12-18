import { EnvConfig } from '../shared/infra/types';
import { getDatabasePool } from '../shared/infra/database';
import { logger } from '../shared/utils/logger';

/**
 * Database connection pool (MariaDB)
 * The application has migrated from Firebase to MariaDB
 */
export const dbPool = getDatabasePool();

/**
 * Legacy db export for backward compatibility
 * @deprecated Use dbPool instead - Firestore is no longer used
 */
export const db = dbPool;

logger.info('Database initialized: MariaDB');

export const env: EnvConfig = {
  domain: process.env.DOMAIN || '',
  environmentName: process.env.ENVIRONMENT_NAME || '',
  secretProjectManagerId: process.env.ADMIN_SECRET_PROJECT_MANAGER_ID || '',
  pubsub: {
    businessEvents: process.env.PUBSUB_BUSINESS_EVENTS_TOPIC || 'bussines-events',
    invoicesEvents: process.env.PUBSUB_INVOICES_EVENTS_TOPIC || 'invoices-events',
    reports: process.env.PUBSUB_REPORTS_TOPIC || 'reports-events',
    admin: process.env.PUBSUB_ADMIN_TOPIC || 'admin-events',
  },
  postmark: {
    apiKey: process.env.POSTMARK_API_KEY || '',
    defaultSender: process.env.POSTMARK_FROM || '',
  },
  fakturownia: {
    apiKey: process.env.FAKTUROWNIA_API_KEY || '',
    apiUrl: process.env.FAKTUROWNIA_API_URL || '',
    departmentId: process.env.FAKTUROWNIA_DEPARTMENT_ID || '',
  },
  slack: {
    url: process.env.SLACK_URL || '',
    channel: process.env.SLACK_CHANNEL || '',
  },
  stripe: {
    apiKey: process.env.STRIPE_API_KEY || '',
    clientId: process.env.STRIPE_CLIENT_ID || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    productId: process.env.STRIPE_PRODUCT_ID || '',
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT || '',
  api: {
    jwtPrivateKey: process.env.API_JWT_PRIVATE_KEY || '',
  },
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  },
};
