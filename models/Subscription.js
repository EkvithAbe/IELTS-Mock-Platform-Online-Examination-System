import { query } from '../lib/mysql.js';

class Subscription {
  // Create a new subscription
  static async create(subscriptionData) {
    const {
      user_id,
      test_type,
      test_module,
      price,
      status = 'pending',
      payment_status = 'pending',
      payment_method = null,
      payment_slip = null,
      transaction_id = null,
      start_date = null,
      expiry_date = null,
      tests_allowed = 1,
      tests_used = 0,
      notes = null
    } = subscriptionData;
    
    if (!user_id || !test_type || !test_module || !price) {
      throw new Error('Please provide all required fields');
    }
    
    const result = await query(
      `INSERT INTO subscriptions (user_id, test_type, test_module, price, status, payment_status,
       payment_method, payment_slip, transaction_id, start_date, expiry_date, tests_allowed,
       tests_used, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, test_type, test_module, price, status, payment_status, payment_method,
       payment_slip, transaction_id, start_date, expiry_date, tests_allowed, tests_used, notes]
    );
    
    return await this.findById(result.insertId);
  }
  
  // Find subscription by ID
  static async findById(id) {
    const subscriptions = await query('SELECT * FROM subscriptions WHERE id = ?', [id]);
    return subscriptions[0] || null;
  }
  
  // Find subscriptions by user ID
  static async findByUserId(userId) {
    return await query(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  }
  
  // Find all subscriptions
  static async findAll(filter = {}) {
    let sql = 'SELECT * FROM subscriptions WHERE 1=1';
    const params = [];
    
    if (filter.user_id) {
      sql += ' AND user_id = ?';
      params.push(filter.user_id);
    }
    
    if (filter.test_type) {
      sql += ' AND test_type = ?';
      params.push(filter.test_type);
    }
    
    if (filter.test_module) {
      sql += ' AND test_module = ?';
      params.push(filter.test_module);
    }
    
    if (filter.status) {
      sql += ' AND status = ?';
      params.push(filter.status);
    }
    
    if (filter.payment_status) {
      sql += ' AND payment_status = ?';
      params.push(filter.payment_status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    return await query(sql, params);
  }
  
  // Update subscription
  static async updateById(id, updates) {
    const allowedUpdates = ['test_type', 'test_module', 'price', 'status', 'payment_status',
                           'payment_method', 'payment_slip', 'transaction_id', 'start_date',
                           'expiry_date', 'tests_allowed', 'tests_used', 'notes', 'modules_attempted',
                           'speaking_completed', 'speaking_completed_at'];
    const setClause = [];
    const params = [];

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        if (key === 'modules_attempted' && typeof updates[key] === 'object') {
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

    await query(`UPDATE subscriptions SET ${setClause.join(', ')} WHERE id = ?`, params);

    return await this.findById(id);
  }
  
  // Delete subscription
  static async deleteById(id) {
    await query('DELETE FROM subscriptions WHERE id = ?', [id]);
  }
  
  // Check if subscription is valid for NEW attempts
  static isValid(subscription) {
    if (subscription.status !== 'active') return false;
    if (subscription.expiry_date && new Date() > new Date(subscription.expiry_date)) return false;
    if (subscription.tests_allowed && subscription.tests_used >= subscription.tests_allowed) return false;
    return true;
  }

  // Check if subscription allows viewing results (more permissive than isValid)
  // Even expired/completed subscriptions should allow viewing results
  static canViewResults(subscription) {
    // Can view results if subscription was ever active, regardless of current status
    if (subscription.status === 'cancelled') return false;
    if (subscription.status === 'pending') return false;
    // Allow viewing for 'active' and 'expired' subscriptions
    return true;
  }
  
  // Mark a specific module type as attempted (for full packages)
  static async markModuleAttempted(id, moduleType) {
    const subscription = await this.findById(id);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Parse existing modules_attempted or create new object
    let modulesAttempted = {};
    try {
      modulesAttempted = subscription.modules_attempted
        ? JSON.parse(subscription.modules_attempted)
        : {};
    } catch (e) {
      modulesAttempted = {};
    }

    // Mark this module as attempted
    modulesAttempted[moduleType] = true;

    // Count how many modules have been attempted
    const attemptedCount = Object.values(modulesAttempted).filter(v => v === true).length;

    // Update tests_used and status
    const newTestsUsed = attemptedCount;
    const newStatus = newTestsUsed >= subscription.tests_allowed ? 'expired' : subscription.status;

    await query(
      'UPDATE subscriptions SET tests_used = ?, status = ?, modules_attempted = ? WHERE id = ?',
      [newTestsUsed, newStatus, JSON.stringify(modulesAttempted), id]
    );

    return await this.findById(id);
  }

  // Check if a specific module has been attempted (for full packages)
  static hasModuleBeenAttempted(subscription, moduleType) {
    if (!subscription.modules_attempted) {
      return false;
    }

    try {
      const modulesAttempted = typeof subscription.modules_attempted === 'string'
        ? JSON.parse(subscription.modules_attempted)
        : subscription.modules_attempted;
      return modulesAttempted[moduleType] === true;
    } catch (e) {
      return false;
    }
  }

  // Use a test from subscription (legacy method - kept for backwards compatibility)
  static async useTest(id) {
    const subscription = await this.findById(id);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (!this.isValid(subscription)) {
      throw new Error('Subscription is not valid');
    }

    const newTestsUsed = subscription.tests_used + 1;
    const newStatus = newTestsUsed >= subscription.tests_allowed ? 'expired' : subscription.status;

    await query(
      'UPDATE subscriptions SET tests_used = ?, status = ? WHERE id = ?',
      [newTestsUsed, newStatus, id]
    );

    return await this.findById(id);
  }
  
  // Get active subscription for user and module
  static async getActiveSubscription(userId, testType, testModule) {
    const subscriptions = await query(
      `SELECT * FROM subscriptions 
       WHERE user_id = ? AND test_type = ? AND test_module = ? AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [userId, testType, testModule]
    );
    
    if (subscriptions.length > 0) {
      const subscription = subscriptions[0];
      if (this.isValid(subscription)) {
        return subscription;
      }
    }
    
    return null;
  }
  
  // Count subscriptions
  static async count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM subscriptions WHERE 1=1';
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

  // Mark speaking as completed
  static async markSpeakingCompleted(id) {
    await query(
      `UPDATE subscriptions
       SET speaking_completed = TRUE, speaking_completed_at = NOW()
       WHERE id = ?`,
      [id]
    );
    return await this.findById(id);
  }

  // Check if a module can be attempted based on business rules
  // Rules:
  // 1. Listening/Reading/Writing can be attempted ONCE before speaking is completed
  // 2. Speaking requires booking appointment
  // 3. After speaking is completed, all modules can be attempted unlimited times
  static canAttemptModule(subscription, moduleType) {
    if (!subscription || subscription.status !== 'active') {
      return { allowed: false, reason: 'No active subscription' };
    }

    // Parse modules_attempted
    let modulesAttempted = {};
    try {
      modulesAttempted = subscription.modules_attempted
        ? (typeof subscription.modules_attempted === 'string'
            ? JSON.parse(subscription.modules_attempted)
            : subscription.modules_attempted)
        : {};
    } catch (e) {
      modulesAttempted = {};
    }

    const speakingCompleted = subscription.speaking_completed === 1 || subscription.speaking_completed === true;

    // If speaking is completed, allow unlimited retakes
    if (speakingCompleted) {
      return { allowed: true, reason: 'Unlimited retakes after speaking completed', isRetake: true };
    }

    // If speaking not completed yet:
    if (moduleType === 'speaking') {
      // Speaking requires booking appointment
      return { allowed: false, reason: 'Book appointment for speaking test', requiresBooking: true };
    }

    // For L/R/W, check if already attempted
    if (modulesAttempted[moduleType]) {
      return {
        allowed: false,
        reason: 'Complete speaking test first to unlock retakes',
        needsSpeaking: true
      };
    }

    // First attempt for L/R/W is allowed
    return { allowed: true, reason: 'First attempt allowed', isFirstAttempt: true };
  }
}

export default Subscription;
