-- IELTS Mock Platform Database Schema
-- Database: mockpaperilets

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS test_modules;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  reset_password_token VARCHAR(255),
  reset_password_expire DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tests Table
CREATE TABLE tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('Academic', 'General') NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  duration_listening INT DEFAULT 30,
  duration_reading INT DEFAULT 60,
  duration_writing INT DEFAULT 60,
  duration_speaking INT DEFAULT 15,
  is_active BOOLEAN DEFAULT TRUE,
  sections JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test Modules Table
CREATE TABLE test_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  test_type ENUM('Academic', 'General') NOT NULL,
  module_type ENUM('listening', 'reading', 'writing', 'speaking') NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  duration INT NOT NULL,
  difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT TRUE,
  thumbnail VARCHAR(255),
  content JSON,
  questions JSON,
  total_questions INT DEFAULT 0,
  total_marks INT DEFAULT 0,
  passing_marks INT DEFAULT 0,
  instructions TEXT,
  tags JSON,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_test_type (test_type),
  INDEX idx_module_type (module_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions Table
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  test_type ENUM('Academic', 'General') NOT NULL,
  test_module ENUM('listening', 'reading', 'writing', 'speaking', 'full_package') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'active', 'expired', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_method ENUM('bank_transfer', 'whatsapp', 'stripe', 'paypal'),
  payment_slip VARCHAR(255),
  transaction_id VARCHAR(255),
  start_date DATETIME,
  expiry_date DATETIME,
  tests_allowed INT DEFAULT 1,
  tests_used INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_test (user_id, test_type, test_module),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings Table
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  test_id INT NOT NULL,
  payment_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  payment_slip VARCHAR(255),
  payment_method ENUM('bank_transfer', 'whatsapp') DEFAULT 'bank_transfer',
  amount DECIMAL(10, 2) NOT NULL,
  test_status ENUM('locked', 'unlocked', 'in_progress', 'completed') DEFAULT 'locked',
  test_started_at DATETIME,
  test_completed_at DATETIME,
  answers JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  INDEX idx_user_test (user_id, test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attempts Table
CREATE TABLE attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  test_module_id INT NOT NULL,
  subscription_id INT,
  attempt_number INT NOT NULL,
  status ENUM('in_progress', 'finished', 'abandoned') DEFAULT 'in_progress',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  duration INT,
  answers JSON,
  writing_responses JSON,
  speaking_responses JSON,
  score_obtained INT DEFAULT 0,
  score_total INT DEFAULT 0,
  score_percentage DECIMAL(5, 2) DEFAULT 0,
  score_grade VARCHAR(10),
  is_graded BOOLEAN DEFAULT FALSE,
  graded_by INT,
  graded_at DATETIME,
  feedback TEXT,
  flagged_questions JSON,
  time_spent_per_question JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (test_module_id) REFERENCES test_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_module (user_id, test_module_id),
  INDEX idx_status (status),
  INDEX idx_attempt_number (attempt_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Results Table
CREATE TABLE results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  test_id INT NOT NULL,
  listening_score DECIMAL(3, 1) CHECK (listening_score >= 0 AND listening_score <= 9),
  listening_details TEXT,
  reading_score DECIMAL(3, 1) CHECK (reading_score >= 0 AND reading_score <= 9),
  reading_details TEXT,
  writing_score DECIMAL(3, 1) CHECK (writing_score >= 0 AND writing_score <= 9),
  writing_details TEXT,
  speaking_score DECIMAL(3, 1) CHECK (speaking_score >= 0 AND speaking_score <= 9),
  speaking_details TEXT,
  overall_score DECIMAL(3, 1) CHECK (overall_score >= 0 AND overall_score <= 9),
  feedback TEXT,
  result_file VARCHAR(255),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
