import express from 'express';
import { createUsersRepository } from '../../../shared/infra/repositories/repositoryFactory';
import { db } from '../../../config/bootstrap';
import { verifyClerkToken } from '../../auth/infra/restRoutes';
import { UserDocument } from '@akademiasaas/shared';
import { AuthenticatedRequest, getUserIdFromRequest } from '../../../shared/types/express';
import { requireSelfOrAdmin } from '../../../shared/infra/middleware/adminCheck';
import { logger } from '../../../shared/utils/logger';
import { validateBody, updateUserSchema } from '../../../shared/validation/schemas';

const router = express.Router();
const usersRepository = createUsersRepository(db);

// Get current user (or create if not exists)
router.get('/me', verifyClerkToken, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = getUserIdFromRequest(authReq);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let userData = await usersRepository.findUserById(userId);

    // Auto-create user if not found
    if (!userData) {
      logger.info('User not found, creating new user', { userId });
      const sessionClaims = authReq.auth?.sessionClaims || {};
      const newUser: Partial<UserDocument> = {
        uid: userId,
        email: sessionClaims.email || '',
        firstName: sessionClaims.firstName || '',
        lastName: sessionClaims.lastName || '',
        avatarUrl: sessionClaims.imageUrl ? [sessionClaims.imageUrl] : null,
        termsAndPrivacyPolicy: true,
        lang: 'pl',
        timezone: 'Europe/Warsaw',
        defaultCurrency: 'pln',
      };
      await usersRepository.createUser(newUser as UserDocument);
      userData = await usersRepository.findUserById(userId);
      logger.info('User created successfully', { userId });
    }

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

// Get user by ID (admin or self only)
router.get('/:userId', verifyClerkToken, requireSelfOrAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await usersRepository.findUserById(userId);

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userData);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Get user error', err);
    res.status(500).json({ error: err.message || 'Failed to get user' });
  }
});

export { router as usersRouter };
