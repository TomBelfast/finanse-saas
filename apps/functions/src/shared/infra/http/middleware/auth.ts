import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger';

/**
 * @deprecated This middleware used Firebase Admin SDK for authentication.
 * The application now uses Clerk for authentication.
 * See verifyClerkToken in modules/auth/infra/restRoutes.ts
 */

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        role?: string;
      };
    }
  }
}

/**
 * Legacy auth middleware placeholder.
 * This middleware is deprecated - use verifyClerkToken instead.
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  logger.warn('Legacy authMiddleware called - this is deprecated, use verifyClerkToken');
  return res.status(501).json({
    error: 'This authentication method is deprecated. Please use Clerk authentication.'
  });
};