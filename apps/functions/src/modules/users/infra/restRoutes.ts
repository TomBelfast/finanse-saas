import express from 'express';
import { createUsersRepository } from '../../../shared/infra/repositories/repositoryFactory';
import { db } from '../../../config/bootstrap';
import { verifySupabaseToken } from '../../auth/infra/restRoutes';
import { UserDocument } from '@akademiasaas/shared';
import { AuthenticatedRequest, getUserIdFromRequest } from '../../../shared/types/express';
import { requireSelfOrAdmin } from '../../../shared/infra/middleware/adminCheck';
import { logger } from '../../../shared/utils/logger';
import { validateBody, updateUserSchema } from '../../../shared/validation/schemas';

const router = express.Router();
const usersRepository = createUsersRepository(db);

// Get current user (or create if not exists)
router.get('/me', verifySupabaseToken, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = getUserIdFromRequest(authReq);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const email = authReq.auth?.email;
    logger.info('GET /api/users/me - Starting', { userId, email });
    let userData = await usersRepository.findUserById(userId);

    // Agresywne łączenie: Jeśli mamy email, sprawdźmy czy nie ma innego konta (starego) z tym mailem
    if (email) {
      const existingUserByEmail = await usersRepository.findUserByEmail(email);
      // Jeśli znaleźliśmy konto z tym mailem, ale innym UID (starym z Clerk)
      if (existingUserByEmail && existingUserByEmail.uid !== userId) {
        logger.info('Collision detected: Old account exists for this email. Relinking data...', {
          oldUid: existingUserByEmail.uid,
          newUid: userId
        });

        // Przenosimy dane ze starego konta na nowe i aktualizujemy rekord w users
        await usersRepository.updateUserId(existingUserByEmail.uid, userId);

        // Pobieramy dane ponownie - teraz powinny być to te "odzyskane"
        userData = await usersRepository.findUserById(userId);
      }
    }

    // Jeśli po próbie łączenia nadal nie ma użytkownika, stwórz go
    if (!userData) {
      logger.info('Creating new user from Supabase data', { userId });
      const newUser: Partial<UserDocument> = {
        uid: userId,
        email: email || '',
        firstName: authReq.auth?.user_metadata?.first_name || '',
        lastName: authReq.auth?.user_metadata?.last_name || '',
        avatarUrl: null,
        termsAndPrivacyPolicy: true,
        lang: 'pl',
        timezone: 'Europe/Warsaw',
        defaultCurrency: 'pln',
        createdAt: new Date(),
        updatedAt: new Date(),
        contactEmail: email || '',
        termsAndPolicyAcceptDate: new Date(),
      };

      await usersRepository.createUser(newUser as UserDocument);
      userData = await usersRepository.findUserById(userId);
      logger.info('User created successfully from Supabase metadata', { userId });
    }

    // Normalize defaultCurrency to lowercase if present
    if (userData && userData.defaultCurrency) {
      userData.defaultCurrency = (userData.defaultCurrency as string).toLowerCase() as 'pln' | 'eur' | 'usd' | 'gbp';
    }

    res.json(userData);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Get user error', err);
    res.status(500).json({ error: err.message || 'Failed to get user' });
  }
});

// Update user
router.put('/me', verifySupabaseToken, validateBody(updateUserSchema), async (req, res) => {
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
router.get('/:userId', verifySupabaseToken, requireSelfOrAdmin, async (req, res) => {
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
