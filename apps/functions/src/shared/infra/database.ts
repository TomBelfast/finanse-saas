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

const defaultConfig: DatabaseConfig = {
  host: process.env.DB_HOST || '192.168.0.9',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'Saas',
  password: process.env.DB_PASSWORD || 'Finanse2025',
  database: process.env.DB_NAME || 'Finanse',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
};

// Create connection pool
let pool: mysql.Pool | null = null;

export function getDatabasePool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: defaultConfig.host,
      port: defaultConfig.port,
      user: defaultConfig.user,
      password: defaultConfig.password,
      database: defaultConfig.database,
      waitForConnections: true,
      connectionLimit: defaultConfig.connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
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
    return rows as T[];
  } finally {
    connection.release();
  }
}

// Helper function to execute a single query and return first result
export async function executeQueryOne<T = unknown>(
  query: string,
  params: unknown[] = []
): Promise<T | null> {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
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

