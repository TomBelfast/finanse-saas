import { Request, Response, NextFunction } from 'express'
import { AuthenticatedRequest, getUserIdFromRequest } from '../../types/express'
import { logger } from '../../utils/logger'

/**
 * Gets list of admin user IDs from environment variables
 * Reads dynamically to support testing scenarios
 */
function getAdminUserIds(): string[] {
    return (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean)
}

/**
 * Checks if the authenticated user has admin privileges
 */
export function isAdmin(userId: string): boolean {
    return getAdminUserIds().includes(userId)
}

/**
 * Middleware that requires the user to be an admin
 * Must be used after verifyClerkToken middleware
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest)

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    if (!isAdmin(userId)) {
        logger.warn('Admin access denied', { userId, path: req.path })
        res.status(403).json({ error: 'Forbidden: Admin access required' })
        return
    }

    next()
}

/**
 * Middleware that checks if the user is accessing their own resource or is an admin
 * The userId parameter should be in req.params.userId
 */
export function requireSelfOrAdmin(req: Request, res: Response, next: NextFunction): void {
    const currentUserId = getUserIdFromRequest(req as AuthenticatedRequest)
    const targetUserId = req.params.userId

    if (!currentUserId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    // Allow if user is accessing their own data or is an admin
    if (currentUserId === targetUserId || isAdmin(currentUserId)) {
        next()
        return
    }

    logger.warn('Access denied: not self or admin', { currentUserId, targetUserId, path: req.path })
    res.status(403).json({ error: 'Forbidden: You can only access your own data' })
}
