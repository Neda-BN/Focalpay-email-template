-- ========================================
-- DATABASE SCHEMA FOR UNSUBSCRIBE SYSTEM
-- ========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    unsubscribed BOOLEAN DEFAULT 0,
    unsubscribed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_unsubscribed (unsubscribed)
);

-- Unsubscribe tokens table (optional - for tracking tokens)
CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT 0,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Unsubscribe log table (for audit trail)
CREATE TABLE IF NOT EXISTS unsubscribe_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp)
);

-- ========================================
-- POSTGRESQL VERSION (if using PostgreSQL)
-- ========================================

/*
-- Users table (PostgreSQL)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    unsubscribed BOOLEAN DEFAULT FALSE,
    unsubscribed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_unsubscribed ON users(unsubscribed);

-- Unsubscribe tokens table (PostgreSQL)
CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tokens_token ON unsubscribe_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON unsubscribe_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON unsubscribe_tokens(expires_at);

-- Unsubscribe log table (PostgreSQL)
CREATE TABLE IF NOT EXISTS unsubscribe_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_log_user_id ON unsubscribe_log(user_id);
CREATE INDEX IF NOT EXISTS idx_log_timestamp ON unsubscribe_log(timestamp);
*/

-- ========================================
-- SAMPLE DATA (for testing)
-- ========================================

INSERT INTO users (email, name, unsubscribed) VALUES
    ('test@example.com', 'Test User', 0),
    ('user2@example.com', 'User Two', 0),
    ('unsubscribed@example.com', 'Already Unsubscribed', 1);

-- ========================================
-- UTILITY QUERIES
-- ========================================

-- Get all active (subscribed) users
-- SELECT * FROM users WHERE unsubscribed = 0;

-- Get all unsubscribed users
-- SELECT * FROM users WHERE unsubscribed = 1;

-- Get unsubscribe statistics
-- SELECT 
--     COUNT(*) as total_users,
--     SUM(CASE WHEN unsubscribed = 1 THEN 1 ELSE 0 END) as unsubscribed_count,
--     SUM(CASE WHEN unsubscribed = 0 THEN 1 ELSE 0 END) as subscribed_count,
--     ROUND(100.0 * SUM(CASE WHEN unsubscribed = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as unsubscribe_rate
-- FROM users;

-- Get recent unsubscribe activity
-- SELECT * FROM unsubscribe_log 
-- ORDER BY timestamp DESC 
-- LIMIT 100;

-- Clean up expired tokens (run periodically)
-- DELETE FROM unsubscribe_tokens 
-- WHERE expires_at < CURRENT_TIMESTAMP AND used = 0;

