-- Migration: Create user_ai table
-- Date: 2025-01-20
-- Description: Creates a separate table for AI items, similar to user_insurances

USE Finanse;

-- User AI table
CREATE TABLE IF NOT EXISTS user_ai (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,
    renewal_date DATETIME NOT NULL,
    insurance_company VARCHAR(255) NOT NULL,
    policy_number VARCHAR(255) NULL,
    insured_object VARCHAR(255) NULL,
    description TEXT NULL,
    insurance_type ENUM('health', 'life', 'car', 'home', 'travel', 'business', 'other') NOT NULL,
    status ENUM('active', 'expired', 'cancelled', 'pending') NOT NULL DEFAULT 'active',
    documents JSON NULL,
    category VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_renewal_date (renewal_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

