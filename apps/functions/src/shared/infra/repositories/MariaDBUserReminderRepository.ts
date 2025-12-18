import { Pool, RowDataPacket } from 'mysql2/promise';
import {
    CreateUserReminderDTO,
    UpdateUserReminderDTO,
    UserReminderDocument,
    UserReminderItemType,
    UserReminderStatus,
} from '@akademiasaas/shared';
import { v4 as uuidv4 } from 'uuid';

interface Dependencies {
    pool: Pool;
}

interface ReminderRow extends RowDataPacket {
    id: string;
    user_id: string;
    item_id: string;
    item_type: string;
    days_before_date: number;
    status: string;
    is_enabled: number;
    target_date: Date;
    scheduled_date: Date;
    email_template: string | null;
    custom_message: string | null;
    created_at: Date;
    updated_at: Date;
    sent_at: Date | null;
}

function toDate(value: Date | string | number): Date {
    if (value instanceof Date) return value;
    return new Date(value);
}

export class MariaDBUserReminderRepository {
    constructor(private dependencies: Dependencies) { }

    private mapRowToDocument(row: ReminderRow): UserReminderDocument {
        return {
            id: row.id,
            userId: row.user_id,
            itemId: row.item_id,
            itemType: row.item_type as UserReminderItemType,
            daysBeforeDate: row.days_before_date,
            status: row.status as UserReminderStatus,
            isEnabled: Boolean(row.is_enabled),
            targetDate: new Date(row.target_date).toISOString(),
            scheduledDate: new Date(row.scheduled_date).toISOString(),
            emailTemplate: row.email_template || undefined,
            customMessage: row.custom_message || undefined,
            createdAt: new Date(row.created_at).toISOString(),
            updatedAt: new Date(row.updated_at).toISOString(),
            sentAt: row.sent_at ? new Date(row.sent_at).toISOString() : undefined,
        };
    }

    async create(dto: CreateUserReminderDTO): Promise<UserReminderDocument> {
        const id = uuidv4();
        const now = new Date();
        // Default status is usually Active upon creation? DTO doesn't have status (omitted).
        const status = UserReminderStatus.Active;

        await this.dependencies.pool.execute(
            `INSERT INTO user_reminders (
        id, user_id, item_id, item_type, days_before_date, status, is_enabled,
        target_date, scheduled_date, email_template, custom_message,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                dto.userId,
                dto.itemId,
                dto.itemType,
                dto.daysBeforeDate,
                status,
                dto.isEnabled,
                toDate(dto.targetDate),
                toDate(dto.scheduledDate),
                dto.emailTemplate || null,
                dto.customMessage || null,
                now,
                now,
            ]
        );

        return this.getById(id) as Promise<UserReminderDocument>;
    }

    async update(id: string, dto: UpdateUserReminderDTO): Promise<UserReminderDocument> {
        const fields: string[] = [];
        const values: unknown[] = [];

        if (dto.daysBeforeDate !== undefined) {
            fields.push('days_before_date = ?');
            values.push(dto.daysBeforeDate);
        }
        if (dto.status !== undefined) {
            fields.push('status = ?');
            values.push(dto.status);
        }
        if (dto.isEnabled !== undefined) {
            fields.push('is_enabled = ?');
            values.push(dto.isEnabled);
        }
        if (dto.targetDate !== undefined) {
            fields.push('target_date = ?');
            values.push(toDate(dto.targetDate));
        }
        if (dto.scheduledDate !== undefined) {
            fields.push('scheduled_date = ?');
            values.push(toDate(dto.scheduledDate));
        }
        if (dto.emailTemplate !== undefined) {
            fields.push('email_template = ?');
            values.push(dto.emailTemplate);
        }
        if (dto.customMessage !== undefined) {
            fields.push('custom_message = ?');
            values.push(dto.customMessage);
        }

        if (fields.length > 0) {
            fields.push('updated_at = NOW()');
            values.push(id);
            await this.dependencies.pool.execute(
                `UPDATE user_reminders SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Reminder with id ${id} not found after update`);
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.dependencies.pool.execute('DELETE FROM user_reminders WHERE id = ?', [id]);
    }

    async getById(id: string): Promise<UserReminderDocument | null> {
        const [rows] = await this.dependencies.pool.execute<ReminderRow[]>(
            'SELECT * FROM user_reminders WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return null;
        return this.mapRowToDocument(rows[0]);
    }

    async getByUserId(userId: string): Promise<UserReminderDocument[]> {
        const [rows] = await this.dependencies.pool.execute<ReminderRow[]>(
            'SELECT * FROM user_reminders WHERE user_id = ? ORDER BY scheduled_date ASC',
            [userId]
        );
        return rows.map((row) => this.mapRowToDocument(row));
    }

    // Additional methods useful for reminders worker
    async getPendingReminders(limit: number = 100): Promise<UserReminderDocument[]> {
        const now = new Date();
        const [rows] = await this.dependencies.pool.execute<ReminderRow[]>(
            `SELECT * FROM user_reminders 
       WHERE is_enabled = 1 
       AND status = 'active'
       AND scheduled_date <= ?
       LIMIT ?`,
            [now, limit]
        );
        return rows.map((row) => this.mapRowToDocument(row));
    }
}
