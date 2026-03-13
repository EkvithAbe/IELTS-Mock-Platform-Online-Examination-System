import { query } from '../lib/mysql.js';

class Booking {
  // Create a new booking
  static async create(bookingData) {
    const {
      user_id,
      test_id,
      amount,
      payment_status = 'pending',
      payment_slip = null,
      payment_method = 'bank_transfer',
      test_status = 'locked',
      test_started_at = null,
      test_completed_at = null,
      answers = {},
      notes = null
    } = bookingData;
    
    if (!user_id || !test_id || !amount) {
      throw new Error('Please provide all required fields');
    }
    
    const result = await query(
      `INSERT INTO bookings (user_id, test_id, payment_status, payment_slip, payment_method,
       amount, test_status, test_started_at, test_completed_at, answers, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, test_id, payment_status, payment_slip, payment_method, amount, test_status,
       test_started_at, test_completed_at, JSON.stringify(answers), notes]
    );
    
    return await this.findById(result.insertId);
  }
  
  // Find booking by ID
  static async findById(id) {
    const bookings = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length > 0) {
      bookings[0].answers = bookings[0].answers ? JSON.parse(bookings[0].answers) : {};
      return bookings[0];
    }
    return null;
  }
  
  // Find bookings by user ID
  static async findByUserId(userId) {
    const bookings = await query(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return bookings.map(booking => ({
      ...booking,
      answers: booking.answers ? JSON.parse(booking.answers) : {}
    }));
  }
  
  // Find all bookings
  static async findAll(filter = {}) {
    let sql = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];
    
    if (filter.user_id) {
      sql += ' AND user_id = ?';
      params.push(filter.user_id);
    }
    
    if (filter.test_id) {
      sql += ' AND test_id = ?';
      params.push(filter.test_id);
    }
    
    if (filter.payment_status) {
      sql += ' AND payment_status = ?';
      params.push(filter.payment_status);
    }
    
    if (filter.test_status) {
      sql += ' AND test_status = ?';
      params.push(filter.test_status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const bookings = await query(sql, params);
    return bookings.map(booking => ({
      ...booking,
      answers: booking.answers ? JSON.parse(booking.answers) : {}
    }));
  }
  
  // Update booking
  static async updateById(id, updates) {
    const allowedUpdates = ['payment_status', 'payment_slip', 'payment_method', 'amount',
                           'test_status', 'test_started_at', 'test_completed_at', 'answers', 'notes'];
    const setClause = [];
    const params = [];
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        if (key === 'answers') {
          setClause.push(`${key} = ?`);
          params.push(JSON.stringify(updates[key]));
        } else {
          setClause.push(`${key} = ?`);
          params.push(updates[key]);
        }
      }
    }
    
    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    params.push(id);
    
    await query(`UPDATE bookings SET ${setClause.join(', ')} WHERE id = ?`, params);
    
    return await this.findById(id);
  }
  
  // Delete booking
  static async deleteById(id) {
    await query('DELETE FROM bookings WHERE id = ?', [id]);
  }
  
  // Find booking by user and test
  static async findByUserAndTest(userId, testId) {
    const bookings = await query(
      'SELECT * FROM bookings WHERE user_id = ? AND test_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId, testId]
    );
    
    if (bookings.length > 0) {
      bookings[0].answers = bookings[0].answers ? JSON.parse(bookings[0].answers) : {};
      return bookings[0];
    }
    return null;
  }
  
  // Count bookings
  static async count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM bookings WHERE 1=1';
    const params = [];
    
    if (filter.payment_status) {
      sql += ' AND payment_status = ?';
      params.push(filter.payment_status);
    }
    
    if (filter.test_status) {
      sql += ' AND test_status = ?';
      params.push(filter.test_status);
    }
    
    if (filter.user_id) {
      sql += ' AND user_id = ?';
      params.push(filter.user_id);
    }
    
    const result = await query(sql, params);
    return result[0].count;
  }
}

export default Booking;
