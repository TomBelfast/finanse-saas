import express, { RequestHandler } from 'express';
import { createUsersRepository } from '../../../shared/infra/repositories/repositoryFactory';
import { db } from '../../../config/bootstrap';
import { UserDocument } from '@akademiasaas/shared';
import { AuthenticatedRequest, getUserIdFromRequest } from '../../../shared/types/express';
import { logger } from '../../../shared/utils/logger';
import { validateBody, updateUserSchema } from '../../../shared/validation/schemas';
import { supabase } from '../../../config/supabase';

const router = express.Router();
const usersRepository = createUsersRepository(db);

// Middleware to verify Supabase token
export const verifySupabaseToken: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.error('Supabase auth error', error);
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    (req as AuthenticatedRequest).auth = {
      userId: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    };

    next();
  } catch (error: any) {
    logger.error('Auth middleware error', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Get current user (protected route)
router.get('/me', verifySupabaseToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let userData = await usersRepository.findUserById(userId);

    // If user doesn't exist in our database, create it
    if (!userData) {
      const supabaseAuth = (req as AuthenticatedRequest).auth!;
      const userDoc: UserDocument = {
        uid: userId,
        email: supabaseAuth.email || '',
        contactEmail: null,
        firstName: supabaseAuth.user_metadata?.first_name || '',
        lastName: supabaseAuth.user_metadata?.last_name || '',
        avatarUrl: null,
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
      res.status(404).json({ error: 'User not found' });
      return;
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
router.put('/me', verifySupabaseToken, validateBody(updateUserSchema), async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
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

// Export router
export { router as authRouter };
