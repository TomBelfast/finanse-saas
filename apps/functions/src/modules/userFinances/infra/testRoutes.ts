// TEST ENDPOINTS (bez autoryzacji - tylko DEV!)
import express from 'express';
import { getDatabasePool } from '../../../shared/infra/database';
import { MariaDBUserSubscriptionRepository } from '../../../shared/infra/repositories/MariaDBUserSubscriptionRepository';
import { InsuranceRow, LoanRow } from '../../../shared/types/express';
import { RowDataPacket } from 'mysql2';

const testRouter = express.Router();
const pool = getDatabasePool();
const subscriptionsRepo = new MariaDBUserSubscriptionRepository({ pool });
const TEST_USER_ID = 'test_user_123';

// DEBUG: Create insurance for specific user (for testing)
testRouter.post('/debug/insurance/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const id = `ins_debug_${Date.now()}`;
    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    await pool.execute(
      'INSERT INTO user_insurances (id, user_id, name, insurance_company, amount, currency, status, period_start, period_end, renewal_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [id, userId, name, 'Test Insurance Co', 100, 'PLN', 'active', now, nextYear, nextYear]
    );
    const [rows] = await pool.execute('SELECT * FROM user_insurances WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: (rows as any[])[0] });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DEBUG: List all users and their data counts
testRouter.get('/debug/users', async (req, res) => {
  try {
    interface UserRow extends RowDataPacket {
      uid: string;
      email: string | null;
      first_name: string | null;
      last_name: string | null;
    }
    
    interface CountRow extends RowDataPacket {
      count: number;
    }
    
    const [users] = await pool.execute<UserRow[]>('SELECT uid, email, first_name, last_name FROM users LIMIT 20');
    const userList = [];
    for (const user of users) {
      const [subs] = await pool.execute<CountRow[]>('SELECT COUNT(*) as count FROM user_subscriptions WHERE user_id = ?', [user.uid]);
      const [ins] = await pool.execute<CountRow[]>('SELECT COUNT(*) as count FROM user_insurances WHERE user_id = ?', [user.uid]);
      const [loans] = await pool.execute<CountRow[]>('SELECT COUNT(*) as count FROM user_loans WHERE user_id = ?', [user.uid]);
      userList.push({
        uid: user.uid,
        email: user.email,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        subscriptions: Array.isArray(subs) && subs.length > 0 ? subs[0].count : 0,
        insurances: Array.isArray(ins) && ins.length > 0 ? ins[0].count : 0,
        loans: Array.isArray(loans) && loans.length > 0 ? loans[0].count : 0
      });
    }
    res.json({ success: true, users: userList });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// CREATE UPLOADED_FILES TABLE (for document storage)
testRouter.post('/setup-uploads', async (req, res) => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) DEFAULT 'application/octet-stream',
        size INT UNSIGNED DEFAULT 0,
        data LONGBLOB,
        entity_type VARCHAR(50),
        entity_id VARCHAR(36),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_entity (entity_type, entity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    res.json({ success: true, message: 'uploaded_files table created' });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// CREATE TEST USER (required for foreign key constraints)
testRouter.post('/setup', async (req, res) => {
  try {
    // Check if test user exists
    interface ExistingUserRow extends RowDataPacket {
      uid: string;
    }
    const [existing] = await pool.execute<ExistingUserRow[]>('SELECT uid FROM users WHERE uid = ?', [TEST_USER_ID]);
    if (Array.isArray(existing) && existing.length > 0) {
      return res.json({ success: true, message: 'Test user already exists', userId: TEST_USER_ID });
    }
    // Create test user with required fields
    await pool.execute(
      'INSERT INTO users (uid, email, first_name, last_name, terms_and_privacy_policy, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
      [TEST_USER_ID, 'test@test.com', 'Test', 'User']
    );
    res.status(201).json({ success: true, message: 'Test user created', userId: TEST_USER_ID });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// SUBSCRIPTIONS
testRouter.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await subscriptionsRepo.getByUserId(TEST_USER_ID);
    res.json({ success: true, data: subscriptions, count: subscriptions.length });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

testRouter.post('/subscriptions', async (req, res) => {
  try {
    const { name, amount } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const subscription = await subscriptionsRepo.create({
      userId: TEST_USER_ID, name, amount: parseFloat(amount) || 0,
      currency: 'PLN', periodStart: now.toISOString(), periodEnd: nextMonth.toISOString(),
      renewalDate: nextMonth.toISOString(), provider: 'Test', status: 'active',
      isAutomaticRenewal: true, description: '', category: 'test', documents: [],
    });
    res.status(201).json({ success: true, data: subscription });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

testRouter.put('/subscriptions/:id', async (req, res) => {
  try {
    const subscription = await subscriptionsRepo.update(req.params.id, req.body);
    res.json({ success: true, data: subscription });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

testRouter.delete('/subscriptions/:id', async (req, res) => {
  try {
    await subscriptionsRepo.delete(req.params.id);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// INSURANCES
testRouter.get('/insurances', async (req, res) => {
  try {
    const [rows] = await pool.execute<InsuranceRow[]>('SELECT * FROM user_insurances WHERE user_id = ?', [TEST_USER_ID]);
    res.json({ success: true, data: rows, count: Array.isArray(rows) ? rows.length : 0 });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

testRouter.post('/insurances', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const id = `ins_test_${Date.now()}`;
    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    await pool.execute(
      'INSERT INTO user_insurances (id, user_id, name, insurance_company, amount, currency, status, period_start, period_end, renewal_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [id, TEST_USER_ID, name, 'Test Insurance Co', req.body.amount || 0, 'PLN', 'active', now, nextYear, nextYear]
    );
    const [rows] = await pool.execute('SELECT * FROM user_insurances WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: (rows as any[])[0] });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

testRouter.delete('/insurances/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM user_insurances WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// LOANS
testRouter.get('/loans', async (req, res) => {
  try {
    const [rows] = await pool.execute<LoanRow[]>('SELECT * FROM user_loans WHERE user_id = ?', [TEST_USER_ID]);
    res.json({ success: true, data: rows, count: Array.isArray(rows) ? rows.length : 0 });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

testRouter.post('/loans', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const id = `loan_test_${Date.now()}`;
    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const totalAmount = req.body.total_amount || 10000;
    const monthlyPayment = Math.round(totalAmount / 120); // 10 years
    await pool.execute(
      'INSERT INTO user_loans (id, user_id, name, lender, total_amount, remaining_amount, currency, status, interest_rate, start_date, end_date, next_payment_date, next_payment_amount, duration_in_months, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [id, TEST_USER_ID, name, 'Test Bank', totalAmount, totalAmount, 'PLN', 'active', 5.5, now, nextYear, nextMonth, monthlyPayment, 120]
    );
    const [rows] = await pool.execute<LoanRow[]>('SELECT * FROM user_loans WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve created loan' });
    }
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

testRouter.delete('/loans/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM user_loans WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export { testRouter };
