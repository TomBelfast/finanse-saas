-- Migration: Add composite indexes for better query performance
-- Date: 2025-01-18
-- Description: Adds composite indexes on (user_id, created_at) for financial data tables
--              to optimize queries with WHERE user_id = ? ORDER BY created_at
--              Used for pagination and filtering by user

USE Finanse;

-- Add composite index on user_subscriptions(user_id, created_at)
-- This index optimizes queries like: SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_created 
ON user_subscriptions(user_id, created_at DESC);

-- Add composite index on user_insurances(user_id, created_at)
-- This index optimizes queries like: SELECT * FROM user_insurances WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
CREATE INDEX IF NOT EXISTS idx_user_insurances_user_created 
ON user_insurances(user_id, created_at DESC);

-- Add composite index on user_loans(user_id, created_at)
-- This index optimizes queries like: SELECT * FROM user_loans WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
CREATE INDEX IF NOT EXISTS idx_user_loans_user_created 
ON user_loans(user_id, created_at DESC);

-- Add composite index on user_ai(user_id, created_at)
-- This index optimizes queries like: SELECT * FROM user_ai WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
CREATE INDEX IF NOT EXISTS idx_user_ai_user_created 
ON user_ai(user_id, created_at DESC);

-- Additional indexes for common filter combinations

-- Index for filtering subscriptions by user and status
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
ON user_subscriptions(user_id, status);

-- Index for filtering insurances by user and status
CREATE INDEX IF NOT EXISTS idx_user_insurances_user_status 
ON user_insurances(user_id, status);

-- Index for filtering loans by user and status
CREATE INDEX IF NOT EXISTS idx_user_loans_user_status 
ON user_loans(user_id, status);

-- Index for filtering AI by user and status
CREATE INDEX IF NOT EXISTS idx_user_ai_user_status 
ON user_ai(user_id, status);

-- Index for filtering by renewal_date (for upcoming renewals)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_renewal_date 
ON user_subscriptions(renewal_date);

CREATE INDEX IF NOT EXISTS idx_user_insurances_renewal_date 
ON user_insurances(renewal_date);

CREATE INDEX IF NOT EXISTS idx_user_ai_renewal_date 
ON user_ai(renewal_date);

-- Index for loans by next_payment_date (for payment reminders)
CREATE INDEX IF NOT EXISTS idx_user_loans_next_payment_date 
ON user_loans(next_payment_date);

