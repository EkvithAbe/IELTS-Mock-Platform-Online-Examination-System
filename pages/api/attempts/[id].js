import connectDB from '../../../lib/mysql';
import Attempt from '../../../models/Attempt';
import TestModule from '../../../models/TestModule';
import { requireAuth } from '../../../lib/auth';

function mapAttempt(attempt) {
  if (!attempt) return null;
  return {
    ...attempt,
    _id: attempt.id,
    testModule: attempt.test_module_id,
    startedAt: attempt.started_at,
    completedAt: attempt.completed_at,
    answers: attempt.answers || {},
    flaggedQuestions: attempt.flagged_questions || [],
  };
}

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const attempt = await Attempt.findById(id);

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const testModule = await TestModule.findById(attempt.test_module_id);
    if (!testModule) {
      return res.status(404).json({ message: 'Test module not found' });
    }

    res.status(200).json({
      success: true,
      attempt: mapAttempt(attempt),
      testModule,
    });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
