-- Test Attempts Table for MySQL
-- Run this SQL to create the test_attempts table

CREATE TABLE IF NOT EXISTS test_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_id INT NOT NULL,
  test_type ENUM('Academic', 'General') NOT NULL,
  test_module ENUM('listening', 'reading', 'writing', 'speaking') NOT NULL,
  answers JSON,
  score INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL,
  time_spent INT COMMENT 'Time spent in seconds',
  status ENUM('in_progress', 'completed') DEFAULT 'completed',
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  INDEX idx_user_test (user_id, test_type, test_module),
  INDEX idx_subscription (subscription_id),
  INDEX idx_completed (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
