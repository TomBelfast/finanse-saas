import { Pool, RowDataPacket } from 'mysql2/promise';
import {
  CreateUserSubscriptionDTO,
  UpdateUserSubscriptionDTO,
  UserSubscriptionDocument,
  UserSubscriptionStatus,
} from '@akademiasaas/shared';
import { v4 as uuidv4 } from 'uuid';

interface Dependencies {
  pool: Pool;
}

/**
 * Database row type for user_subscriptions table
 */
interface SubscriptionRow extends RowDataPacket {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  period_start: Date;
  period_end: Date;
  renewal_date: Date;
  provider: string;
  description: string | null;
  status: string;
  is_automatic_renewal: number;
  category: string | null;
  documents: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Helper to extract Date from various formats
 */
function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

export class MariaDBUserSubscriptionRepository {
  constructor(private dependencies: Dependencies) { }

  private mapRowToDocument(row: SubscriptionRow): UserSubscriptionDocument {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      amount: row.amount,
      currency: row.currency,
      periodStart: new Date(row.period_start).toISOString(),
      periodEnd: new Date(row.period_end).toISOString(),
      renewalDate: new Date(row.renewal_date).toISOString(),
      provider: row.provider,
      description: row.description || undefined,
      status: row.status as UserSubscriptionStatus,
      isAutomaticRenewal: Boolean(row.is_automatic_renewal),
      category: row.category || undefined,
      documents: row.documents ? JSON.parse(row.documents) : undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async create(dto: CreateUserSubscriptionDTO): Promise<UserSubscriptionDocument> {
    const id = uuidv4();
    const now = new Date();

    await this.dependencies.pool.execute(
      `INSERT INTO user_subscriptions (
        id, user_id, name, amount, currency, period_start, period_end,
        renewal_date, provider, description, status, is_automatic_renewal,
        category, documents, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.userId,
        dto.name,
        dto.amount,
        dto.currency,
        toDate(dto.periodStart),
        toDate(dto.periodEnd),
        toDate(dto.renewalDate),
        dto.provider,
        dto.description || null,
        dto.status,
        dto.isAutomaticRenewal,
        dto.category || null,
        dto.documents ? JSON.stringify(dto.documents) : null,
        now,
        now,
      ]
    );

    return this.getById(id) as Promise<UserSubscriptionDocument>;
  }

  async update(id: string, dto: UpdateUserSubscriptionDTO): Promise<UserSubscriptionDocument> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (dto.name !== undefined) {
      fields.push('name = ?');
      values.push(dto.name);
    }
    if (dto.amount !== undefined) {
      fields.push('amount = ?');
      values.push(dto.amount);
    }
    if (dto.currency !== undefined) {
      fields.push('currency = ?');
      values.push(dto.currency);
    }
    if (dto.periodStart !== undefined) {
      fields.push('period_start = ?');
      values.push(toDate(dto.periodStart));
    }
    if (dto.periodEnd !== undefined) {
      fields.push('period_end = ?');
      values.push(toDate(dto.periodEnd));
    }
    if (dto.renewalDate !== undefined) {
      fields.push('renewal_date = ?');
      values.push(toDate(dto.renewalDate));
    }
    if (dto.provider !== undefined) {
      fields.push('provider = ?');
      values.push(dto.provider);
    }
    if (dto.description !== undefined) {
      fields.push('description = ?');
      values.push(dto.description);
    }
    if (dto.status !== undefined) {
      fields.push('status = ?');
      values.push(dto.status);
    }
    if (dto.isAutomaticRenewal !== undefined) {
      fields.push('is_automatic_renewal = ?');
      values.push(dto.isAutomaticRenewal);
    }
    if (dto.category !== undefined) {
      fields.push('category = ?');
      values.push(dto.category);
    }
    if (dto.documents !== undefined) {
      fields.push('documents = ?');
      values.push(JSON.stringify(dto.documents));
    }

    if (fields.length > 0) {
      fields.push('updated_at = NOW()');
      values.push(id);
      await this.dependencies.pool.execute(
        `UPDATE user_subscriptions SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Subscription with id ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.dependencies.pool.execute('DELETE FROM user_subscriptions WHERE id = ?', [id]);
  }

  async getById(id: string): Promise<UserSubscriptionDocument | null> {
    const [rows] = await this.dependencies.pool.execute<SubscriptionRow[]>(
      'SELECT * FROM user_subscriptions WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return this.mapRowToDocument(rows[0]);
  }

  // TODO: Add database index on user_subscriptions(user_id, created_at) for better query performance
  // OPTIMIZATION: Consider adding pagination support (limit/offset) for users with many subscriptions
  async getByUserId(userId: string): Promise<UserSubscriptionDocument[]> {
    const [rows] = await this.dependencies.pool.execute<SubscriptionRow[]>(
      'SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map((row) => this.mapRowToDocument(row));
  }

  async getActiveSubscriptionsForUser(userId: string): Promise<UserSubscriptionDocument[]> {
    const [rows] = await this.dependencies.pool.execute<SubscriptionRow[]>(
      'SELECT * FROM user_subscriptions WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
      [userId, 'active']
    );
    return rows.map((row) => this.mapRowToDocument(row));
  }

  async getUpcomingRenewals(days: number): Promise<UserSubscriptionDocument[]> {
    const [rows] = await this.dependencies.pool.execute<SubscriptionRow[]>(
      `SELECT * FROM user_subscriptions 
       WHERE renewal_date >= NOW() 
       AND renewal_date <= DATE_ADD(NOW(), INTERVAL ? DAY)
       AND status = ?
       ORDER BY renewal_date ASC`,
      [days, 'active']
    );
    return rows.map((row) => this.mapRowToDocument(row));
  }
}
