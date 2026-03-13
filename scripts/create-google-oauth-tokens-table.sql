-- Google OAuth Tokens Table
-- Stores admin's Google Calendar OAuth tokens for calendar integration

CREATE TABLE IF NOT EXISTS google_oauth_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Admin User (one token per admin)
  admin_id INT NOT NULL UNIQUE,

  -- OAuth Tokens (encrypted storage recommended in production)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expiry_date BIGINT NOT NULL,

  -- Scope
  scope TEXT NOT NULL,

  -- Calendar Info
  calendar_id VARCHAR(255) DEFAULT 'primary',

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Key
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Index
  INDEX idx_admin_id (admin_id),
  INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
