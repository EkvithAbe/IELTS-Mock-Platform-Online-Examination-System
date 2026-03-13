import { query } from '../lib/mysql.js';

class Result {
  // Calculate overall score
  static calculateOverallScore(listeningScore, readingScore, writingScore, speakingScore) {
    const validScores = [listeningScore, readingScore, writingScore, speakingScore]
      .filter(score => score !== undefined && score !== null);
    
    if (validScores.length > 0) {
      const sum = validScores.reduce((acc, score) => acc + score, 0);
      return Math.round((sum / validScores.length) * 10) / 10;
    }
    
    return null;
  }
  
  // Create a new result
  static async create(resultData) {
    const {
      booking_id,
      user_id,
      test_id,
      listening_score = null,
      listening_details = null,
      reading_score = null,
      reading_details = null,
      writing_score = null,
      writing_details = null,
      speaking_score = null,
      speaking_details = null,
      feedback = null,
      result_file = null,
      email_sent = false,
      email_sent_at = null
    } = resultData;
    
    if (!booking_id || !user_id || !test_id) {
      throw new Error('Please provide all required fields');
    }
    
    // Calculate overall score
    const overall_score = this.calculateOverallScore(
      listening_score, reading_score, writing_score, speaking_score
    );
    
    const result = await query(
      `INSERT INTO results (booking_id, user_id, test_id, listening_score, listening_details,
       reading_score, reading_details, writing_score, writing_details, speaking_score,
       speaking_details, overall_score, feedback, result_file, email_sent, email_sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [booking_id, user_id, test_id, listening_score, listening_details, reading_score,
       reading_details, writing_score, writing_details, speaking_score, speaking_details,
       overall_score, feedback, result_file, email_sent, email_sent_at]
    );
    
    return await this.findById(result.insertId);
  }
  
  // Find result by ID
  static async findById(id) {
    const results = await query('SELECT * FROM results WHERE id = ?', [id]);
    return results[0] || null;
  }
  
  // Find result by booking ID
  static async findByBookingId(bookingId) {
    const results = await query('SELECT * FROM results WHERE booking_id = ?', [bookingId]);
    return results[0] || null;
  }
  
  // Find results by user ID
  static async findByUserId(userId) {
    return await query(
      'SELECT * FROM results WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  }
  
  // Find all results
  static async findAll(filter = {}) {
    let sql = 'SELECT * FROM results WHERE 1=1';
    const params = [];
    
    if (filter.user_id) {
      sql += ' AND user_id = ?';
      params.push(filter.user_id);
    }
    
    if (filter.test_id) {
      sql += ' AND test_id = ?';
      params.push(filter.test_id);
    }
    
    if (filter.email_sent !== undefined) {
      sql += ' AND email_sent = ?';
      params.push(filter.email_sent);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    return await query(sql, params);
  }
  
  // Update result
  static async updateById(id, updates) {
    const allowedUpdates = ['listening_score', 'listening_details', 'reading_score', 'reading_details',
                           'writing_score', 'writing_details', 'speaking_score', 'speaking_details',
                           'feedback', 'result_file', 'email_sent', 'email_sent_at'];
    const setClause = [];
    const params = [];
    
    // Check if any score is being updated
    const scoresUpdated = ['listening_score', 'reading_score', 'writing_score', 'speaking_score']
      .some(key => updates[key] !== undefined);
    
    // If scores are updated, recalculate overall
    if (scoresUpdated) {
      const currentResult = await this.findById(id);
      const newListening = updates.listening_score !== undefined ? updates.listening_score : currentResult.listening_score;
      const newReading = updates.reading_score !== undefined ? updates.reading_score : currentResult.reading_score;
      const newWriting = updates.writing_score !== undefined ? updates.writing_score : currentResult.writing_score;
      const newSpeaking = updates.speaking_score !== undefined ? updates.speaking_score : currentResult.speaking_score;
      
      updates.overall_score = this.calculateOverallScore(newListening, newReading, newWriting, newSpeaking);
    }
    
    for (const key of [...allowedUpdates, 'overall_score']) {
      if (updates[key] !== undefined) {
        setClause.push(`${key} = ?`);
        params.push(updates[key]);
      }
    }
    
    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    params.push(id);
    
    await query(`UPDATE results SET ${setClause.join(', ')} WHERE id = ?`, params);
    
    return await this.findById(id);
  }
  
  // Delete result
  static async deleteById(id) {
    await query('DELETE FROM results WHERE id = ?', [id]);
  }
  
  // Mark email as sent
  static async markEmailSent(id) {
    await query(
      'UPDATE results SET email_sent = TRUE, email_sent_at = ? WHERE id = ?',
      [new Date(), id]
    );
    
    return await this.findById(id);
  }
  
  // Count results
  static async count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM results WHERE 1=1';
    const params = [];
    
    if (filter.user_id) {
      sql += ' AND user_id = ?';
      params.push(filter.user_id);
    }
    
    if (filter.email_sent !== undefined) {
      sql += ' AND email_sent = ?';
      params.push(filter.email_sent);
    }
    
    const result = await query(sql, params);
    return result[0].count;
  }
}

export default Result;
