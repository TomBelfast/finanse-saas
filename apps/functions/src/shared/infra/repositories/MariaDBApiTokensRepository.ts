import { Pool, RowDataPacket } from 'mysql2/promise';
import { ApiTokenDocument } from '@akademiasaas/shared';

interface Dependencies {
    pool: Pool;
}

interface ApiTokenRow extends RowDataPacket {
    id: string;
    name: string;
    uid: string;
    expires_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export class MariaDBApiTokensRepository {
    constructor(private dependencies: Dependencies) { }

    private mapRowToDocument(row: ApiTokenRow): ApiTokenDocument {
        return {
            id: row.id,
            name: row.name,
            uid: row.uid,
            expiresAt: row.expires_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    async create(token: ApiTokenDocument): Promise<void> {
        const now = new Date();
        await this.dependencies.pool.execute(
            `INSERT INTO api_tokens (id, name, uid, expires_at, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                token.id,
                token.name,
                token.uid,
                token.expiresAt || null,
                token.createdAt || now,
                token.updatedAt || now
            ]
        );
    }

    async delete(id: string): Promise<void> {
        await this.dependencies.pool.execute('DELETE FROM api_tokens WHERE id = ?', [id]);
    }

    async getById(id: string): Promise<ApiTokenDocument | null> {
        const [rows] = await this.dependencies.pool.execute<ApiTokenRow[]>(
            'SELECT * FROM api_tokens WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return null;
        return this.mapRowToDocument(rows[0]);
    }

    async getByUserId(userId: string): Promise<ApiTokenDocument[]> {
        const [rows] = await this.dependencies.pool.execute<ApiTokenRow[]>(
            'SELECT * FROM api_tokens WHERE uid = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows.map(r => this.mapRowToDocument(r));
    }
}
