import connectDB from '../../../lib/mysql';
import Attempt from '../../../models/Attempt';
import TestModule from '../../../models/TestModule';
import Subscription from '../../../models/Subscription';
import { requireAuth } from '../../../lib/auth';
import { query } from '../../../lib/mysql';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Fetch all finished attempts for the user
    const attempts = await query(
      `SELECT a.*, tm.title, tm.module_type, tm.test_type, tm.duration
       FROM attempts a
       LEFT JOIN test_modules tm ON a.test_module_id = tm.id
       WHERE a.user_id = ? AND a.status = 'finished'
       ORDER BY a.completed_at DESC`,
      [req.user.userId]
    );

    // Parse JSON fields
    const parsedAttempts = attempts.map(attempt => ({
      ...attempt,
      answers: attempt.answers ? JSON.parse(attempt.answers) : {},
      flagged_questions: attempt.flagged_questions ? JSON.parse(attempt.flagged_questions) : [],
    }));

    // Calculate statistics by module type
    const statsByModule = {};
    const moduleTypes = ['listening', 'reading', 'writing', 'speaking'];

    moduleTypes.forEach(type => {
      const moduleAttempts = parsedAttempts.filter(a => a.module_type === type);

      if (moduleAttempts.length > 0) {
        const scores = moduleAttempts
          .filter(a => a.score_percentage !== null)
          .map(a => a.score_percentage);

        statsByModule[type] = {
          totalAttempts: moduleAttempts.length,
          averageScore: scores.length > 0
            ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
            : null,
          bestScore: scores.length > 0 ? Math.max(...scores).toFixed(1) : null,
          latestScore: moduleAttempts[0].score_percentage
            ? moduleAttempts[0].score_percentage.toFixed(1)
            : null,
          latestAttempt: moduleAttempts[0],
        };
      }
    });

    // Calculate overall statistics
    const allScores = parsedAttempts
      .filter(a => a.score_percentage !== null)
      .map(a => a.score_percentage);

    const overallStats = {
      totalAttempts: parsedAttempts.length,
      totalTimeSpent: parsedAttempts.reduce((sum, a) => sum + (a.duration || 0), 0),
      averageScore: allScores.length > 0
        ? (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1)
        : null,
      bestScore: allScores.length > 0 ? Math.max(...allScores).toFixed(1) : null,
      gradedAttempts: parsedAttempts.filter(a => a.is_graded).length,
      pendingGrading: parsedAttempts.filter(a => !a.is_graded).length,
    };

    // Get active subscriptions
    const activeSubscriptions = await Subscription.findByUserId(req.user.userId);
    const activeCount = activeSubscriptions.filter(s => s.status === 'active').length;

    res.status(200).json({
      success: true,
      attempts: parsedAttempts,
      statsByModule,
      overallStats,
      activeSubscriptions: activeCount,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
