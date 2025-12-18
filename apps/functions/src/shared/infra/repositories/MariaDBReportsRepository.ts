import { Pool, RowDataPacket } from 'mysql2/promise';
import {
    CreatorStatsDocument,
    CreatorMonthStatsDocument,
    SubscriptionPlan
} from '@akademiasaas/shared';

interface Dependencies {
    pool: Pool;
}

interface CreatorStatsRow extends RowDataPacket {
    id: string; // Assuming base document has ID, though interface implies CreatorStatsDocument extends SubscribersStats which doesn't enforce ID... wait, BaseDocument usually has ID. Assuming ID exists or PK is creator_id.
    creator_id: string;
    creator_name: string;
    creator_email: string;
    total_products: number;
    total_transactions: number;
    earned_money: string; // JSON
    requires_action: string | null; // JSON
    current_tier: string | null;
    created_at: Date;
    updated_at: Date;
    // SubscribersStats
    total_free_subscribers: number;
    total_paid_subscribers: number;
    total_imported_free_subscribers: number;
    total_imported_paid_subscribers: number;
    total_archived_subscribers: number;
    total_uploaded_bytes: number;
}

interface CreatorMonthStatsRow extends RowDataPacket {
    id: string;
    creator_id: string;
    month_year: string;
    month_year_date: Date;
    free_subscribers: number;
    paid_subscribers: number;
    imported_free_subscribers: number;
    imported_paid_subscribers: number;
    transactions: number;
    one_time_transactions: number;
    earned_money: string; // JSON
    transactions_per_product: string; // JSON
    created_at: Date;
    updated_at: Date;
}

export class MariaDBReportsRepository {
    constructor(private dependencies: Dependencies) { }

    private mapCreatorStatsRow(row: CreatorStatsRow): CreatorStatsDocument {
        return {
            creatorId: row.creator_id,
            creatorName: row.creator_name,
            creatorEmail: row.creator_email,
            totalNumberOfProducts: row.total_products,
            totalNumberOfOneTimeTransactions: row.total_transactions,
            totalAmountOfEarnedMoney: JSON.parse(row.earned_money),
            requiresAction: row.requires_action ? JSON.parse(row.requires_action) : null,
            currentTier: (row.current_tier as SubscriptionPlan) || null,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            totalNumberOfFreeSubscribers: row.total_free_subscribers,
            totalNumberOfPaidSubscribers: row.total_paid_subscribers,
            totalNumberOfImportedFreeSubscribers: row.total_imported_free_subscribers,
            totalNumberOfImportedPaidSubscribers: row.total_imported_paid_subscribers,
            totalNumberOfArchivedSubscribers: row.total_archived_subscribers,
            totalUploadedBytes: row.total_uploaded_bytes,
        };
    }

    private mapCreatorMonthStatsRow(row: CreatorMonthStatsRow): CreatorMonthStatsDocument {
        return {
            creatorId: row.creator_id,
            monthYear: row.month_year,
            monthYearDate: row.month_year_date,
            numberOfFreeSubscribers: row.free_subscribers,
            numberOfPaidSubscribers: row.paid_subscribers,
            numberOfImportedFreeSubscribers: row.imported_free_subscribers,
            numberOfImportedPaidSubscribers: row.imported_paid_subscribers,
            numberOfTransactions: row.transactions,
            numberOfOneTimeTransactions: row.one_time_transactions,
            amountOfEarnedMoney: JSON.parse(row.earned_money),
            numberOfTransactionsPerProduct: JSON.parse(row.transactions_per_product),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    async getCreatorStats(creatorId: string): Promise<CreatorStatsDocument | null> {
        const [rows] = await this.dependencies.pool.execute<CreatorStatsRow[]>(
            'SELECT * FROM creator_stats WHERE creator_id = ?',
            [creatorId]
        );
        if (rows.length === 0) return null;
        return this.mapCreatorStatsRow(rows[0]);
    }

    async getCreatorMonthStats(creatorId: string, limit: number = 12): Promise<CreatorMonthStatsDocument[]> {
        const [rows] = await this.dependencies.pool.execute<CreatorMonthStatsRow[]>(
            'SELECT * FROM creator_month_stats WHERE creator_id = ? ORDER BY month_year_date DESC LIMIT ?',
            [creatorId, limit]
        );
        return rows.map(r => this.mapCreatorMonthStatsRow(r));
    }

    async saveCreatorStats(stats: CreatorStatsDocument): Promise<void> {
        // Upsert
        const moneyJson = JSON.stringify(stats.totalAmountOfEarnedMoney);
        const actionJson = stats.requiresAction ? JSON.stringify(stats.requiresAction) : null;
        const now = new Date();

        await this.dependencies.pool.execute(
            `INSERT INTO creator_stats (
        creator_id, creator_name, creator_email, total_products, total_transactions,
        earned_money, requires_action, current_tier, 
        total_free_subscribers, total_paid_subscribers, total_imported_free_subscribers,
        total_imported_paid_subscribers, total_archived_subscribers, total_uploaded_bytes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        creator_name = VALUES(creator_name),
        creator_email = VALUES(creator_email),
        total_products = VALUES(total_products),
        total_transactions = VALUES(total_transactions),
        earned_money = VALUES(earned_money),
        requires_action = VALUES(requires_action),
        current_tier = VALUES(current_tier),
        total_free_subscribers = VALUES(total_free_subscribers),
        total_paid_subscribers = VALUES(total_paid_subscribers),
        total_imported_free_subscribers = VALUES(total_imported_free_subscribers),
        total_imported_paid_subscribers = VALUES(total_imported_paid_subscribers),
        total_archived_subscribers = VALUES(total_archived_subscribers),
        total_uploaded_bytes = VALUES(total_uploaded_bytes),
        updated_at = VALUES(updated_at)
      `,
            [
                stats.creatorId, stats.creatorName, stats.creatorEmail, stats.totalNumberOfProducts, stats.totalNumberOfOneTimeTransactions,
                moneyJson, actionJson, stats.currentTier,
                stats.totalNumberOfFreeSubscribers, stats.totalNumberOfPaidSubscribers, stats.totalNumberOfImportedFreeSubscribers,
                stats.totalNumberOfImportedPaidSubscribers, stats.totalNumberOfArchivedSubscribers, stats.totalUploadedBytes,
                stats.createdAt || now, now
            ]
        );
    }

    // Similar for saveCreatorMonthStats... (simplified for now)
}
