import express from 'express';
import { getDatabasePool } from '../../../shared/infra/database';
import { verifySupabaseToken } from '../../auth/infra/restRoutes';
import { AuthenticatedRequest, getUserIdFromRequest, InsuranceRow, LoanRow, SubscriptionRow } from '../../../shared/types/express';
import { logger } from '../../../shared/utils/logger';
import { handleError, createErrorResponse } from '../../../shared/utils/errorHandler';
import { redisCache, RedisCache } from '../../../shared/infra/cache/RedisCache';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const pool = getDatabasePool();

// Helper function to convert ISO date strings to MySQL format
const toMySQLDate = (dateValue: string | undefined | null, fallback: string): string => {
  if (!dateValue) return fallback;
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  // Handle ISO format with T and Z (e.g., 2025-12-17T00:00:00.000Z)
  if (dateValue.includes('T')) {
    return dateValue.split('T')[0];
  }
  // Try to parse as Date and format
  try {
    const d = new Date(dateValue);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {
    // ignore parse errors
  }
  return fallback;
};

// Get user subscriptions
// Database index on user_subscriptions(user_id, created_at) added in migration 2025_01_18_add_composite_indexes.sql
// Redis cache implemented with 5 minute TTL
// Returns data directly from database in snake_case format (no transformation)
router.get('/subscriptions', verifySupabaseToken, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = getUserIdFromRequest(authReq);
    if (!userId) {
      logger.error('Get subscriptions: No userId', {
        headers: req.headers,
        auth: authReq.auth,
        authType: typeof authReq.auth
      });
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Try to get from cache first
    const cacheKey = RedisCache.generateKey('user', userId, { type: 'subscriptions' });
    const cached = await redisCache.get<unknown[]>(cacheKey);

    if (cached) {
      logger.debug('Get subscriptions: Cache hit', { userId });
      res.json(cached);
      return;
    }

    // Cache miss - fetch directly from database (snake_case format)
    logger.info('Get subscriptions: Fetching for user', { userId });
    const query = 'SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await pool.execute<SubscriptionRow[]>(query, [userId]);

    // Convert Date objects to ISO strings for JSON response
    const subscriptions = rows.map((row) => ({
      ...row,
      period_start: row.period_start instanceof Date ? row.period_start.toISOString() : row.period_start,
      period_end: row.period_end instanceof Date ? row.period_end.toISOString() : row.period_end,
      renewal_date: row.renewal_date instanceof Date ? row.renewal_date.toISOString() : row.renewal_date,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
      is_automatic_renewal: Boolean(row.is_automatic_renewal),
    }));

    // Cache the result for 5 minutes
    await redisCache.set(cacheKey, subscriptions, 300);

    logger.info('Get subscriptions: Success', { userId, count: subscriptions.length });
    res.json(subscriptions);
  } catch (error: unknown) {
    const errorMessage = handleError(error, {
      operation: 'get_subscriptions',
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    });
    res.status(500).json({ error: errorMessage });
  }
});

// Create subscription
router.post('/subscriptions', verifySupabaseToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      logger.error('Create subscription: No userId', {
        headers: req.headers,
        auth: (req as AuthenticatedRequest).auth
      });
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Only require name and amount
    const { name, amount } = req.body;

    if (!name || amount === undefined) {
      logger.error('Create subscription: Missing required fields', { body: req.body });
      res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'amount']
      });
      return;
    }

    // Provide defaults for optional fields
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Map status from Polish to English
    const statusMap: Record<string, string> = {
      'aktywna': 'active',
      'nieaktywna': 'inactive',
      'oczekująca na odnowienie': 'pending_renewal',
      'oczekująca': 'pending_renewal',
      'anulowana': 'cancelled',
      'wygasła': 'expired'
    };
    const status = statusMap[req.body.status] || req.body.status || 'active';

    // Insert directly into database (snake_case format)
    const id = uuidv4();
    const query = `INSERT INTO user_subscriptions (
      id, user_id, name, amount, currency, period_start, period_end,
      renewal_date, provider, description, status, is_automatic_renewal,
      category, documents, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

    const params = [
      id,
      userId,
      name,
      parseFloat(amount) || 0,
      req.body.currency || 'PLN',
      req.body.period_start || req.body.periodStart || now,
      req.body.period_end || req.body.periodEnd || nextMonth,
      req.body.renewal_date || req.body.renewalDate || nextMonth,
      req.body.provider || 'Manual',
      req.body.description || req.body.note || null,
      status,
      req.body.is_automatic_renewal !== false && req.body.isAutomaticRenewal !== false ? 1 : 0,
      req.body.category || req.body.tag || 'inne',
      req.body.documents ? JSON.stringify(req.body.documents) : null,
    ];

    logger.info('Create subscription: Creating', { userId, name, amount });
    await pool.execute(query, params);

    // Fetch created subscription and return in snake_case format
    const [rows] = await pool.execute<SubscriptionRow[]>('SELECT * FROM user_subscriptions WHERE id = ?', [id]);
    if (rows.length === 0) {
      throw new Error('Failed to retrieve created subscription');
    }

    const subscription = {
      ...rows[0],
      period_start: rows[0].period_start instanceof Date ? rows[0].period_start.toISOString() : rows[0].period_start,
      period_end: rows[0].period_end instanceof Date ? rows[0].period_end.toISOString() : rows[0].period_end,
      renewal_date: rows[0].renewal_date instanceof Date ? rows[0].renewal_date.toISOString() : rows[0].renewal_date,
      created_at: rows[0].created_at instanceof Date ? rows[0].created_at.toISOString() : rows[0].created_at,
      updated_at: rows[0].updated_at instanceof Date ? rows[0].updated_at.toISOString() : rows[0].updated_at,
      is_automatic_renewal: Boolean(rows[0].is_automatic_renewal),
    };

    // Invalidate cache
    const cacheKey = RedisCache.generateKey('user', userId, { type: 'subscriptions' });
    await redisCache.delete(cacheKey);

    logger.info('Create subscription: Success', { userId, subscriptionId: id });
    res.status(201).json(subscription);
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'create_subscription',
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
      body: req.body,
    }, 'Failed to create subscription');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Update subscription
router.put('/subscriptions/:id', verifySupabaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify ownership - check if subscription exists and belongs to user
    const [existingRows] = await pool.execute<SubscriptionRow[]>('SELECT user_id FROM user_subscriptions WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    if (existingRows[0].user_id !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Map status from Polish to English if needed
    const statusMap: Record<string, string> = {
      'aktywna': 'active',
      'nieaktywna': 'inactive',
      'oczekująca na odnowienie': 'pending_renewal',
      'oczekująca': 'pending_renewal',
      'anulowana': 'cancelled',
      'wygasła': 'expired'
    };

    // Build update query dynamically based on provided fields (snake_case format)
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];

    if (req.body.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(req.body.name);
    }
    if (req.body.amount !== undefined) {
      updateFields.push('amount = ?');
      updateValues.push(parseFloat(req.body.amount));
    }
    if (req.body.currency !== undefined) {
      updateFields.push('currency = ?');
      updateValues.push(req.body.currency);
    }
    if (req.body.period_start !== undefined || req.body.periodStart !== undefined) {
      updateFields.push('period_start = ?');
      updateValues.push(req.body.period_start || req.body.periodStart);
    }
    if (req.body.period_end !== undefined || req.body.periodEnd !== undefined) {
      updateFields.push('period_end = ?');
      updateValues.push(req.body.period_end || req.body.periodEnd);
    }
    if (req.body.renewal_date !== undefined || req.body.renewalDate !== undefined) {
      updateFields.push('renewal_date = ?');
      updateValues.push(req.body.renewal_date || req.body.renewalDate);
    }
    if (req.body.provider !== undefined) {
      updateFields.push('provider = ?');
      updateValues.push(req.body.provider);
    }
    if (req.body.description !== undefined || req.body.note !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(req.body.description || req.body.note || null);
    }
    if (req.body.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(statusMap[req.body.status] || req.body.status);
    }
    if (req.body.is_automatic_renewal !== undefined || req.body.isAutomaticRenewal !== undefined) {
      updateFields.push('is_automatic_renewal = ?');
      updateValues.push((req.body.is_automatic_renewal !== false && req.body.isAutomaticRenewal !== false) ? 1 : 0);
    }
    if (req.body.category !== undefined || req.body.tag !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(req.body.category || req.body.tag || null);
    }
    if (req.body.documents !== undefined) {
      updateFields.push('documents = ?');
      updateValues.push(Array.isArray(req.body.documents) ? JSON.stringify(req.body.documents) : req.body.documents);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    const updateQuery = `UPDATE user_subscriptions SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(updateQuery, updateValues);

    // Fetch updated subscription and return in snake_case format
    const [rows] = await pool.execute<SubscriptionRow[]>('SELECT * FROM user_subscriptions WHERE id = ?', [id]);
    const subscription = {
      ...rows[0],
      period_start: rows[0].period_start instanceof Date ? rows[0].period_start.toISOString() : rows[0].period_start,
      period_end: rows[0].period_end instanceof Date ? rows[0].period_end.toISOString() : rows[0].period_end,
      renewal_date: rows[0].renewal_date instanceof Date ? rows[0].renewal_date.toISOString() : rows[0].renewal_date,
      created_at: rows[0].created_at instanceof Date ? rows[0].created_at.toISOString() : rows[0].created_at,
      updated_at: rows[0].updated_at instanceof Date ? rows[0].updated_at.toISOString() : rows[0].updated_at,
      is_automatic_renewal: Boolean(rows[0].is_automatic_renewal),
    };

    // Invalidate cache for this user's subscriptions
    const cacheKey = RedisCache.generateKey('user', userId, { type: 'subscriptions' });
    await redisCache.delete(cacheKey);

    res.json(subscription);
    return;
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'update_subscription',
      subscriptionId: req.params.id,
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to update subscription');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Delete subscription
router.delete('/subscriptions/:id', verifySupabaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify ownership - check if subscription exists and belongs to user
    const [existingRows] = await pool.execute<SubscriptionRow[]>('SELECT user_id FROM user_subscriptions WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    if (existingRows[0].user_id !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Delete directly from database
    await pool.execute('DELETE FROM user_subscriptions WHERE id = ?', [id]);

    // Invalidate cache for this user's subscriptions
    const cacheKey = RedisCache.generateKey('user', userId, { type: 'subscriptions' });
    await redisCache.delete(cacheKey);

    res.json({ success: true });
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'delete_subscription',
      subscriptionId: req.params.id,
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to delete subscription');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Get user insurances
// Get user insurances
// OPTIMIZATION: Consider adding pagination (limit/offset) for users with many insurances
// Database index on user_insurances(user_id, created_at) added in migration 2025_01_18_add_composite_indexes.sql
// Redis cache implemented with 5 minute TTL
router.get('/insurances', verifySupabaseToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Optional pagination parameters
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 1000) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    let query = 'SELECT * FROM user_insurances WHERE user_id = ? ORDER BY created_at DESC';
    const params: unknown[] = [userId];

    if (limit !== undefined) {
      query += ' LIMIT ?';
      params.push(limit);
      if (offset !== undefined) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    // Try to get from cache first (only if no pagination)
    if (limit === undefined && offset === undefined) {
      const cacheKey = RedisCache.generateKey('user', userId, { type: 'insurances' });
      const cached = await redisCache.get<InsuranceRow[]>(cacheKey);

      if (cached) {
        logger.debug('Get insurances: Cache hit', { userId });
        res.json(cached);
        return;
      }
    }

    const [rows] = await pool.execute<InsuranceRow[]>(query, params);

    // Convert Date objects to ISO strings for JSON response (snake_case format, no camelCase transformation)
    const insurances = rows.map((row) => ({
      ...row,
      period_start: row.period_start instanceof Date ? row.period_start.toISOString() : row.period_start,
      period_end: row.period_end instanceof Date ? row.period_end.toISOString() : row.period_end,
      renewal_date: row.renewal_date instanceof Date ? row.renewal_date.toISOString() : row.renewal_date,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    }));

    // Cache the result for 5 minutes (only if no pagination)
    if (limit === undefined && offset === undefined) {
      const cacheKey = RedisCache.generateKey('user', userId, { type: 'insurances' });
      await redisCache.set(cacheKey, insurances, 300);
    }

    res.json(insurances);
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'get_insurances',
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to get insurances');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Create insurance
router.post('/insurances', verifySupabaseToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Only require name
    const name = req.body.name;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Handle both camelCase and snake_case field names, provide defaults
    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const amount = parseFloat(req.body.amount || req.body.amountDue || '0') || 0;
    const currency = req.body.currency || 'PLN';
    const nowDate = now.toISOString().split('T')[0];
    const nextYearDate = nextYear.toISOString().split('T')[0];
    const period_start = toMySQLDate(req.body.period_start || req.body.periodStart, nowDate);
    const period_end = toMySQLDate(req.body.period_end || req.body.periodEnd, nextYearDate);
    const renewal_date = toMySQLDate(req.body.renewal_date || req.body.renewalDate || req.body.nextPaymentDate, nextYearDate);
    const insurance_company = req.body.insurance_company || req.body.insuranceCompany || '';
    const insurance_type = req.body.insurance_type || req.body.insuranceType || 'other';
    const rawStatus = req.body.status || 'active';
    const statusMap: Record<string, string> = { 'aktywna': 'active', 'wygasła': 'expired', 'anulowana': 'cancelled', 'oczekująca': 'pending' };
    const status = statusMap[rawStatus] || rawStatus;
    const description = req.body.description || req.body.note || '';
    const policy_number = req.body.policy_number || req.body.policyNumber || '';
    const insured_object = req.body.insured_object || req.body.insuredObject || '';
    const category = req.body.category || '';

    // Handle attachments/documents
    let documents = '[]';
    if (req.body.documents) {
      documents = typeof req.body.documents === 'string' ? req.body.documents : JSON.stringify(req.body.documents);
    } else if (req.body.attachments) {
      documents = typeof req.body.attachments === 'string' ? req.body.attachments : JSON.stringify(req.body.attachments);
    } else if (Array.isArray(req.body.attachments)) {
      documents = JSON.stringify(req.body.attachments);
    }

    // Preserve renewalCycle in description if not present otherwise
    let finalDescription = description;
    if (req.body.renewalCycle && !description.includes('Renewal Cycle:')) {
      finalDescription = `${description ? description + '\n' : ''}Renewal Cycle: ${req.body.renewalCycle}`;
    }

    const id = `insurance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Create insurance:', { userId, name, amount, id });

    await pool.execute(
      `INSERT INTO user_insurances (
        id, user_id, name, amount, currency, period_start, period_end,
        renewal_date, insurance_company, insurance_type, status, 
        description, documents, policy_number, insured_object, category,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id, userId, name, amount, currency, period_start, period_end,
        renewal_date, insurance_company, insurance_type, status,
        finalDescription, documents, policy_number, insured_object, category
      ]
    );

    const [rows] = await pool.execute<InsuranceRow[]>('SELECT * FROM user_insurances WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(500).json({ error: 'Failed to retrieve created insurance' });
      return;
    }

    // Invalidate cache for this user's insurances
    const cacheKey = RedisCache.generateKey('user', userId, { type: 'insurances' });
    await redisCache.delete(cacheKey);

    res.status(201).json(rows[0]);
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'create_insurance',
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
      body: req.body,
    }, 'Failed to create insurance');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Update insurance
router.put('/insurances/:id', verifySupabaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify ownership
    const [existing] = await pool.execute('SELECT user_id FROM user_insurances WHERE id = ?', [id]);
    const existingRows = existing as InsuranceRow[];
    if (existingRows.length === 0 || existingRows[0].user_id !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    const data = req.body;

    const addField = (col: string, val: unknown) => {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        values.push(val);
      }
    };

    addField('name', data.name);
    addField('amount', data.amount !== undefined ? data.amount : data.amountDue);
    addField('currency', data.currency);
    // Convert dates to MySQL format
    const periodStartVal = data.period_start || data.periodStart;
    if (periodStartVal) addField('period_start', toMySQLDate(periodStartVal, periodStartVal));
    const periodEndVal = data.period_end || data.periodEnd;
    if (periodEndVal) addField('period_end', toMySQLDate(periodEndVal, periodEndVal));
    const renewalDateVal = data.renewal_date || data.renewalDate || data.nextPaymentDate;
    if (renewalDateVal) addField('renewal_date', toMySQLDate(renewalDateVal, renewalDateVal));
    addField('insurance_company', data.insurance_company || data.insuranceCompany);
    addField('insurance_type', data.insurance_type || data.insuranceType);
    const insuranceStatusMapUpdate: Record<string, string> = { 'aktywna': 'active', 'wygasła': 'expired', 'anulowana': 'cancelled', 'oczekująca': 'pending' };
    const mappedInsuranceStatus = data.status ? (insuranceStatusMapUpdate[data.status] || data.status) : undefined;
    addField('status', mappedInsuranceStatus);
    addField('policy_number', data.policy_number || data.policyNumber);
    addField('insured_object', data.insured_object || data.insuredObject);
    addField('category', data.category);

    let description = data.description !== undefined ? data.description : data.note;
    if (data.renewalCycle) {
      if (description !== undefined && !String(description).includes('Renewal Cycle:')) {
        description = `${description}\nRenewal Cycle: ${data.renewalCycle}`;
      } else if (description === undefined) {
        // If description is not provided in update, we don't touch it unless we want to append renewalCycle.
        // For simplicity, we only update description if provided or if renewalCycle is explicitly sent with note.
      }
    }
    addField('description', description);

    if (data.documents !== undefined) {
      addField('documents', typeof data.documents === 'string' ? data.documents : JSON.stringify(data.documents));
    } else if (data.attachments !== undefined) {
      addField('documents', typeof data.attachments === 'string' ? data.attachments : JSON.stringify(data.attachments));
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await pool.execute(
      `UPDATE user_insurances SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [rows] = await pool.execute<InsuranceRow[]>('SELECT * FROM user_insurances WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).json({ error: 'Insurance not found' });
      return;
    }

    // Invalidate cache for this user's insurances
    const cacheKey = RedisCache.generateKey('user', userId, { type: 'insurances' });
    await redisCache.delete(cacheKey);

    res.json(rows[0]);
    return;
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'update_insurance',
      insuranceId: req.params.id,
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to update insurance');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Delete insurance
router.delete('/insurances/:id', verifySupabaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify ownership
    const [existing] = await pool.execute('SELECT user_id FROM user_insurances WHERE id = ?', [id]);
    const existingRows = existing as InsuranceRow[];
    if (existingRows.length === 0 || existingRows[0].user_id !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await pool.execute('DELETE FROM user_insurances WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'delete_insurance',
      insuranceId: req.params.id,
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to delete insurance');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Get user loans
// OPTIMIZATION: Pagination (limit/offset) implemented
// Database index on user_loans(user_id, created_at) added in migration 2025_01_18_add_composite_indexes.sql
// Redis cache implemented with 5 minute TTL
router.get('/loans', verifySupabaseToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Optional pagination parameters
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 1000) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    // Try to get from cache first (only if no pagination)
    if (limit === undefined && offset === undefined) {
      const cacheKey = RedisCache.generateKey('user', userId, { type: 'loans' });
      const cached = await redisCache.get<LoanRow[]>(cacheKey);

      if (cached) {
        logger.debug('Get loans: Cache hit', { userId });
        res.json(cached);
        return;
      }
    }

    let query = 'SELECT * FROM user_loans WHERE user_id = ? ORDER BY created_at DESC';
    const params: unknown[] = [userId];

    if (limit !== undefined) {
      query += ' LIMIT ?';
      params.push(limit);
      if (offset !== undefined) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    const [rows] = await pool.execute<LoanRow[]>(query, params);

    // Convert Date objects to ISO strings for JSON response (snake_case format, no camelCase transformation)
    const loans = rows.map((row) => ({
      ...row,
      start_date: row.start_date instanceof Date ? row.start_date.toISOString() : row.start_date,
      end_date: row.end_date instanceof Date ? row.end_date.toISOString() : row.end_date,
      next_payment_date: row.next_payment_date instanceof Date ? row.next_payment_date.toISOString() : row.next_payment_date,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    }));

    // Cache the result for 5 minutes (only if no pagination)
    if (limit === undefined && offset === undefined) {
      const cacheKey = RedisCache.generateKey('user', userId, { type: 'loans' });
      await redisCache.set(cacheKey, loans, 300);
    }

    res.json(loans);
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'get_loans',
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to get loans');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Create loan
router.post('/loans', verifySupabaseToken, async (req, res) => {
  try {
    logger.info('Create loan: Starting', {
      hasAuth: !!(req as AuthenticatedRequest).auth,
      body: req.body,
      headers: { authorization: req.headers.authorization?.substring(0, 30) + '...' }
    });

    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    logger.info('Create loan: Got userId', { userId });

    if (!userId) {
      logger.error('Create loan: No userId found');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const data = req.body;

    // Only require name
    if (!data.name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Handle both camelCase and snake_case field names, provide defaults
    const now = new Date();
    const fiveYearsLater = new Date(now);
    fiveYearsLater.setFullYear(fiveYearsLater.getFullYear() + 5);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const total_amount = parseFloat(data.total_amount || data.totalAmount || '0') || 0;
    const remaining_amount = parseFloat(data.remaining_amount || data.remainingAmount || data.total_amount || data.totalAmount || '0') || total_amount;
    const interest_rate = parseFloat(data.interest_rate || data.interestRate || '0') || 0;
    const currency = data.currency || 'PLN';
    const nowDate = now.toISOString().split('T')[0];
    const fiveYearsDate = fiveYearsLater.toISOString().split('T')[0];
    const nextMonthDate = nextMonth.toISOString().split('T')[0];
    const start_date = toMySQLDate(data.start_date || data.startDate, nowDate);
    const end_date = toMySQLDate(data.end_date || data.endDate, fiveYearsDate);
    const next_payment_date = toMySQLDate(data.next_payment_date || data.nextPaymentDate, nextMonthDate);
    const next_payment_amount = parseFloat(data.next_payment_amount || data.nextPaymentAmount || data.installment || '0') || 0;
    const lender = data.lender || '';
    const rawLoanType = data.loan_type || data.loanType || 'other';
    const loanTypeMap: Record<string, string> = { 'hipoteka': 'mortgage', 'osobisty': 'personal', 'samochodowy': 'car', 'studencki': 'student', 'biznesowy': 'business', 'kredyt': 'credit', 'inny': 'other' };
    const loan_type = loanTypeMap[rawLoanType] || rawLoanType;
    const rawLoanStatus = data.status || 'active';
    const loanStatusMap: Record<string, string> = { 'aktywna': 'active', 'spłacona': 'paid', 'opóźniona': 'delayed', 'niespłacona': 'defaulted', 'refinansowana': 'refinanced' };
    const status = loanStatusMap[rawLoanStatus] || rawLoanStatus;
    const payment_frequency = data.payment_frequency || data.paymentFrequency || 'monthly';
    const duration_in_months = parseInt(data.duration_in_months || data.durationInMonths || '60', 10) || 60;
    const loan_number = data.loan_number || data.loanNumber || '';
    const description = data.description || data.note || '';
    const category = data.category || '';

    // Handle attachments/documents
    let documents = '[]';
    if (data.documents) {
      documents = typeof data.documents === 'string' ? data.documents : JSON.stringify(data.documents);
    } else if (data.attachments) {
      documents = typeof data.attachments === 'string' ? data.attachments : JSON.stringify(data.attachments);
    } else if (Array.isArray(data.attachments)) {
      documents = JSON.stringify(data.attachments);
    }

    const id = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Create loan:', { userId, name: data.name, total_amount, id });

    await pool.execute(
      `INSERT INTO user_loans (
        id, user_id, name, total_amount, remaining_amount, interest_rate, currency,
        start_date, end_date, next_payment_date, next_payment_amount, lender,
        loan_type, status, payment_frequency, duration_in_months, 
        loan_number, description, documents, category,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id, userId, data.name, total_amount, remaining_amount,
        interest_rate, currency, start_date, end_date,
        next_payment_date, next_payment_amount, lender,
        loan_type, status, payment_frequency,
        duration_in_months, loan_number, description, documents, category
      ]
    );

    const [rows] = await pool.execute<LoanRow[]>('SELECT * FROM user_loans WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(500).json({ error: 'Failed to retrieve created loan' });
      return;
    }
    res.status(201).json(rows[0]);
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'create_loan',
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
      body: req.body,
    }, 'Failed to create loan');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Update loan
router.put('/loans/:id', verifySupabaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify ownership
    const [existing] = await pool.execute('SELECT user_id FROM user_loans WHERE id = ?', [id]);
    const existingRows = existing as LoanRow[];
    if (existingRows.length === 0 || existingRows[0].user_id !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    const data = req.body;

    const addField = (col: string, val: unknown) => {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        values.push(val);
      }
    };

    addField('name', data.name);
    addField('total_amount', data.total_amount !== undefined ? data.total_amount : data.totalAmount);
    addField('remaining_amount', data.remaining_amount !== undefined ? data.remaining_amount : data.remainingAmount);
    addField('interest_rate', data.interest_rate !== undefined ? data.interest_rate : data.interestRate);
    addField('currency', data.currency);
    // Convert dates to MySQL format
    const startDateVal = data.start_date || data.startDate;
    if (startDateVal) addField('start_date', toMySQLDate(startDateVal, startDateVal));
    const endDateVal = data.end_date || data.endDate;
    if (endDateVal) addField('end_date', toMySQLDate(endDateVal, endDateVal));
    const nextPaymentDateVal = data.next_payment_date || data.nextPaymentDate;
    if (nextPaymentDateVal) addField('next_payment_date', toMySQLDate(nextPaymentDateVal, nextPaymentDateVal));
    addField('next_payment_amount', data.next_payment_amount !== undefined ? data.next_payment_amount : (data.installment || data.nextPaymentAmount));
    addField('lender', data.lender);
    const rawLoanTypeUpdate = data.loan_type || data.loanType;
    const loanTypeMapUpdate: Record<string, string> = { 'hipoteka': 'mortgage', 'osobisty': 'personal', 'samochodowy': 'car', 'studencki': 'student', 'biznesowy': 'business', 'kredyt': 'credit', 'inny': 'other' };
    const mappedLoanType = rawLoanTypeUpdate ? (loanTypeMapUpdate[rawLoanTypeUpdate] || rawLoanTypeUpdate) : undefined;
    addField('loan_type', mappedLoanType);
    const loanStatusMapUpdate: Record<string, string> = { 'aktywna': 'active', 'spłacona': 'paid', 'opóźniona': 'delayed', 'niespłacona': 'defaulted', 'refinansowana': 'refinanced' };
    const mappedLoanStatus = data.status ? (loanStatusMapUpdate[data.status] || data.status) : undefined;
    addField('status', mappedLoanStatus);
    addField('payment_frequency', data.payment_frequency || data.paymentFrequency);
    addField('duration_in_months', data.duration_in_months || data.durationInMonths);
    addField('loan_number', data.loan_number || data.loanNumber);
    addField('description', data.description || data.note);
    addField('category', data.category);

    if (data.documents !== undefined) {
      addField('documents', typeof data.documents === 'string' ? data.documents : JSON.stringify(data.documents));
    } else if (data.attachments !== undefined) {
      addField('documents', typeof data.attachments === 'string' ? data.attachments : JSON.stringify(data.attachments));
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await pool.execute(
      `UPDATE user_loans SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [rows] = await pool.execute<LoanRow[]>('SELECT * FROM user_loans WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).json({ error: 'Loan not found' });
      return;
    }
    res.json(rows[0]);
    return;
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'update_loan',
      loanId: req.params.id,
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to update loan');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Delete loan
router.delete('/loans/:id', verifySupabaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify ownership
    const [existing] = await pool.execute('SELECT user_id FROM user_loans WHERE id = ?', [id]);
    const existingRows = existing as LoanRow[];
    if (existingRows.length === 0 || existingRows[0].user_id !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await pool.execute('DELETE FROM user_loans WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'delete_loan',
      loanId: req.params.id,
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to delete loan');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Get user AI items
// OPTIMIZATION: Pagination (limit/offset) implemented
// Database index on user_ai(user_id, created_at) added in migration 2025_01_18_add_composite_indexes.sql
// Redis cache implemented with 5 minute TTL
router.get('/ai', verifySupabaseToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Optional pagination parameters
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 1000) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    // Try to get from cache first (only if no pagination)
    if (limit === undefined && offset === undefined) {
      const cacheKey = RedisCache.generateKey('user', userId, { type: 'ai' });
      const cached = await redisCache.get<InsuranceRow[]>(cacheKey);

      if (cached) {
        logger.debug('Get AI: Cache hit', { userId });
        res.json(cached);
        return;
      }
    }

    let query = 'SELECT * FROM user_ai WHERE user_id = ? ORDER BY created_at DESC';
    const params: unknown[] = [userId];

    if (limit !== undefined) {
      query += ' LIMIT ?';
      params.push(limit);
      if (offset !== undefined) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    const [rows] = await pool.execute<InsuranceRow[]>(query, params);

    // Convert Date objects to ISO strings for JSON response (snake_case format, no camelCase transformation)
    const aiItems = rows.map((row) => ({
      ...row,
      period_start: row.period_start instanceof Date ? row.period_start.toISOString() : row.period_start,
      period_end: row.period_end instanceof Date ? row.period_end.toISOString() : row.period_end,
      renewal_date: row.renewal_date instanceof Date ? row.renewal_date.toISOString() : row.renewal_date,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    }));

    // Cache the result for 5 minutes (only if no pagination)
    if (limit === undefined && offset === undefined) {
      const cacheKey = RedisCache.generateKey('user', userId, { type: 'ai' });
      await redisCache.set(cacheKey, aiItems, 300);
    }

    res.json(aiItems);
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'get_ai',
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to get AI');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Create AI item
router.post('/ai', verifySupabaseToken, async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Only require name
    const name = req.body.name;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Handle both camelCase and snake_case field names, provide defaults
    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const amount = parseFloat(req.body.amount || req.body.amountDue || '0') || 0;
    const currency = req.body.currency || 'PLN';
    const nowDate = now.toISOString().split('T')[0];
    const nextYearDate = nextYear.toISOString().split('T')[0];
    const period_start = toMySQLDate(req.body.period_start || req.body.periodStart, nowDate);
    const period_end = toMySQLDate(req.body.period_end || req.body.periodEnd, nextYearDate);
    const renewal_date = toMySQLDate(req.body.renewal_date || req.body.renewalDate || req.body.nextPaymentDate, nextYearDate);
    const insurance_company = req.body.insurance_company || req.body.insuranceCompany || '';
    const insurance_type = req.body.insurance_type || req.body.insuranceType || 'other';
    const rawStatus = req.body.status || 'active';
    const statusMap: Record<string, string> = { 'aktywna': 'active', 'wygasła': 'expired', 'anulowana': 'cancelled', 'oczekująca': 'pending' };
    const status = statusMap[rawStatus] || rawStatus;
    const description = req.body.description || req.body.note || '';
    const policy_number = req.body.policy_number || req.body.policyNumber || '';
    const insured_object = req.body.insured_object || req.body.insuredObject || '';
    const category = req.body.category || '';

    // Handle attachments/documents
    let documents = '[]';
    if (req.body.documents) {
      documents = typeof req.body.documents === 'string' ? req.body.documents : JSON.stringify(req.body.documents);
    } else if (req.body.attachments) {
      documents = typeof req.body.attachments === 'string' ? req.body.attachments : JSON.stringify(req.body.attachments);
    } else if (Array.isArray(req.body.attachments)) {
      documents = JSON.stringify(req.body.attachments);
    }

    // Preserve renewalCycle in description if not present otherwise
    let finalDescription = description;
    if (req.body.renewalCycle && !description.includes('Renewal Cycle:')) {
      finalDescription = `${description ? description + '\n' : ''}Renewal Cycle: ${req.body.renewalCycle}`;
    }

    const id = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Create AI:', { userId, name, amount, id });

    await pool.execute(
      `INSERT INTO user_ai (
        id, user_id, name, amount, currency, period_start, period_end,
        renewal_date, insurance_company, insurance_type, status, 
        description, documents, policy_number, insured_object, category,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id, userId, name, amount, currency, period_start, period_end,
        renewal_date, insurance_company, insurance_type, status,
        finalDescription, documents, policy_number, insured_object, category
      ]
    );

    const [rows] = await pool.execute('SELECT * FROM user_ai WHERE id = ?', [id]);
    res.status(201).json((rows as InsuranceRow[])[0]);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Create AI error:', err);
    res.status(500).json({ error: err.message || 'Failed to create AI' });
  }
});

// Update AI item
router.put('/ai/:id', verifySupabaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify ownership
    const [existing] = await pool.execute('SELECT user_id FROM user_ai WHERE id = ?', [id]);
    const existingRows = existing as InsuranceRow[];
    if (existingRows.length === 0 || existingRows[0].user_id !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    const data = req.body;

    const addField = (col: string, val: unknown) => {
      if (val !== undefined) {
        fields.push(`${col} = ?`);
        values.push(val);
      }
    };

    addField('name', data.name);
    addField('amount', data.amount !== undefined ? data.amount : data.amountDue);
    addField('currency', data.currency);
    // Convert dates to MySQL format
    const periodStartVal = data.period_start || data.periodStart;
    if (periodStartVal) addField('period_start', toMySQLDate(periodStartVal, periodStartVal));
    const periodEndVal = data.period_end || data.periodEnd;
    if (periodEndVal) addField('period_end', toMySQLDate(periodEndVal, periodEndVal));
    const renewalDateVal = data.renewal_date || data.renewalDate || data.nextPaymentDate;
    if (renewalDateVal) addField('renewal_date', toMySQLDate(renewalDateVal, renewalDateVal));
    addField('insurance_company', data.insurance_company || data.insuranceCompany);
    addField('insurance_type', data.insurance_type || data.insuranceType);
    const insuranceStatusMapUpdate: Record<string, string> = { 'aktywna': 'active', 'wygasła': 'expired', 'anulowana': 'cancelled', 'oczekująca': 'pending' };
    const mappedInsuranceStatus = data.status ? (insuranceStatusMapUpdate[data.status] || data.status) : undefined;
    addField('status', mappedInsuranceStatus);
    addField('description', data.description || data.note);
    addField('policy_number', data.policy_number || data.policyNumber);
    addField('insured_object', data.insured_object || data.insuredObject);
    addField('category', data.category);

    // Handle documents/attachments
    if (data.documents !== undefined) {
      const documents = typeof data.documents === 'string' ? data.documents : JSON.stringify(data.documents);
      addField('documents', documents);
    } else if (data.attachments !== undefined) {
      const documents = typeof data.attachments === 'string' ? data.attachments : JSON.stringify(data.attachments);
      addField('documents', documents);
    }

    // Preserve renewalCycle in description if not present otherwise
    if (data.renewalCycle && data.description && !data.description.includes('Renewal Cycle:')) {
      const finalDescription = `${data.description}\nRenewal Cycle: ${data.renewalCycle}`;
      addField('description', finalDescription);
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(id);
    await pool.execute(`UPDATE user_ai SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

    const [rows] = await pool.execute<InsuranceRow[]>('SELECT * FROM user_ai WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).json({ error: 'AI entry not found' });
      return;
    }
    res.json(rows[0]);
    return;
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'update_ai',
      aiId: req.params.id,
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to update AI');
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Delete AI item
router.delete('/ai/:id', verifySupabaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req as AuthenticatedRequest);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify ownership
    const [existing] = await pool.execute('SELECT user_id FROM user_ai WHERE id = ?', [id]);
    const existingRows = existing as InsuranceRow[];
    if (existingRows.length === 0 || existingRows[0].user_id !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await pool.execute('DELETE FROM user_ai WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error: unknown) {
    const { error: errorMessage, statusCode } = createErrorResponse(error, {
      operation: 'delete_ai',
      aiId: req.params.id,
      userId: getUserIdFromRequest(req as AuthenticatedRequest),
    }, 'Failed to delete AI');
    res.status(statusCode).json({ error: errorMessage });
  }
});

export { router as subscriptionsRouter };

