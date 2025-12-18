import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
}

/**
 * Get database configuration from environment variables.
 * All values are required - no hardcoded defaults for security.
 * @throws Error if required environment variables are missing
 */
function getDatabaseConfig(): DatabaseConfig {
  const requiredEnvVars = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  // Validate all required environment variables are present
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required database environment variables: ${missingVars.join(', ')}. ` +
      `Please set them in apps/functions/.env.local`
    );
  }

  return {
    host: requiredEnvVars.host!,
    port: parseInt(requiredEnvVars.port!, 10),
    user: requiredEnvVars.user!,
    password: requiredEnvVars.password!,
    database: requiredEnvVars.database!,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  };
}

// Create connection pool
let pool: mysql.Pool | null = null;

export function getDatabasePool(): mysql.Pool {
  if (!pool) {
    const config = getDatabaseConfig();
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: config.connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    logger.info('Database connection pool created', {
      host: config.host,
      port: config.port,
      database: config.database,
      connectionLimit: config.connectionLimit,
    });
  }
  return pool;
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Helper function to execute queries
export async function executeQuery<T = unknown>(
  query: string,
  params: unknown[] = []
): Promise<T[]> {
  const connection = await getDatabasePool().getConnection();
  try {
    logger.sql(query, params);
    const [rows] = await connection.execute(query, params);
    if (!Array.isArray(rows)) {
      logger.warn('Query returned non-array result', { query, params });
      return [];
    }
    return rows as T[];
  } catch (error: unknown) {
    logger.error('Database query error', {
      query,
      params,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    connection.release();
  }
}

// Helper function to execute a single query and return first result
export async function executeQueryOne<T = unknown>(
  query: string,
  params: unknown[] = []
): Promise<T | null> {
  try {
    const results = await executeQuery<T>(query, params);
    return results.length > 0 ? results[0] : null;
  } catch (error: unknown) {
    logger.error('Database queryOne error', {
      query,
      params,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Helper function for transactions
export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getDatabasePool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

