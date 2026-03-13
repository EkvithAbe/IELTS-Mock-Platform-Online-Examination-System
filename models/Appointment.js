import { query } from '../lib/mysql.js';

class Appointment {
  // Create a new appointment
  static async create(appointmentData) {
    const {
      user_id,
      requested_datetime,
      timezone = 'UTC',
      duration = 15,
      phone = null,
      whatsapp = null,
      preferred_contact_method = 'email',
      user_notes = null,
      subscription_id = null
    } = appointmentData;

    if (!user_id || !requested_datetime) {
      throw new Error('Please provide user_id and requested_datetime');
    }

    const result = await query(
      `INSERT INTO appointments (user_id, requested_datetime, timezone, duration, phone,
       whatsapp, preferred_contact_method, user_notes, subscription_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [user_id, requested_datetime, timezone, duration, phone, whatsapp,
       preferred_contact_method, user_notes, subscription_id]
    );

    return await this.findById(result.insertId);
  }

  // Find appointment by ID
  static async findById(id) {
    const appointments = await query(
      `SELECT a.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
       admin.name as admin_name
       FROM appointments a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN users admin ON a.admin_id = admin.id
       WHERE a.id = ?`,
      [id]
    );
    return appointments[0] || null;
  }

  // Find appointments by user ID
  static async findByUserId(userId, filter = {}) {
    let sql = `SELECT a.*, u.name as user_name, u.email as user_email,
               admin.name as admin_name
               FROM appointments a
               LEFT JOIN users u ON a.user_id = u.id
               LEFT JOIN users admin ON a.admin_id = admin.id
               WHERE a.user_id = ?`;
    const params = [userId];

    if (filter.status) {
      sql += ' AND a.status = ?';
      params.push(filter.status);
    }

    sql += ' ORDER BY a.requested_datetime DESC';

    return await query(sql, params);
  }

  // Find all appointments with filters
  static async findAll(filter = {}) {
    let sql = `SELECT a.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
               admin.name as admin_name
               FROM appointments a
               LEFT JOIN users u ON a.user_id = u.id
               LEFT JOIN users admin ON a.admin_id = admin.id
               WHERE 1=1`;
    const params = [];

    if (filter.user_id) {
      sql += ' AND a.user_id = ?';
      params.push(filter.user_id);
    }

    if (filter.admin_id) {
      sql += ' AND a.admin_id = ?';
      params.push(filter.admin_id);
    }

    if (filter.status) {
      sql += ' AND a.status = ?';
      params.push(filter.status);
    }

    if (filter.from_date) {
      sql += ' AND a.requested_datetime >= ?';
      params.push(filter.from_date);
    }

    if (filter.to_date) {
      sql += ' AND a.requested_datetime <= ?';
      params.push(filter.to_date);
    }

    sql += ' ORDER BY a.requested_datetime DESC';

    if (filter.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filter.limit));
    }

    return await query(sql, params);
  }

  // Update appointment
  static async updateById(id, updates) {
    const allowedUpdates = [
      'admin_id', 'confirmed_datetime', 'timezone', 'duration', 'status',
      'phone', 'whatsapp', 'preferred_contact_method', 'meeting_link',
      'meeting_platform', 'meeting_notes', 'google_calendar_event_id',
      'google_meet_link', 'admin_notes', 'rejection_reason',
      'confirmation_sent', 'confirmation_sent_at', 'reminder_24h_sent',
      'reminder_24h_sent_at', 'reminder_1h_sent', 'reminder_1h_sent_at'
    ];

    const setClause = [];
    const params = [];

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        setClause.push(`${key} = ?`);
        params.push(updates[key]);
      }
    }

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(id);

    await query(
      `UPDATE appointments SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return await this.findById(id);
  }

  // Delete appointment
  static async deleteById(id) {
    await query('DELETE FROM appointments WHERE id = ?', [id]);
  }

  // Get pending appointments (for admin approval queue)
  static async getPendingApprovals() {
    return await query(
      `SELECT a.*, u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM appointments a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.status = 'pending'
       ORDER BY a.requested_datetime ASC`
    );
  }

  // Get upcoming appointments (for reminders)
  static async getUpcomingAppointments(hours = 24) {
    return await query(
      `SELECT a.*, u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM appointments a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.status = 'approved'
       AND a.confirmed_datetime IS NOT NULL
       AND a.confirmed_datetime > NOW()
       AND a.confirmed_datetime <= DATE_ADD(NOW(), INTERVAL ? HOUR)
       ORDER BY a.confirmed_datetime ASC`,
      [hours]
    );
  }

  // Mark reminder as sent
  static async markReminderSent(id, reminderType) {
    const validTypes = ['confirmation', 'reminder_24h', 'reminder_1h'];
    if (!validTypes.includes(reminderType)) {
      throw new Error('Invalid reminder type');
    }

    const updates = {};
    updates[`${reminderType}_sent`] = true;
    updates[`${reminderType}_sent_at`] = new Date();

    return await this.updateById(id, updates);
  }

  // Reschedule appointment
  static async reschedule(id, newDatetime, adminId, reason = null) {
    const appointment = await this.findById(id);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Create new appointment
    const newAppointment = await this.create({
      user_id: appointment.user_id,
      requested_datetime: newDatetime,
      timezone: appointment.timezone,
      duration: appointment.duration,
      phone: appointment.phone,
      whatsapp: appointment.whatsapp,
      preferred_contact_method: appointment.preferred_contact_method,
      subscription_id: appointment.subscription_id,
      user_notes: `Rescheduled from ${appointment.requested_datetime}${reason ? ': ' + reason : ''}`
    });

    // Update new appointment
    await this.updateById(newAppointment.id, {
      rescheduled_from: id,
      rescheduled_count: (appointment.rescheduled_count || 0) + 1,
      admin_id: adminId
    });

    // Mark old appointment as rescheduled
    await this.updateById(id, {
      status: 'rescheduled',
      admin_notes: reason
    });

    return await this.findById(newAppointment.id);
  }

  // Cancel appointment
  static async cancel(id, reason = null) {
    return await this.updateById(id, {
      status: 'cancelled',
      admin_notes: reason
    });
  }

  // Complete appointment
  static async complete(id, notes = null) {
    return await this.updateById(id, {
      status: 'completed',
      admin_notes: notes
    });
  }

  // Mark as no-show
  static async markNoShow(id) {
    return await this.updateById(id, {
      status: 'no_show'
    });
  }

  // Get appointment statistics
  static async getStats(filter = {}) {
    let sql = 'SELECT COUNT(*) as count, status FROM appointments';
    const params = [];
    const whereConditions = [];

    if (filter.admin_id) {
      whereConditions.push('admin_id = ?');
      params.push(filter.admin_id);
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
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
      total: 0
    };

    results.forEach(row => {
      stats[row.status] = row.count;
      stats.total += row.count;
    });

    return stats;
  }

  // Count appointments
  static async count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM appointments WHERE 1=1';
    const params = [];

    if (filter.status) {
      sql += ' AND status = ?';
      params.push(filter.status);
    }

    if (filter.user_id) {
      sql += ' AND user_id = ?';
      params.push(filter.user_id);
    }

    const result = await query(sql, params);
    return result[0].count;
  }
}

export default Appointment;
