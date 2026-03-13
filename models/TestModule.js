import { query } from '../lib/mysql.js';

class TestModule {
  // Helper to parse JSON fields
  static parseModule(module) {
    if (!module) return null;
    return {
      ...module,
      content: module.content ? JSON.parse(module.content) : {},
      questions: module.questions ? JSON.parse(module.questions) : [],
      tags: module.tags ? JSON.parse(module.tags) : []
    };
  }
  
  // Calculate totals from questions
  static calculateTotals(questions) {
    const totalQuestions = questions.length;
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    return { totalQuestions, totalMarks };
  }
  
  // Create a new test module
  static async create(moduleData) {
    const {
      title,
      description,
      test_type,
      module_type,
      price = 0,
      duration,
      difficulty = 'intermediate',
      is_active = true,
      is_premium = true,
      thumbnail = null,
      content = {},
      questions = [],
      passing_marks = 0,
      instructions = null,
      tags = [],
      attempts = 0
    } = moduleData;
    
    if (!title || !description || !test_type || !module_type || !duration) {
      throw new Error('Please provide all required fields');
    }
    
    const { totalQuestions, totalMarks } = this.calculateTotals(questions);
    
    const result = await query(
      `INSERT INTO test_modules (title, description, test_type, module_type, price, duration,
       difficulty, is_active, is_premium, thumbnail, content, questions, total_questions,
       total_marks, passing_marks, instructions, tags, attempts)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, test_type, module_type, price, duration, difficulty, is_active,
       is_premium, thumbnail, JSON.stringify(content), JSON.stringify(questions),
       totalQuestions, totalMarks, passing_marks, instructions, JSON.stringify(tags), attempts]
    );
    
    return await this.findById(result.insertId);
  }
  
  // Find test module by ID
  static async findById(id) {
    const modules = await query('SELECT * FROM test_modules WHERE id = ?', [id]);
    return modules.length > 0 ? this.parseModule(modules[0]) : null;
  }
  
  // Find all test modules
  static async findAll(filter = {}) {
    let sql = 'SELECT * FROM test_modules WHERE 1=1';
    const params = [];
    
    if (filter.test_type) {
      sql += ' AND test_type = ?';
      params.push(filter.test_type);
    }
    
    if (filter.module_type) {
      sql += ' AND module_type = ?';
      params.push(filter.module_type);
    }
    
    if (filter.is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filter.is_active);
    }
    
    if (filter.is_premium !== undefined) {
      sql += ' AND is_premium = ?';
      params.push(filter.is_premium);
    }
    
    if (filter.difficulty) {
      sql += ' AND difficulty = ?';
      params.push(filter.difficulty);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const modules = await query(sql, params);
    return modules.map(module => this.parseModule(module));
  }
  
  // Update test module
  static async updateById(id, updates) {
    const allowedUpdates = ['title', 'description', 'test_type', 'module_type', 'price',
                           'duration', 'difficulty', 'is_active', 'is_premium', 'thumbnail',
                           'content', 'questions', 'passing_marks', 'instructions', 'tags', 'attempts'];
    const setClause = [];
    const params = [];
    
    // Handle questions update with recalculation
    if (updates.questions) {
      const { totalQuestions, totalMarks } = this.calculateTotals(updates.questions);
      updates.total_questions = totalQuestions;
      updates.total_marks = totalMarks;
    }
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        if (['content', 'questions', 'tags'].includes(key)) {
          setClause.push(`${key} = ?`);
          params.push(JSON.stringify(updates[key]));
        } else {
          setClause.push(`${key} = ?`);
          params.push(updates[key]);
        }
      }
    }
    
    // Add calculated totals
    if (updates.total_questions !== undefined) {
      setClause.push('total_questions = ?');
      params.push(updates.total_questions);
    }
    if (updates.total_marks !== undefined) {
      setClause.push('total_marks = ?');
      params.push(updates.total_marks);
    }
    
    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    params.push(id);
    
    await query(`UPDATE test_modules SET ${setClause.join(', ')} WHERE id = ?`, params);
    
    return await this.findById(id);
  }
  
  // Delete test module
  static async deleteById(id) {
    await query('DELETE FROM test_modules WHERE id = ?', [id]);
  }
  
  // Increment attempts counter
  static async incrementAttempts(id) {
    await query('UPDATE test_modules SET attempts = attempts + 1 WHERE id = ?', [id]);
  }
  
  // Count test modules
  static async count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM test_modules WHERE 1=1';
    const params = [];
    
    if (filter.test_type) {
      sql += ' AND test_type = ?';
      params.push(filter.test_type);
    }
    
    if (filter.module_type) {
      sql += ' AND module_type = ?';
      params.push(filter.module_type);
    }
    
    if (filter.is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filter.is_active);
    }
    
    const result = await query(sql, params);
    return result[0].count;
  }
}

export default TestModule;
