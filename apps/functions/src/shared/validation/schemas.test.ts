import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateBody, updateUserSchema, createSubscriptionSchema, createInsuranceSchema, createLoanSchema } from './schemas'
import { Request, Response, NextFunction } from 'express'

describe('Validation Schemas', () => {
    describe('updateUserSchema', () => {
        it('should validate valid user update data', () => {
            const validData = {
                firstName: 'Jan',
                lastName: 'Kowalski',
                email: 'jan@example.com',
                lang: 'pl',
            }

            const result = updateUserSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject invalid email', () => {
            const invalidData = {
                email: 'not-an-email',
            }

            const result = updateUserSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject invalid lang', () => {
            const invalidData = {
                lang: 'fr', // Only pl and en are allowed
            }

            const result = updateUserSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should allow partial updates', () => {
            const partialData = {
                firstName: 'Jan',
            }

            const result = updateUserSchema.safeParse(partialData)
            expect(result.success).toBe(true)
        })
    })

    describe('createSubscriptionSchema', () => {
        it('should validate valid subscription data', () => {
            const validData = {
                name: 'Netflix',
                amount: 49.99,
                currency: 'PLN',
                periodStart: '2024-01-01',
                periodEnd: '2024-12-31',
                renewalDate: '2024-12-31',
                provider: 'Netflix Inc.',
                status: 'active',
                isAutomaticRenewal: true,
            }

            const result = createSubscriptionSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject negative amount', () => {
            const invalidData = {
                name: 'Netflix',
                amount: -10,
                currency: 'PLN',
                periodStart: '2024-01-01',
                periodEnd: '2024-12-31',
                renewalDate: '2024-12-31',
                provider: 'Netflix Inc.',
            }

            const result = createSubscriptionSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should require name', () => {
            const invalidData = {
                amount: 49.99,
                currency: 'PLN',
                periodStart: '2024-01-01',
                periodEnd: '2024-12-31',
                renewalDate: '2024-12-31',
                provider: 'Netflix Inc.',
            }

            const result = createSubscriptionSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })

    describe('createInsuranceSchema', () => {
        it('should validate valid insurance data', () => {
            const validData = {
                name: 'Ubezpieczenie domu',
                amount: 1200,
                currency: 'PLN',
                period_start: '2024-01-01',
                period_end: '2024-12-31',
                renewal_date: '2024-12-31',
                insurance_company: 'PZU',
                insurance_type: 'home',
                status: 'active',
            }

            const result = createInsuranceSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })
    })

    describe('createLoanSchema', () => {
        it('should validate valid loan data', () => {
            const validData = {
                name: 'Kredyt hipoteczny',
                total_amount: 300000,
                interest_rate: 7.5,
                currency: 'PLN',
                start_date: '2024-01-01',
                end_date: '2054-01-01',
                lender: 'PKO BP',
                loan_type: 'mortgage',
                status: 'active',
                payment_frequency: 'monthly',
            }

            const result = createLoanSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject interest rate over 100%', () => {
            const invalidData = {
                name: 'Kredyt',
                total_amount: 10000,
                interest_rate: 150,
                currency: 'PLN',
                start_date: '2024-01-01',
                end_date: '2025-01-01',
                lender: 'Bank',
                loan_type: 'personal',
            }

            const result = createLoanSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })
})

describe('validateBody middleware', () => {
    let mockReq: Partial<Request>
    let mockRes: Partial<Response>
    let mockNext: NextFunction

    beforeEach(() => {
        mockReq = {
            body: {},
        }
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        }
        mockNext = vi.fn()
    })

    it('should call next() for valid data', () => {
        mockReq.body = { firstName: 'Jan' }

        const middleware = validateBody(updateUserSchema)
        middleware(mockReq as Request, mockRes as Response, mockNext)

        expect(mockNext).toHaveBeenCalled()
        expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should return 400 for invalid data', () => {
        mockReq.body = { email: 'invalid-email' }

        const middleware = validateBody(updateUserSchema)
        middleware(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalled()
        expect(mockNext).not.toHaveBeenCalled()
    })
})
