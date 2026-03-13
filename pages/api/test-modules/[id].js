import connectDB from '../../../lib/mysql';
import TestModule from '../../../models/TestModule';
import Attempt from '../../../models/Attempt';
import Subscription from '../../../models/Subscription';
import { requireAuth } from '../../../lib/auth';

function mapAttempt(attempt) {
  if (!attempt) return null;
  return {
    ...attempt,
    _id: attempt.id,
    attemptNumber: attempt.attempt_number,
    startedAt: attempt.started_at,
    completedAt: attempt.completed_at,
  };
}

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const testModule = await TestModule.findById(id);

    if (!testModule) {
      return res.status(404).json({ message: 'Test module not found' });
    }

    // Ensure user has an active subscription for this module or full package
    const subscription =
      (await Subscription.getActiveSubscription(req.user.userId, testModule.test_type, testModule.module_type)) ||
      (await Subscription.getActiveSubscription(req.user.userId, testModule.test_type, 'full_package')) ||
      (await Subscription.getActiveSubscription(req.user.userId, testModule.test_type, 'package'));

    if (!subscription) {
      return res.status(403).json({ message: 'You need an active package to access this module' });
    }

    const attempts = await Attempt.findByUserAndModule(req.user.userId, id);
    const mappedAttempts = attempts.map(mapAttempt);

    res.status(200).json({
      success: true,
      testModule,
      attempts: mappedAttempts,
      subscription,
    });
  } catch (error) {
    console.error('Error fetching test module:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
