import connectDB from '../../../../lib/mysql';
import Attempt from '../../../../models/Attempt';
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

    const updated = await Attempt.updateById(id, {
      answers: answers ?? attempt.answers,
      flagged_questions: flaggedQuestions ?? attempt.flagged_questions,
    });

    res.status(200).json({
      success: true,
      attempt: mapAttempt(updated),
    });
  } catch (error) {
    console.error('Error saving attempt:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
