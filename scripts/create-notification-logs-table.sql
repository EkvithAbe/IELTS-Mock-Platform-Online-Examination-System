-- Notification Logs Table
-- Tracks all notifications sent for appointments (email, SMS, WhatsApp)

CREATE TABLE IF NOT EXISTS notification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Relationships
  appointment_id INT NOT NULL,
  user_id INT NOT NULL,

  -- Notification Details
  notification_type ENUM('confirmation', 'reminder_24h', 'reminder_1h', 'cancellation', 'rescheduled', 'rejected') NOT NULL,
  channel ENUM('email', 'sms', 'whatsapp') NOT NULL,

  -- Status
  status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',

  -- Contact Details
  recipient VARCHAR(255) NOT NULL,

  -- Message Details
  subject VARCHAR(500) DEFAULT NULL,
  message_body TEXT NOT NULL,

  -- External Service IDs (from Twilio, SendGrid, etc.)
  external_message_id VARCHAR(255) DEFAULT NULL,
  provider_response JSON DEFAULT NULL,

  -- Error Handling
  error_message TEXT DEFAULT NULL,
  retry_count INT DEFAULT 0,

  -- Timestamps
  scheduled_for DATETIME DEFAULT NULL,
  sent_at DATETIME DEFAULT NULL,
  delivered_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Indexes for Performance
  INDEX idx_appointment_id (appointment_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_for, status),
  INDEX idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
