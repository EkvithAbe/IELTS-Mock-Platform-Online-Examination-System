import { query } from '../lib/mysql.js';

class GoogleOAuthToken {
  // Create or update token for admin
  static async create(tokenData) {
    const {
      admin_id,
      access_token,
      refresh_token,
      token_type = 'Bearer',
      expiry_date,
      scope,
      calendar_id = 'primary'
    } = tokenData;

    if (!admin_id || !access_token || !refresh_token || !expiry_date || !scope) {
      throw new Error('Please provide all required fields');
    }

    // Check if token already exists for this admin
    const existing = await this.findByAdminId(admin_id);

    if (existing) {
      // Update existing token
      return await this.updateTokens(admin_id, tokenData);
    }

    // Create new token
    const result = await query(
      `INSERT INTO google_oauth_tokens (admin_id, access_token, refresh_token,
       token_type, expiry_date, scope, calendar_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [admin_id, access_token, refresh_token, token_type, expiry_date, scope, calendar_id]
    );

    return await this.findById(result.insertId);
  }

  // Find token by ID
  static async findById(id) {
    const tokens = await query('SELECT * FROM google_oauth_tokens WHERE id = ?', [id]);
    return tokens[0] || null;
  }

  // Find token by admin ID
  static async findByAdminId(adminId) {
    const tokens = await query(
      'SELECT * FROM google_oauth_tokens WHERE admin_id = ?',
      [adminId]
    );
    return tokens[0] || null;
  }

  // Update tokens
  static async updateTokens(adminId, tokenData) {
    const {
      access_token,
      refresh_token,
      token_type,
      expiry_date,
      scope,
      calendar_id
    } = tokenData;

    const updates = [];
    const params = [];

    if (access_token) {
      updates.push('access_token = ?');
      params.push(access_token);
    }

    if (refresh_token) {
      updates.push('refresh_token = ?');
      params.push(refresh_token);
    }

    if (token_type) {
      updates.push('token_type = ?');
      params.push(token_type);
    }

    if (expiry_date) {
      updates.push('expiry_date = ?');
      params.push(expiry_date);
    }

    if (scope) {
      updates.push('scope = ?');
      params.push(scope);
    }

    if (calendar_id) {
      updates.push('calendar_id = ?');
      params.push(calendar_id);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(adminId);

    await query(
      `UPDATE google_oauth_tokens SET ${updates.join(', ')} WHERE admin_id = ?`,
      params
    );

    return await this.findByAdminId(adminId);
  }

  // Delete token by admin ID
  static async deleteByAdminId(adminId) {
    await query('DELETE FROM google_oauth_tokens WHERE admin_id = ?', [adminId]);
  }

  // Check if token is expired
  static isTokenExpired(token) {
    if (!token || !token.expiry_date) {
      return true;
    }

    const now = Date.now();
    return now >= token.expiry_date;
  }

  // Check if token will expire soon (within 5 minutes)
  static isTokenExpiringSoon(token) {
    if (!token || !token.expiry_date) {
      return true;
    }

    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return token.expiry_date <= fiveMinutesFromNow;
  }

  // Get valid token (returns null if expired and needs refresh)
  static async getValidToken(adminId) {
    const token = await this.findByAdminId(adminId);

    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      return null; // Caller should refresh token
    }

    return token;
  }

  // Get all tokens (for cleanup/admin purposes)
  static async findAll() {
    return await query(
      `SELECT t.*, u.name as admin_name, u.email as admin_email
       FROM google_oauth_tokens t
       LEFT JOIN users u ON t.admin_id = u.id
       ORDER BY t.created_at DESC`
    );
  }

  // Count active tokens
  static async count() {
    const result = await query('SELECT COUNT(*) as count FROM google_oauth_tokens');
    return result[0].count;
  }
}

export default GoogleOAuthToken;
