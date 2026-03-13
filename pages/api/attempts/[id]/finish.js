import connectDB from '../../../../lib/mysql';
import Attempt from '../../../../models/Attempt';
import TestModule from '../../../../models/TestModule';
import Subscription from '../../../../models/Subscription';
import { requireAuth } from '../../../../lib/auth';

function mapAttempt(attempt) {
  if (!attempt) return null;
  return {
    ...attempt,
    _id: attempt.id,
    startedAt: attempt.started_at,
    completedAt: attempt.completed_at,
    answers: attempt.answers || {},
    flaggedQuestions: attempt.flagged_questions || [],
  };
}

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { answers, flaggedQuestions } = req.body;

    const attempt = await Attempt.findById(id);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    if (attempt.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Attempt is already finished' });
    }

    const testModule = await TestModule.findById(attempt.test_module_id);
    if (!testModule) {
      return res.status(404).json({ message: 'Test module not found' });
    }

    // Auto-grade for listening/reading
    let score = null;
    let totalMarks = testModule.total_marks || testModule.totalMarks || 0;
    let isGraded = false;
    if (testModule.module_type === 'listening' || testModule.module_type === 'reading') {
      score = 0;
      (testModule.questions || []).forEach((q) => {
        const userAnswer = answers?.[q.questionNumber] ?? answers?.[q.id];
        const correctAnswer = q.correctAnswer;
        if (userAnswer !== undefined && correctAnswer !== undefined) {
          if (Array.isArray(correctAnswer)) {
            if (JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)) {
              score += q.marks || 1;
            }
          } else if (userAnswer.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase()) {
            score += q.marks || 1;
          }
        }
      });
      totalMarks = totalMarks || (testModule.questions || []).reduce((sum, q) => sum + (q.marks || 1), 0);
      isGraded = true;
    }

    const completedAt = new Date();
    const durationMinutes = Math.round((completedAt - new Date(attempt.started_at)) / 60000);

    const updates = {
      answers: answers ?? attempt.answers,
      flagged_questions: flaggedQuestions ?? attempt.flagged_questions,
      status: 'finished',
      completed_at: completedAt,
      duration: durationMinutes,
      is_graded: isGraded,
    };

    if (isGraded && score !== null) {
      updates.score_obtained = score;
      updates.score_total = totalMarks;
      updates.score_percentage = totalMarks ? (score / totalMarks) * 100 : null;
    }

    const updated = await Attempt.updateById(id, updates);

    // Mark module as attempted in subscription (for full packages with per-module tracking)
    if (attempt.subscription_id) {
      try {
        const subscription = await Subscription.findById(attempt.subscription_id);
        const moduleType = testModule.module_type || testModule.moduleType;

        // If it's a full package subscription, use per-module tracking
        if (subscription && (subscription.test_module === 'full_package' || subscription.test_module === 'package')) {
          await Subscription.markModuleAttempted(attempt.subscription_id, moduleType);
        } else {
          // For individual module subscriptions, use legacy counter
          await Subscription.useTest(attempt.subscription_id);
        }
      } catch (err) {
        console.error('Subscription tracking error', err);
      }
    }

    res.status(200).json({
      success: true,
      attempt: mapAttempt(updated),
      message: 'Attempt finished successfully',
    });
  } catch (error) {
    console.error('Error finishing attempt:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
