import { query } from '../lib/mysql.js';

class Test {
  // Create a new test
  static async create(testData) {
    const {
      title,
      description,
      type,
      price = 0,
      duration_listening = 30,
      duration_reading = 60,
      duration_writing = 60,
      duration_speaking = 15,
      is_active = true,
      sections = {}
    } = testData;
    
    if (!title || !description || !type) {
      throw new Error('Please provide all required fields');
    }
    
    const result = await query(
      `INSERT INTO tests (title, description, type, price, duration_listening, duration_reading, 
       duration_writing, duration_speaking, is_active, sections) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, type, price, duration_listening, duration_reading,
       duration_writing, duration_speaking, is_active, JSON.stringify(sections)]
    );
    
    return await this.findById(result.insertId);
  }
  
  // Find test by ID
  static async findById(id) {
    const tests = await query('SELECT * FROM tests WHERE id = ?', [id]);
    if (tests.length > 0) {
      tests[0].sections = tests[0].sections ? JSON.parse(tests[0].sections) : {};
      return tests[0];
    }
    return null;
  }
  
  // Find all tests
  static async findAll(filter = {}) {
    let sql = 'SELECT * FROM tests WHERE 1=1';
    const params = [];
    
    if (filter.type) {
      sql += ' AND type = ?';
      params.push(filter.type);
    }
    
    if (filter.is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filter.is_active);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const tests = await query(sql, params);
    return tests.map(test => ({
      ...test,
      sections: test.sections ? JSON.parse(test.sections) : {}
    }));
  }
  
  // Update test
  static async updateById(id, updates) {
    const allowedUpdates = ['title', 'description', 'type', 'price', 'duration_listening',
                           'duration_reading', 'duration_writing', 'duration_speaking',
                           'is_active', 'sections'];
    const setClause = [];
    const params = [];
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        if (key === 'sections') {
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
    
    await query(`UPDATE tests SET ${setClause.join(', ')} WHERE id = ?`, params);
    
    return await this.findById(id);
  }
  
  // Delete test
  static async deleteById(id) {
    await query('DELETE FROM tests WHERE id = ?', [id]);
  }
  
  // Count tests
  static async count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM tests WHERE 1=1';
    const params = [];
    
    if (filter.type) {
      sql += ' AND type = ?';
      params.push(filter.type);
    }
    
    if (filter.is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filter.is_active);
    }
    
    const result = await query(sql, params);
    return result[0].count;
  }
}

export default Test;
