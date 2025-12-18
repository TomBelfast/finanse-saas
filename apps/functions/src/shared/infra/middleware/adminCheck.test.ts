import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { Request, Response, NextFunction } from 'express'

// Set env before importing the module
process.env.ADMIN_USER_IDS = 'admin-user-1,admin-user-2'

// Import after setting env
import { requireAdmin, requireSelfOrAdmin, isAdmin } from './adminCheck'

// Mock the logger
vi.mock('../../utils/logger', () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}))

describe('Admin Check Middleware', () => {
    let mockReq: Partial<Request> & { auth?: { userId: string } }
    let mockRes: Partial<Response>
    let mockNext: NextFunction

    beforeEach(() => {
        vi.clearAllMocks()

        mockReq = {
            path: '/test',
            params: {},
        }
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        }
        mockNext = vi.fn()
    })

    describe('isAdmin', () => {
        it('should return true for admin users', () => {
            expect(isAdmin('admin-user-1')).toBe(true)
            expect(isAdmin('admin-user-2')).toBe(true)
        })

        it('should return false for non-admin users', () => {
            expect(isAdmin('regular-user')).toBe(false)
            expect(isAdmin('')).toBe(false)
        })
    })

    describe('requireAdmin', () => {
        it('should return 401 for unauthenticated requests', () => {
            // No auth property set - simulates unauthenticated request

            requireAdmin(mockReq as Request, mockRes as Response, mockNext)

            expect(mockRes.status).toHaveBeenCalledWith(401)
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
            expect(mockNext).not.toHaveBeenCalled()
        })

        it('should return 403 for non-admin users', () => {
            mockReq.auth = { userId: 'regular-user' }

            requireAdmin(mockReq as Request, mockRes as Response, mockNext)

            expect(mockRes.status).toHaveBeenCalledWith(403)
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden: Admin access required' })
            expect(mockNext).not.toHaveBeenCalled()
        })

        it('should call next() for admin users', () => {
            mockReq.auth = { userId: 'admin-user-1' }

            requireAdmin(mockReq as Request, mockRes as Response, mockNext)

            expect(mockNext).toHaveBeenCalled()
            expect(mockRes.status).not.toHaveBeenCalled()
        })
    })

    describe('requireSelfOrAdmin', () => {
        it('should allow users to access their own data', () => {
            mockReq.auth = { userId: 'user-123' }
            mockReq.params = { userId: 'user-123' }

            requireSelfOrAdmin(mockReq as Request, mockRes as Response, mockNext)

            expect(mockNext).toHaveBeenCalled()
            expect(mockRes.status).not.toHaveBeenCalled()
        })

        it('should allow admins to access any user data', () => {
            mockReq.auth = { userId: 'admin-user-1' }
            mockReq.params = { userId: 'other-user' }

            requireSelfOrAdmin(mockReq as Request, mockRes as Response, mockNext)

            expect(mockNext).toHaveBeenCalled()
            expect(mockRes.status).not.toHaveBeenCalled()
        })

        it('should deny access to other users data for non-admins', () => {
            mockReq.auth = { userId: 'user-123' }
            mockReq.params = { userId: 'other-user' }

            requireSelfOrAdmin(mockReq as Request, mockRes as Response, mockNext)

            expect(mockRes.status).toHaveBeenCalledWith(403)
            expect(mockNext).not.toHaveBeenCalled()
        })
    })
})
