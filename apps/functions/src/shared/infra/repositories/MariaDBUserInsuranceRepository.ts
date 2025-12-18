import { Pool, RowDataPacket } from 'mysql2/promise';
import {
    CreateUserInsuranceDTO,
    UpdateUserInsuranceDTO,
    UserInsuranceDocument,
    UserInsuranceStatus,
    UserInsuranceType,
} from '@akademiasaas/shared';
import { v4 as uuidv4 } from 'uuid';

interface Dependencies {
    pool: Pool;
}

interface InsuranceRow extends RowDataPacket {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    currency: string;
    period_start: Date;
    period_end: Date;
    renewal_date: Date;
    insurance_company: string;
    policy_number: string | null;
    insured_object: string | null;
    description: string | null;
    insurance_type: string;
    status: string;
    category: string | null;
    documents: string | null;
    created_at: Date;
    updated_at: Date;
}

function toDate(value: Date | string | number): Date {
    if (value instanceof Date) return value;
    return new Date(value);
}

export class MariaDBUserInsuranceRepository {
    constructor(private dependencies: Dependencies) { }

    private mapRowToDocument(row: InsuranceRow): UserInsuranceDocument {
        return {
            id: row.id,
            userId: row.user_id,
            name: row.name,
            amount: row.amount,
            currency: row.currency,
            periodStart: new Date(row.period_start).toISOString(),
            periodEnd: new Date(row.period_end).toISOString(),
            renewalDate: new Date(row.renewal_date).toISOString(),
            insuranceCompany: row.insurance_company,
            policyNumber: row.policy_number || undefined,
            insuredObject: row.insured_object || undefined,
            description: row.description || undefined,
            insuranceType: row.insurance_type as UserInsuranceType,
            status: row.status as UserInsuranceStatus,
            category: row.category || undefined,
            documents: row.documents ? JSON.parse(row.documents) : undefined,
            createdAt: new Date(row.created_at).toISOString(),
            updatedAt: new Date(row.updated_at).toISOString(),
        };
    }

    async create(dto: CreateUserInsuranceDTO): Promise<UserInsuranceDocument> {
        const id = uuidv4();
        const now = new Date();

        await this.dependencies.pool.execute(
            `INSERT INTO user_insurances (
        id, user_id, name, amount, currency, period_start, period_end,
        renewal_date, insurance_company, policy_number, insured_object,
        description, insurance_type, status, category, documents,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                dto.userId,
                dto.name,
                dto.amount,
                dto.currency,
                toDate(dto.periodStart),
                toDate(dto.periodEnd),
                toDate(dto.renewalDate),
                dto.insuranceCompany,
                dto.policyNumber || null,
                dto.insuredObject || null,
                dto.description || null,
                dto.insuranceType,
                dto.status,
                dto.category || null,
                dto.documents ? JSON.stringify(dto.documents) : null,
                now,
                now,
            ]
        );

        return this.getById(id) as Promise<UserInsuranceDocument>;
    }

    async update(id: string, dto: UpdateUserInsuranceDTO): Promise<UserInsuranceDocument> {
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
        if (dto.insuranceCompany !== undefined) {
            fields.push('insurance_company = ?');
            values.push(dto.insuranceCompany);
        }
        if (dto.policyNumber !== undefined) {
            fields.push('policy_number = ?');
            values.push(dto.policyNumber);
        }
        if (dto.insuredObject !== undefined) {
            fields.push('insured_object = ?');
            values.push(dto.insuredObject);
        }
        if (dto.description !== undefined) {
            fields.push('description = ?');
            values.push(dto.description);
        }
        if (dto.insuranceType !== undefined) {
            fields.push('insurance_type = ?');
            values.push(dto.insuranceType);
        }
        if (dto.status !== undefined) {
            fields.push('status = ?');
            values.push(dto.status);
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
                `UPDATE user_insurances SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Insurance with id ${id} not found after update`);
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.dependencies.pool.execute('DELETE FROM user_insurances WHERE id = ?', [id]);
    }

    async getById(id: string): Promise<UserInsuranceDocument | null> {
        const [rows] = await this.dependencies.pool.execute<InsuranceRow[]>(
            'SELECT * FROM user_insurances WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return null;
        return this.mapRowToDocument(rows[0]);
    }

    // TODO: Add database index on user_insurances(user_id, created_at) for better query performance
    // OPTIMIZATION: Consider adding pagination support (limit/offset) for users with many insurances
    async getByUserId(userId: string): Promise<UserInsuranceDocument[]> {
        const [rows] = await this.dependencies.pool.execute<InsuranceRow[]>(
            'SELECT * FROM user_insurances WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows.map((row) => this.mapRowToDocument(row));
    }
}
