import { Pool } from 'mysql2/promise';
import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { MariaDBUsersRepository } from './MariaDBUsersRepository';
import { getDatabasePool } from '../database';

/**
 * Creates a UsersRepository instance.
 * The application now uses MariaDB exclusively.
 * 
 * @param _db - Legacy parameter, ignored (was Firestore)
 * @returns MariaDBUsersRepository instance
 */
export function createUsersRepository(_db?: unknown): UsersRepository {
  const pool = getDatabasePool();
  return new MariaDBUsersRepository({ pool });
}

// MariaDB is now the only database backend
export const USE_MARIADB = true;
