-- AkademiaSaaS Database Schema for MariaDB
-- Migration from Firestore to MariaDB

CREATE DATABASE IF NOT EXISTS akademiasaas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE akademiasaas;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    contact_email VARCHAR(255) NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NULL,
    avatar_url TEXT NULL,
    mobile_fcm_tokens JSON NULL,
    web_fcm_tokens JSON NULL,
    terms_and_policy_accept_date DATETIME NULL,
    terms_and_privacy_policy BOOLEAN DEFAULT FALSE,
    stripe_customer_id VARCHAR(255) NULL,
    country VARCHAR(2) NULL,
    features JSON NULL,
    ip VARCHAR(45) NULL,
    subscription JSON NULL,
    lang VARCHAR(10) NULL,
    timezone VARCHAR(100) NULL,
    invoice_data JSON NULL,
    phone_number VARCHAR(50) NULL,
    default_currency VARCHAR(3) NULL,
    onboarding JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_stripe_customer_id (stripe_customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,
    renewal_date DATETIME NOT NULL,
    provider VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('active', 'inactive', 'pending_renewal', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
    is_automatic_renewal BOOLEAN DEFAULT TRUE,
    category VARCHAR(100) NULL,
    documents JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_renewal_date (renewal_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Insurances table
CREATE TABLE IF NOT EXISTS user_insurances (
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

-- User Loans table
CREATE TABLE IF NOT EXISTS user_loans (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    remaining_amount DECIMAL(10, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    next_payment_date DATETIME NOT NULL,
    next_payment_amount DECIMAL(10, 2) NOT NULL,
    lender VARCHAR(255) NOT NULL,
    loan_number VARCHAR(255) NULL,
    description TEXT NULL,
    loan_type ENUM('mortgage', 'personal', 'car', 'student', 'business', 'credit', 'other') NOT NULL,
    status ENUM('active', 'paid', 'delayed', 'defaulted', 'refinanced') NOT NULL DEFAULT 'active',
    payment_frequency ENUM('monthly', 'quarterly', 'yearly', 'custom') NOT NULL DEFAULT 'monthly',
    duration_in_months INT NOT NULL,
    documents JSON NULL,
    category VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_next_payment_date (next_payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Reminders table
CREATE TABLE IF NOT EXISTS user_reminders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    item_id VARCHAR(255) NOT NULL,
    item_type ENUM('subscription', 'insurance', 'loan') NOT NULL,
    days_before_date INT NOT NULL,
    status ENUM('active', 'sent', 'failed', 'cancelled') NOT NULL DEFAULT 'active',
    is_enabled BOOLEAN DEFAULT TRUE,
    target_date DATETIME NOT NULL,
    scheduled_date DATETIME NOT NULL,
    email_template VARCHAR(255) NULL,
    custom_message TEXT NULL,
    sent_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_item_id (item_id),
    INDEX idx_item_type (item_type),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Reminder Settings table
CREATE TABLE IF NOT EXISTS user_reminder_settings (
    user_id VARCHAR(255) PRIMARY KEY,
    subscriptions_enabled BOOLEAN DEFAULT TRUE,
    insurances_enabled BOOLEAN DEFAULT TRUE,
    loans_enabled BOOLEAN DEFAULT TRUE,
    default_days_before_dates JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NULL,
    `read` BOOLEAN DEFAULT FALSE,
    data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_read (`read`),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(255) PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL UNIQUE,
    value JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API Tokens table
CREATE TABLE IF NOT EXISTS api_tokens (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NULL,
    expires_at DATETIME NULL,
    last_used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Business Events table
CREATE TABLE IF NOT EXISTS business_events (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NULL,
    event_type VARCHAR(100) NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

