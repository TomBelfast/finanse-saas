import { Pool, RowDataPacket } from 'mysql2/promise';
import {
    NotificationDocument,
    NotificationStatus,
    NotificationType,
    WithId,
} from '@akademiasaas/shared';
import { v4 as uuidv4 } from 'uuid';

interface Dependencies {
    pool: Pool;
}

interface NotificationRow extends RowDataPacket {
    id: string;
    user_id: string; // Assuming we store userId to know who the notification is for
    type: string;
    event_date: string;
    data: string; // JSON
    status: string;
    timestamp: Date;
    event_timestamp: Date;
    connected_client_email: string | null;
    created_at: Date;
    updated_at: Date;
}

export class MariaDBNotificationsRepository {
    constructor(private dependencies: Dependencies) { }

    private mapRowToDocument(row: NotificationRow): WithId<NotificationDocument> {
        return {
            id: row.id,
            type: row.type as NotificationType,
            eventDate: row.event_date,
            data: JSON.parse(row.data),
            status: row.status as NotificationStatus,
            timestamp: row.timestamp,
            eventTimestamp: row.event_timestamp,
            connectedClientEmail: row.connected_client_email || undefined,
        };
    }

    async create(userId: string, notification: NotificationDocument): Promise<WithId<NotificationDocument>> {
        const id = uuidv4();
        const now = new Date();

        await this.dependencies.pool.execute(
            `INSERT INTO notifications (
        id, user_id, type, event_date, data, status, timestamp, event_timestamp,
        connected_client_email, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                userId,
                notification.type,
                notification.eventDate,
                JSON.stringify(notification.data),
                notification.status,
                notification.timestamp,
                notification.eventTimestamp,
                notification.connectedClientEmail || null,
                now,
                now,
            ]
        );

        return { ...notification, id };
    }

    async markAsRead(id: string): Promise<void> {
        await this.dependencies.pool.execute(
            'UPDATE notifications SET status = ?, updated_at = NOW() WHERE id = ?',
            [NotificationStatus.READ, id]
        );
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.dependencies.pool.execute(
            'UPDATE notifications SET status = ?, updated_at = NOW() WHERE user_id = ? AND status = ?',
            [NotificationStatus.READ, userId, NotificationStatus.UNREAD]
        );
    }

    async getByUserId(userId: string, limit: number = 20): Promise<WithId<NotificationDocument>[]> {
        const [rows] = await this.dependencies.pool.execute<NotificationRow[]>(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
            [userId, limit]
        );
        return rows.map((row) => this.mapRowToDocument(row));
    }

    async getUnreadCount(userId: string): Promise<number> {
        const [rows] = await this.dependencies.pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND status = ?',
            [userId, NotificationStatus.UNREAD]
        );
        return rows[0].count;
    }
}
