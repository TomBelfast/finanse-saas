import express, { RequestHandler } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { getDatabasePool } from '../../../shared/infra/database';
import { createUsersRepository } from '../../../shared/infra/repositories/repositoryFactory';
import { db } from '../../../config/bootstrap';
import { UserDocument } from '@akademiasaas/shared';
import { AuthenticatedRequest, getUserIdFromRequest, ClerkAuth } from '../../../shared/types/express';
import { logger } from '../../../shared/utils/logger';
import { validateBody, updateUserSchema } from '../../../shared/validation/schemas';

const router = express.Router();
const pool = getDatabasePool();
const usersRepository = createUsersRepository(db);

// Middleware to verify Clerk token
// Note: Clerk Core 2 requires BOTH CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
// If you see "Publishable key is missing" error, add both keys to apps/functions/.env.local
// IMPORTANT: loadEnv.ts must be imported in server.ts BEFORE this module is imported
if (!process.env.CLERK_SECRET_KEY) {
  logger.warn('⚠️  CLERK_SECRET_KEY is not set in process.env - Clerk authentication will fail!');
  logger.warn('   Make sure loadEnv.ts is imported in server.ts BEFORE importing this module');
  logger.warn('   Check if .env.local exists and contains CLERK_SECRET_KEY');
} else {
  logger.info(`✅ CLERK_SECRET_KEY is configured (${process.env.CLERK_SECRET_KEY.substring(0, 20)}...)`);
}

if (!process.env.CLERK_PUBLISHABLE_KEY) {
  logger.warn('⚠️  CLERK_PUBLISHABLE_KEY is not set in process.env - Clerk authentication will fail!');
  logger.warn('   Clerk Core 2 requires BOTH CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY');
  logger.warn('   Add CLERK_PUBLISHABLE_KEY to apps/functions/.env.local');
} else {
  logger.info(`✅ CLERK_PUBLISHABLE_KEY is configured (${process.env.CLERK_PUBLISHABLE_KEY.substring(0, 20)}...)`);
}

// Clerk Core 2 requires both secretKey and publishableKey
export const verifyClerkToken = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
} as any) as unknown as RequestHandler;

// Get current user (protected route)
router.get('/me', verifyClerkToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let userData = await usersRepository.findUserById(userId);

    // If user doesn't exist in our database, create it
    if (!userData) {
      const clerkUser = (req as AuthenticatedRequest).auth as ClerkAuth;
      const userDoc: UserDocument = {
        uid: userId,
        email: clerkUser.sessionClaims?.email || '',
        contactEmail: null,
        firstName: clerkUser.sessionClaims?.firstName || '',
        lastName: clerkUser.sessionClaims?.lastName || '',
        avatarUrl: clerkUser.sessionClaims?.imageUrl ? [clerkUser.sessionClaims.imageUrl] : null,
        mobileFcmTokens: null,
        webFcmTokens: null,
        termsAndPolicyAcceptDate: new Date(),
        termsAndPrivacyPolicy: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lang: 'pl',
        timezone: 'Europe/Warsaw',
        ip: null,
        phoneNumber: undefined,
      };

      await usersRepository.createUser(userDoc);
      userData = await usersRepository.findUserById(userId);
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      uid: userData.uid,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatarUrl: userData.avatarUrl,
      lang: userData.lang,
      timezone: userData.timezone,
    });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Get user error', err);
    res.status(500).json({ error: err.message || 'Failed to get user' });
  }
});

// Update user (protected route)
router.put('/me', verifyClerkToken, validateBody(updateUserSchema), async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updateData = req.body;
    await usersRepository.updateUser(userId, updateData);
    const updatedUser = await usersRepository.findUserById(userId);

    res.json(updatedUser);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Update user error', err);
    res.status(500).json({ error: err.message || 'Failed to update user' });
  }
});

// Export verifyClerkToken for use in other routes
export { router as authRouter };
