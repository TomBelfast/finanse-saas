import express from 'express';
import { createUsersRepository } from '../../../shared/infra/repositories/repositoryFactory';
import { db } from '../../../config/bootstrap';
import { verifyClerkToken } from '../../auth/infra/restRoutes';
import { UserDocument } from '@akademiasaas/shared';
import { AuthenticatedRequest, getUserIdFromRequest } from '../../../shared/types/express';
import { requireSelfOrAdmin } from '../../../shared/infra/middleware/adminCheck';
import { logger } from '../../../shared/utils/logger';
import { validateBody, updateUserSchema } from '../../../shared/validation/schemas';
import { createClerkClient } from '@clerk/clerk-sdk-node';

const router = express.Router();
const usersRepository = createUsersRepository(db);

// Initialize Clerk client
const clerkClient = process.env.CLERK_SECRET_KEY 
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

// Get current user (or create if not exists)
router.get('/me', verifyClerkToken, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = getUserIdFromRequest(authReq);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    logger.info('GET /api/users/me - Starting', { userId });
    let userData = await usersRepository.findUserById(userId);
    logger.info('GET /api/users/me - Found user in database', { 
      userId, 
      exists: !!userData,
      firstName: userData?.firstName || 'empty',
      lastName: userData?.lastName || 'empty'
    });

    // Helper function to get user name from Clerk
    async function getClerkUserName(clerkUserId: string): Promise<{ firstName: string | null; lastName: string | null }> {
      if (!clerkClient || !process.env.CLERK_SECRET_KEY) {
        logger.warn('Clerk client not initialized, cannot fetch user name', { userId: clerkUserId });
        return { firstName: null, lastName: null };
      }
      
      try {
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        logger.info('Fetched user from Clerk API', { 
          userId: clerkUserId, 
          firstName: clerkUser.firstName || 'null', 
          lastName: clerkUser.lastName || 'null' 
        });
        return {
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
        };
      } catch (error) {
        logger.warn('Failed to fetch user from Clerk API', { userId: clerkUserId, error });
        return { firstName: null, lastName: null };
      }
    }

    // Auto-create user if not found
    if (!userData) {
      logger.info('User not found, creating new user', { userId });
      const sessionClaims = authReq.auth?.sessionClaims || {};
      
      // Try to get firstName and lastName from Clerk API
      const clerkName = await getClerkUserName(userId);
      
      const newUser: Partial<UserDocument> = {
        uid: userId,
        email: sessionClaims.email || '',
        firstName: clerkName.firstName || '',
        lastName: clerkName.lastName || null,
        avatarUrl: sessionClaims.imageUrl ? [sessionClaims.imageUrl] : null,
        termsAndPrivacyPolicy: true,
        lang: 'pl',
        timezone: 'Europe/Warsaw',
        defaultCurrency: 'pln',
      };
      await usersRepository.createUser(newUser as UserDocument);
      userData = await usersRepository.findUserById(userId);
      logger.info('User created successfully', { 
        userId, 
        firstName: clerkName.firstName || 'empty', 
        lastName: clerkName.lastName || 'empty' 
      });
    }
    
    // If user exists but firstName/lastName are empty or "Test"/"User", try to update from Clerk
    const isTestUser = userData && (
      !userData.firstName || 
      !userData.lastName || 
      userData.firstName === '' || 
      userData.lastName === '' ||
      userData.firstName === 'Test' ||
      userData.lastName === 'User' ||
      (userData.firstName === 'Test' && userData.lastName === 'User')
    );
    
    if (isTestUser) {
      logger.info('User exists but firstName/lastName are empty or Test/User, trying to fetch from Clerk', { 
        userId,
        currentFirstName: userData.firstName || 'empty',
        currentLastName: userData.lastName || 'empty',
      });
      const clerkName = await getClerkUserName(userId);
      
      if (clerkName.firstName || clerkName.lastName) {
        logger.info('Updating user name from Clerk API', { 
          userId, 
          firstName: clerkName.firstName, 
          lastName: clerkName.lastName 
        });
        await usersRepository.updateUser(userId, {
          firstName: clerkName.firstName || userData.firstName || '',
          lastName: clerkName.lastName || userData.lastName || null,
        });
        userData = await usersRepository.findUserById(userId);
        logger.info('User name updated successfully', { 
          userId,
          newFirstName: userData.firstName,
          newLastName: userData.lastName,
        });
      } else {
        logger.warn('User exists but firstName/lastName are empty/Test/User and not found in Clerk', { 
          userId,
          currentFirstName: userData.firstName || 'empty',
          currentLastName: userData.lastName || 'empty',
        });
      }
    }

    // Normalize defaultCurrency to lowercase if present
    if (userData && userData.defaultCurrency) {
      userData.defaultCurrency = (userData.defaultCurrency as string).toLowerCase() as 'pln' | 'eur' | 'usd' | 'gbp';
    }

    logger.info('GET /api/users/me - Returning user data', { 
      userId, 
      firstName: userData?.firstName || 'empty',
      lastName: userData?.lastName || 'empty',
      email: userData?.email || 'empty',
      defaultCurrency: userData?.defaultCurrency || 'empty'
    });
    res.json(userData);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Get user error', err);
    res.status(500).json({ error: err.message || 'Failed to get user' });
  }
});

// Update user
router.put('/me', verifyClerkToken, validateBody(updateUserSchema), async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const updateData = req.body;

    logger.info('PUT /api/users/me - Updating user', { 
      userId, 
      updateData,
      defaultCurrency: updateData.defaultCurrency 
    });

    await usersRepository.updateUser(userId, updateData);
    const updatedUser = await usersRepository.findUserById(userId);

    // Normalize defaultCurrency to lowercase if present
    if (updatedUser && updatedUser.defaultCurrency) {
      updatedUser.defaultCurrency = (updatedUser.defaultCurrency as string).toLowerCase() as 'pln' | 'eur' | 'usd' | 'gbp';
    }

    logger.info('PUT /api/users/me - User updated successfully', { 
      userId, 
      defaultCurrency: updatedUser?.defaultCurrency 
    });

    res.json(updatedUser);
    return;
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Update user error', err);
    res.status(500).json({ error: err.message || 'Failed to update user' });
  }
});

// Get user by ID (admin or self only)
router.get('/:userId', verifyClerkToken, requireSelfOrAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await usersRepository.findUserById(userId);

    if (!userData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(userData);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Get user error', err);
    res.status(500).json({ error: err.message || 'Failed to get user' });
  }
});

export { router as usersRouter };
