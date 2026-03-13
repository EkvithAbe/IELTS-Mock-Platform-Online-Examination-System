-- Appointments Table for Speaking Test Management
-- This table stores speaking appointment requests and their status

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Relationships
  user_id INT NOT NULL,
  admin_id INT DEFAULT NULL,
  subscription_id INT DEFAULT NULL,

  -- Appointment Details
  requested_datetime DATETIME NOT NULL,
  confirmed_datetime DATETIME DEFAULT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
  duration INT NOT NULL DEFAULT 15,

  -- Status Management
  status ENUM('pending', 'approved', 'rejected', 'rescheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',

  -- Contact Information
  phone VARCHAR(50) DEFAULT NULL,
  whatsapp VARCHAR(50) DEFAULT NULL,
  preferred_contact_method ENUM('email', 'sms', 'whatsapp') DEFAULT 'email',

  -- Meeting Details
  meeting_link VARCHAR(500) DEFAULT NULL,
  meeting_platform ENUM('google_meet', 'zoom', 'whatsapp_call', 'phone_call') DEFAULT 'google_meet',
  meeting_notes TEXT DEFAULT NULL,

  -- Google Calendar Integration
  google_calendar_event_id VARCHAR(255) DEFAULT NULL,
  google_meet_link VARCHAR(500) DEFAULT NULL,

  -- Reminder Tracking
  confirmation_sent BOOLEAN DEFAULT FALSE,
  confirmation_sent_at DATETIME DEFAULT NULL,
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  reminder_24h_sent_at DATETIME DEFAULT NULL,
  reminder_1h_sent BOOLEAN DEFAULT FALSE,
  reminder_1h_sent_at DATETIME DEFAULT NULL,

  -- Admin Actions
  admin_notes TEXT DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL,
  rescheduled_from INT DEFAULT NULL,
  rescheduled_count INT DEFAULT 0,

  -- User Notes
  user_notes TEXT DEFAULT NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  FOREIGN KEY (rescheduled_from) REFERENCES appointments(id) ON DELETE SET NULL,

  -- Indexes for Performance
  INDEX idx_user_id (user_id),
  INDEX idx_admin_id (admin_id),
  INDEX idx_status (status),
  INDEX idx_requested_datetime (requested_datetime),
  INDEX idx_confirmed_datetime (confirmed_datetime),
  INDEX idx_reminders (confirmation_sent, reminder_24h_sent, reminder_1h_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
