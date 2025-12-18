# Database Migrations

This directory contains SQL migration files for the MariaDB database.

## Migration Files

### 2025_01_18_add_composite_indexes.sql
Adds composite indexes for better query performance:
- Composite indexes on `(user_id, created_at)` for all financial data tables
- Indexes for filtering by `(user_id, status)`
- Indexes for filtering by `renewal_date` and `next_payment_date`

**Impact:**
- Significantly improves query performance for paginated user data
- Optimizes filtering by user and status
- Improves queries for upcoming renewals and payments

## How to Apply Migrations

### Option 1: Direct SQL Execution
```bash
mysql -h 192.168.0.9 -u Saas -p Finanse < database/migrations/2025_01_18_add_composite_indexes.sql
```

### Option 2: Using MySQL Client
```bash
mysql -h 192.168.0.9 -u Saas -p
USE Finanse;
SOURCE database/migrations/2025_01_18_add_composite_indexes.sql;
```

### Option 3: Using Database Management Tool
Import the SQL file through your database management tool (phpMyAdmin, DBeaver, etc.)

## Verification

After applying migrations, verify indexes were created:

```sql
SHOW INDEXES FROM user_subscriptions;
SHOW INDEXES FROM user_insurances;
SHOW INDEXES FROM user_loans;
SHOW INDEXES FROM user_ai;
```

You should see the new composite indexes:
- `idx_user_subscriptions_user_created`
- `idx_user_insurances_user_created`
- `idx_user_loans_user_created`
- `idx_user_ai_user_created`
- And other indexes as defined in the migration

## Rollback

To remove these indexes (if needed):

```sql
USE Finanse;

DROP INDEX IF EXISTS idx_user_subscriptions_user_created ON user_subscriptions;
DROP INDEX IF EXISTS idx_user_insurances_user_created ON user_insurances;
DROP INDEX IF EXISTS idx_user_loans_user_created ON user_loans;
DROP INDEX IF EXISTS idx_user_ai_user_created ON user_ai;
DROP INDEX IF EXISTS idx_user_subscriptions_user_status ON user_subscriptions;
DROP INDEX IF EXISTS idx_user_insurances_user_status ON user_insurances;
DROP INDEX IF EXISTS idx_user_loans_user_status ON user_loans;
DROP INDEX IF EXISTS idx_user_ai_user_status ON user_ai;
DROP INDEX IF EXISTS idx_user_subscriptions_renewal_date ON user_subscriptions;
DROP INDEX IF EXISTS idx_user_insurances_renewal_date ON user_insurances;
DROP INDEX IF EXISTS idx_user_ai_renewal_date ON user_ai;
DROP INDEX IF EXISTS idx_user_loans_next_payment_date ON user_loans;
```

