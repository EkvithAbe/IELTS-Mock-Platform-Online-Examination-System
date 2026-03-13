import { query } from '../lib/mysql.js';

class Attempt {
  // Helper to parse JSON fields
  static parseAttempt(attempt) {
    if (!attempt) return null;
    return {
      ...attempt,
      answers: attempt.answers ? JSON.parse(attempt.answers) : {},
      writing_responses: attempt.writing_responses ? JSON.parse(attempt.writing_responses) : [],
      speaking_responses: attempt.speaking_responses ? JSON.parse(attempt.speaking_responses) : [],
      flagged_questions: attempt.flagged_questions ? JSON.parse(attempt.flagged_questions) : [],
      time_spent_per_question: attempt.time_spent_per_question ? JSON.parse(attempt.time_spent_per_question) : {}
    };
  }
  
  // Calculate grade based on percentage
  static calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    else if (percentage >= 80) return 'A';
    else if (percentage >= 70) return 'B';
    else if (percentage >= 60) return 'C';
    else if (percentage >= 50) return 'D';
    else return 'F';
  }
  
  // Create a new attempt
  static async create(attemptData) {
    const {
      user_id,
      test_module_id,
      subscription_id = null,
      attempt_number,
      status = 'in_progress',
      started_at = new Date(),
      answers = {},
      writing_responses = [],
      speaking_responses = [],
      flagged_questions = [],
      time_spent_per_question = {}
    } = attemptData;
    
    if (!user_id || !test_module_id || !attempt_number) {
      throw new Error('Please provide all required fields');
    }
    
    const result = await query(
      `INSERT INTO attempts (user_id, test_module_id, subscription_id, attempt_number, status,
       started_at, answers, writing_responses, speaking_responses, flagged_questions,
       time_spent_per_question)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, test_module_id, subscription_id, attempt_number, status, started_at,
       JSON.stringify(answers), JSON.stringify(writing_responses), JSON.stringify(speaking_responses),
       JSON.stringify(flagged_questions), JSON.stringify(time_spent_per_question)]
    );
    
    return await this.findById(result.insertId);
  }
  
  // Find attempt by ID
  static async findById(id) {
    const attempts = await query('SELECT * FROM attempts WHERE id = ?', [id]);
    return attempts.length > 0 ? this.parseAttempt(attempts[0]) : null;
  }
  
  // Find attempts by user ID
  static async findByUserId(userId) {
    const attempts = await query(
      'SELECT * FROM attempts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return attempts.map(attempt => this.parseAttempt(attempt));
  }
  
  // Find attempts by user and module
  static async findByUserAndModule(userId, moduleId) {
    const attempts = await query(
      'SELECT * FROM attempts WHERE user_id = ? AND test_module_id = ? ORDER BY attempt_number DESC',
      [userId, moduleId]
    );
    return attempts.map(attempt => this.parseAttempt(attempt));
  }
  
  // Find all attempts
  static async findAll(filter = {}) {
    let sql = 'SELECT * FROM attempts WHERE 1=1';
    const params = [];
    
    if (filter.user_id) {
      sql += ' AND user_id = ?';
      params.push(filter.user_id);
    }
    
    if (filter.test_module_id) {
      sql += ' AND test_module_id = ?';
      params.push(filter.test_module_id);
    }
    
    if (filter.status) {
      sql += ' AND status = ?';
      params.push(filter.status);
    }
    
    if (filter.is_graded !== undefined) {
      sql += ' AND is_graded = ?';
      params.push(filter.is_graded);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const attempts = await query(sql, params);
    return attempts.map(attempt => this.parseAttempt(attempt));
  }
  
  // Update attempt
  static async updateById(id, updates) {
    const allowedUpdates = ['status', 'completed_at', 'duration', 'answers', 'writing_responses',
                           'speaking_responses', 'score_obtained', 'score_total', 'score_percentage',
                           'score_grade', 'is_graded', 'graded_by', 'graded_at', 'feedback',
                           'flagged_questions', 'time_spent_per_question'];
    const setClause = [];
    const params = [];
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        if (['answers', 'writing_responses', 'speaking_responses', 'flagged_questions', 'time_spent_per_question'].includes(key)) {
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
    
    await query(`UPDATE attempts SET ${setClause.join(', ')} WHERE id = ?`, params);
    
    return await this.findById(id);
  }
  
  // Complete attempt
  static async complete(id, startedAt) {
    const completedAt = new Date();
    const duration = Math.round((completedAt - new Date(startedAt)) / 60000); // in minutes
    
    await query(
      'UPDATE attempts SET status = ?, completed_at = ?, duration = ? WHERE id = ?',
      ['finished', completedAt, duration, id]
    );
    
    return await this.findById(id);
  }
  
  // Calculate and update score
  static async updateScore(id, obtainedMarks, totalMarks) {
    const percentage = (obtainedMarks / totalMarks) * 100;
    const grade = this.calculateGrade(percentage);
    
    await query(
      `UPDATE attempts SET score_obtained = ?, score_total = ?, score_percentage = ?, 
       score_grade = ? WHERE id = ?`,
      [obtainedMarks, totalMarks, percentage, grade, id]
    );
    
    return await this.findById(id);
  }
  
  // Grade attempt
  static async grade(id, gradedBy, obtainedMarks, totalMarks, feedback = null) {
    const percentage = (obtainedMarks / totalMarks) * 100;
    const grade = this.calculateGrade(percentage);
    const gradedAt = new Date();
    
    await query(
      `UPDATE attempts SET score_obtained = ?, score_total = ?, score_percentage = ?,
       score_grade = ?, is_graded = TRUE, graded_by = ?, graded_at = ?, feedback = ?
       WHERE id = ?`,
      [obtainedMarks, totalMarks, percentage, grade, gradedBy, gradedAt, feedback, id]
    );
    
    return await this.findById(id);
  }
  
  // Delete attempt
  static async deleteById(id) {
    await query('DELETE FROM attempts WHERE id = ?', [id]);
  }
  
  // Get next attempt number for user and module
  static async getNextAttemptNumber(userId, moduleId) {
    const result = await query(
      'SELECT MAX(attempt_number) as max_attempt FROM attempts WHERE user_id = ? AND test_module_id = ?',
      [userId, moduleId]
    );
    
    return (result[0].max_attempt || 0) + 1;
  }
  
  // Count attempts
  static async count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM attempts WHERE 1=1';
    const params = [];
    
    if (filter.user_id) {
      sql += ' AND user_id = ?';
      params.push(filter.user_id);
    }
    
    if (filter.status) {
      sql += ' AND status = ?';
      params.push(filter.status);
    }
    
    const result = await query(sql, params);
    return result[0].count;
  }
}

export default Attempt;
