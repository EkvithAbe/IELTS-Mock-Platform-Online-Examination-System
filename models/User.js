import { query } from '../lib/mysql.js';
import bcrypt from 'bcryptjs';

class User {
  // Create a new user
  static async create(userData) {
    const { name, email, phone, password, role = 'student' } = userData;
    
    // Validate required fields
    if (!name || !email || !phone || !password) {
      throw new Error('Please provide all required fields');
    }
    
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please provide a valid email');
    }
    
    // Validate password length
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await query(
      `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
      [name, email.toLowerCase().trim(), phone.trim(), hashedPassword, role]
    );
    
    return { id: result.insertId, name, email, phone, role };
  }
  
  // Find user by ID
  static async findById(id) {
    const users = await query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
  }
  
  // Find user by email
  static async findByEmail(email) {
    const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    return users[0] || null;
  }
  
  // Find user by email with password
  static async findByEmailWithPassword(email) {
    const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    return users[0] || null;
  }
  
  // Find all users
  static async findAll(filter = {}) {
    let sql = 'SELECT id, name, email, phone, role, is_active, created_at, updated_at FROM users WHERE 1=1';
    const params = [];
    
    if (filter.role) {
      sql += ' AND role = ?';
      params.push(filter.role);
    }
    
    if (filter.is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filter.is_active);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    return await query(sql, params);
  }
  
  // Update user
  static async updateById(id, updates) {
    const allowedUpdates = ['name', 'email', 'phone', 'role', 'is_active', 'reset_password_token', 'reset_password_expire'];
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
      `UPDATE users SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );
    
    return await this.findById(id);
  }
  
  // Update password
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  }
  
  // Delete user
  static async deleteById(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
  }
  
  // Compare password
  static async comparePassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
  
  // Check if email exists
  static async emailExists(email) {
    const users = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    return users.length > 0;
  }
}

export default User;
