import { z } from 'zod'

/**
 * Common validation schemas for API endpoints
 */

// User update schema
export const updateUserSchema = z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    email: z.string().email().optional(),
    contactEmail: z.string().email().nullable().optional(),
    phoneNumber: z.string().max(20).optional(),
    lang: z.enum(['pl', 'en']).optional(),
    timezone: z.string().max(50).optional(),
    defaultCurrency: z.enum(['PLN', 'EUR', 'USD', 'GBP', 'pln', 'eur', 'usd', 'gbp']).optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

// Subscription schemas
export const createSubscriptionSchema = z.object({
    name: z.string().min(1).max(200),
    amount: z.number().positive(),
    currency: z.string().length(3).default('PLN'),
    periodStart: z.string().or(z.date()),
    periodEnd: z.string().or(z.date()),
    renewalDate: z.string().or(z.date()),
    provider: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    status: z.enum(['active', 'inactive', 'cancelled']).default('active'),
    isAutomaticRenewal: z.boolean().default(true),
    category: z.string().max(50).optional(),
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>

export const updateSubscriptionSchema = createSubscriptionSchema.partial()

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>

// Insurance schemas
export const createInsuranceSchema = z.object({
    name: z.string().min(1).max(200),
    amount: z.number().positive(),
    currency: z.string().length(3).default('PLN'),
    period_start: z.string().or(z.date()),
    period_end: z.string().or(z.date()),
    renewal_date: z.string().or(z.date()),
    insurance_company: z.string().min(1).max(100),
    insurance_type: z.string().min(1).max(50),
    status: z.enum(['active', 'inactive', 'expired']).default('active'),
})

export type CreateInsuranceInput = z.infer<typeof createInsuranceSchema>

export const updateInsuranceSchema = createInsuranceSchema.partial()

// Loan schemas
export const createLoanSchema = z.object({
    name: z.string().min(1).max(200),
    total_amount: z.number().positive(),
    remaining_amount: z.number().nonnegative().optional(),
    interest_rate: z.number().min(0).max(100),
    currency: z.string().length(3).default('PLN'),
    start_date: z.string().or(z.date()),
    end_date: z.string().or(z.date()),
    next_payment_date: z.string().or(z.date()).optional(),
    next_payment_amount: z.number().positive().optional(),
    lender: z.string().min(1).max(100),
    loan_type: z.string().min(1).max(50),
    status: z.enum(['active', 'paid', 'defaulted']).default('active'),
    payment_frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']).default('monthly'),
    duration_in_months: z.number().positive().optional(),
})

export type CreateLoanInput = z.infer<typeof createLoanSchema>

export const updateLoanSchema = createLoanSchema.partial()

/**
 * Validation helper middleware
 */
import { Request, Response, NextFunction } from 'express'

export function validateBody<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors,
            })
        }
        req.body = result.data
        next()
    }
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.params)
        if (!result.success) {
            return res.status(400).json({
                error: 'Invalid parameters',
                details: result.error.flatten().fieldErrors,
            })
        }
        next()
    }
}

// Common param schemas
export const idParamSchema = z.object({
    id: z.string().min(1),
})

export const userIdParamSchema = z.object({
    userId: z.string().min(1),
})
