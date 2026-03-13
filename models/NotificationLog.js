import { query } from '../lib/mysql.js';

class NotificationLog {
  // Create a new notification log
  static async create(logData) {
    const {
      appointment_id,
      user_id,
      notification_type,
      channel,
      recipient,
      subject = null,
      message_body,
      status = 'pending',
      scheduled_for = null
    } = logData;

    if (!appointment_id || !user_id || !notification_type || !channel || !recipient || !message_body) {
      throw new Error('Please provide all required fields');
    }

    const result = await query(
      `INSERT INTO notification_logs (appointment_id, user_id, notification_type, channel,
       recipient, subject, message_body, status, scheduled_for)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [appointment_id, user_id, notification_type, channel, recipient, subject,
       message_body, status, scheduled_for]
    );

    return await this.findById(result.insertId);
  }

  // Find notification log by ID
  static async findById(id) {
    const logs = await query('SELECT * FROM notification_logs WHERE id = ?', [id]);
    return logs[0] || null;
  }

  // Find logs by appointment ID
  static async findByAppointmentId(appointmentId) {
    return await query(
      'SELECT * FROM notification_logs WHERE appointment_id = ? ORDER BY created_at DESC',
      [appointmentId]
    );
  }

  // Find logs by user ID
  static async findByUserId(userId, filter = {}) {
    let sql = 'SELECT * FROM notification_logs WHERE user_id = ?';
    const params = [userId];

    if (filter.status) {
      sql += ' AND status = ?';
      params.push(filter.status);
    }

    if (filter.notification_type) {
      sql += ' AND notification_type = ?';
      params.push(filter.notification_type);
    }

    sql += ' ORDER BY created_at DESC';

    return await query(sql, params);
  }

  // Mark as sent
  static async markSent(id, externalMessageId = null) {
    const updates = {
      status: 'sent',
      sent_at: new Date()
    };

    if (externalMessageId) {
      updates.external_message_id = externalMessageId;
    }

    await query(
      'UPDATE notification_logs SET status = ?, sent_at = ?, external_message_id = ? WHERE id = ?',
      [updates.status, updates.sent_at, updates.external_message_id, id]
    );

    return await this.findById(id);
  }

  // Mark as failed
  static async markFailed(id, errorMessage) {
    await query(
      'UPDATE notification_logs SET status = ?, error_message = ? WHERE id = ?',
      ['failed', errorMessage, id]
    );

    return await this.findById(id);
  }

  // Mark as delivered
  static async markDelivered(id) {
    await query(
      'UPDATE notification_logs SET status = ?, delivered_at = ? WHERE id = ?',
      ['delivered', new Date(), id]
    );

    return await this.findById(id);
  }

  // Get pending notifications
  static async getPendingNotifications() {
    return await query(
      `SELECT * FROM notification_logs
       WHERE status = 'pending'
       AND (scheduled_for IS NULL OR scheduled_for <= NOW())
       ORDER BY created_at ASC
       LIMIT 100`
    );
  }

  // Increment retry count
  static async incrementRetry(id) {
    await query(
      'UPDATE notification_logs SET retry_count = retry_count + 1 WHERE id = ?',
      [id]
    );

    return await this.findById(id);
  }

  // Update provider response
  static async updateProviderResponse(id, response) {
    await query(
      'UPDATE notification_logs SET provider_response = ? WHERE id = ?',
      [JSON.stringify(response), id]
    );

    return await this.findById(id);
  }

  // Get notification statistics
  static async getStats(filter = {}) {
    let sql = 'SELECT COUNT(*) as count, status FROM notification_logs';
    const params = [];
    const whereConditions = [];

    if (filter.appointment_id) {
      whereConditions.push('appointment_id = ?');
      params.push(filter.appointment_id);
    }

    if (filter.from_date) {
      whereConditions.push('created_at >= ?');
      params.push(filter.from_date);
    }

    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }

    sql += ' GROUP BY status';

    const results = await query(sql, params);

    const stats = {
      pending: 0,
      sent: 0,
      failed: 0,
      delivered: 0,
      total: 0
    };

    results.forEach(row => {
      stats[row.status] = row.count;
      stats.total += row.count;
    });

    return stats;
  }

  // Delete old logs (cleanup)
  static async deleteOlderThan(days = 90) {
    const result = await query(
      'DELETE FROM notification_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [days]
    );

    return result.affectedRows;
  }
}

export default NotificationLog;
