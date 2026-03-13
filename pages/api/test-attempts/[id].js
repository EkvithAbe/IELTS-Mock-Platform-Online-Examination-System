import connectDB, { query } from '../../../lib/mysql';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { id } = req.query;

    // Try to find in the main attempts table first (new system)
    let attempts = await query(
      `SELECT a.*, tm.title, tm.module_type, tm.test_type, tm.questions as module_questions,
              u.name as user_name, u.email as user_email
       FROM attempts a
       LEFT JOIN test_modules tm ON a.test_module_id = tm.id
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ? AND a.user_id = ?
       LIMIT 1`,
      [id, req.user.userId]
    );

    // Fallback to test_attempts table (old system) if not found
    if (attempts.length === 0) {
      attempts = await query(
        `SELECT ta.*, u.name as user_name, u.email as user_email
         FROM test_attempts ta
         LEFT JOIN users u ON ta.user_id = u.id
         WHERE ta.id = ? AND ta.user_id = ?
         LIMIT 1`,
        [id, req.user.userId]
      );
    }

    if (attempts.length === 0) {
      return res.status(404).json({ message: 'Test attempt not found' });
    }

    const attempt = attempts[0];

    // Parse JSON fields
    if (typeof attempt.answers === 'string') {
      attempt.answers = JSON.parse(attempt.answers || '{}');
    }
    if (typeof attempt.feedback === 'string') {
      try {
        attempt.gradingDetails = JSON.parse(attempt.feedback || '[]');
      } catch {
        attempt.gradingDetails = [];
      }
    }
    if (typeof attempt.module_questions === 'string') {
      attempt.questions = JSON.parse(attempt.module_questions || '[]');
    }

    // Map fields for consistent response
    const response = {
      ...attempt,
      test_module: attempt.module_type || attempt.test_module,
      testModule: attempt.module_type || attempt.test_module,
      test_type: attempt.test_type,
      testType: attempt.test_type,
      score: attempt.score_obtained || attempt.score || 0,
      total_questions: attempt.score_total || attempt.total_questions || 0,
      totalQuestions: attempt.score_total || attempt.total_questions || 0,
      score_percentage: attempt.score_percentage || 0,
      score_grade: attempt.score_grade || null,
      is_graded: attempt.is_graded || false,
      time_spent: attempt.duration ? attempt.duration * 60 : (attempt.time_spent || 0),
      completed_at: attempt.completed_at,
      completedAt: attempt.completed_at,
    };

    res.status(200).json({
      success: true,
      attempt: response
    });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}

export default requireAuth(handler);
