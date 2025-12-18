import { Pool, RowDataPacket } from 'mysql2/promise';
import {
    CreateUserLoanDTO,
    UpdateUserLoanDTO,
    UserLoanDocument,
    UserLoanStatus,
    UserLoanType,
} from '@akademiasaas/shared';
import { v4 as uuidv4 } from 'uuid';

interface Dependencies {
    pool: Pool;
}

interface LoanRow extends RowDataPacket {
    id: string;
    user_id: string;
    name: string;
    total_amount: number;
    remaining_amount: number;
    interest_rate: number;
    currency: string;
    start_date: Date;
    end_date: Date;
    next_payment_date: Date;
    next_payment_amount: number;
    lender: string;
    loan_number: string | null;
    description: string | null;
    loan_type: string;
    status: string;
    payment_frequency: string;
    duration_in_months: number;
    category: string | null;
    documents: string | null;
    created_at: Date;
    updated_at: Date;
}

function toDate(value: Date | string | number): Date {
    if (value instanceof Date) return value;
    return new Date(value);
}

export class MariaDBUserLoanRepository {
    constructor(private dependencies: Dependencies) { }

    private mapRowToDocument(row: LoanRow): UserLoanDocument {
        return {
            id: row.id,
            userId: row.user_id,
            name: row.name,
            totalAmount: row.total_amount,
            remainingAmount: row.remaining_amount,
            interestRate: row.interest_rate,
            currency: row.currency,
            startDate: new Date(row.start_date).toISOString(),
            endDate: new Date(row.end_date).toISOString(),
            nextPaymentDate: new Date(row.next_payment_date).toISOString(),
            nextPaymentAmount: row.next_payment_amount,
            lender: row.lender,
            loanNumber: row.loan_number || undefined,
            description: row.description || undefined,
            loanType: row.loan_type as UserLoanType,
            status: row.status as UserLoanStatus,
            paymentFrequency: row.payment_frequency as 'monthly' | 'quarterly' | 'yearly' | 'custom',
            durationInMonths: row.duration_in_months,
            category: row.category || undefined,
            documents: row.documents ? JSON.parse(row.documents) : undefined,
            createdAt: new Date(row.created_at).toISOString(),
            updatedAt: new Date(row.updated_at).toISOString(),
        };
    }

    async create(dto: CreateUserLoanDTO): Promise<UserLoanDocument> {
        const id = uuidv4();
        const now = new Date();

        await this.dependencies.pool.execute(
            `INSERT INTO user_loans (
        id, user_id, name, total_amount, remaining_amount, interest_rate, currency,
        start_date, end_date, next_payment_date, next_payment_amount, lender,
        loan_number, description, loan_type, status, payment_frequency,
        duration_in_months, category, documents, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                dto.userId,
                dto.name,
                dto.totalAmount,
                dto.remainingAmount,
                dto.interestRate,
                dto.currency,
                toDate(dto.startDate),
                toDate(dto.endDate),
                toDate(dto.nextPaymentDate),
                dto.nextPaymentAmount,
                dto.lender,
                dto.loanNumber || null,
                dto.description || null,
                dto.loanType,
                dto.status,
                dto.paymentFrequency,
                dto.durationInMonths,
                dto.category || null,
                dto.documents ? JSON.stringify(dto.documents) : null,
                now,
                now,
            ]
        );

        return this.getById(id) as Promise<UserLoanDocument>;
    }

    async update(id: string, dto: UpdateUserLoanDTO): Promise<UserLoanDocument> {
        const fields: string[] = [];
        const values: unknown[] = [];

        if (dto.name !== undefined) {
            fields.push('name = ?');
            values.push(dto.name);
        }
        if (dto.totalAmount !== undefined) {
            fields.push('total_amount = ?');
            values.push(dto.totalAmount);
        }
        if (dto.remainingAmount !== undefined) {
            fields.push('remaining_amount = ?');
            values.push(dto.remainingAmount);
        }
        if (dto.interestRate !== undefined) {
            fields.push('interest_rate = ?');
            values.push(dto.interestRate);
        }
        if (dto.currency !== undefined) {
            fields.push('currency = ?');
            values.push(dto.currency);
        }
        if (dto.startDate !== undefined) {
            fields.push('start_date = ?');
            values.push(toDate(dto.startDate));
        }
        if (dto.endDate !== undefined) {
            fields.push('end_date = ?');
            values.push(toDate(dto.endDate));
        }
        if (dto.nextPaymentDate !== undefined) {
            fields.push('next_payment_date = ?');
            values.push(toDate(dto.nextPaymentDate));
        }
        if (dto.nextPaymentAmount !== undefined) {
            fields.push('next_payment_amount = ?');
            values.push(dto.nextPaymentAmount);
        }
        if (dto.lender !== undefined) {
            fields.push('lender = ?');
            values.push(dto.lender);
        }
        if (dto.loanNumber !== undefined) {
            fields.push('loan_number = ?');
            values.push(dto.loanNumber);
        }
        if (dto.description !== undefined) {
            fields.push('description = ?');
            values.push(dto.description);
        }
        if (dto.loanType !== undefined) {
            fields.push('loan_type = ?');
            values.push(dto.loanType);
        }
        if (dto.status !== undefined) {
            fields.push('status = ?');
            values.push(dto.status);
        }
        if (dto.paymentFrequency !== undefined) {
            fields.push('payment_frequency = ?');
            values.push(dto.paymentFrequency);
        }
        if (dto.durationInMonths !== undefined) {
            fields.push('duration_in_months = ?');
            values.push(dto.durationInMonths);
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
                `UPDATE user_loans SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Loan with id ${id} not found after update`);
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.dependencies.pool.execute('DELETE FROM user_loans WHERE id = ?', [id]);
    }

    async getById(id: string): Promise<UserLoanDocument | null> {
        const [rows] = await this.dependencies.pool.execute<LoanRow[]>(
            'SELECT * FROM user_loans WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return null;
        return this.mapRowToDocument(rows[0]);
    }

    async getByUserId(userId: string): Promise<UserLoanDocument[]> {
        const [rows] = await this.dependencies.pool.execute<LoanRow[]>(
            'SELECT * FROM user_loans WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows.map((row) => this.mapRowToDocument(row));
    }
}
