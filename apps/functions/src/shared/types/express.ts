import { Request, Response, NextFunction } from 'express'

/**
 * Clerk authentication data attached to request by ClerkExpressRequireAuth middleware
 */
export interface ClerkAuth {
    userId: string
    sessionClaims?: {
        email?: string
        firstName?: string
        lastName?: string
        imageUrl?: string
    }
}

/**
 * Express Request with Clerk authentication data
 */
export interface AuthenticatedRequest extends Request {
    auth?: ClerkAuth
}

/**
 * Extracts user ID from authenticated request
 * @param req - Express request with Clerk auth
 * @returns User ID or null if not authenticated
 */
export function getUserIdFromRequest(req: AuthenticatedRequest): string | null {
    return req.auth?.userId ?? null
}

/**
 * Type guard to check if request has valid authentication
 */
export function isAuthenticated(req: AuthenticatedRequest): req is AuthenticatedRequest & { auth: ClerkAuth } {
    return !!req.auth?.userId
}

/**
 * Generic database row types for SQL query results
 */
export interface SubscriptionRow {
    id: string
    user_id: string
    name: string
    amount: number
    currency: string
    period_start: Date
    period_end: Date
    renewal_date: Date
    provider: string
    description: string | null
    status: string
    is_automatic_renewal: number
    category: string | null
    documents: string | null
    created_at: Date
    updated_at: Date
}

export interface InsuranceRow {
    id: string
    user_id: string
    name: string
    amount: number
    currency: string
    period_start: Date
    period_end: Date
    renewal_date: Date
    insurance_company: string
    policy_number: string | null
    insured_object: string | null
    description: string | null
    insurance_type: string
    status: string
    category: string | null
    documents: string | null
    created_at: Date
    updated_at: Date
}

export interface LoanRow {
    id: string
    user_id: string
    name: string
    total_amount: number
    remaining_amount: number
    interest_rate: number
    currency: string
    start_date: Date
    end_date: Date
    next_payment_date: Date
    next_payment_amount: number
    lender: string
    loan_type: string
    status: string
    payment_frequency: string
    duration_in_months: number
    created_at: Date
    updated_at: Date
}
