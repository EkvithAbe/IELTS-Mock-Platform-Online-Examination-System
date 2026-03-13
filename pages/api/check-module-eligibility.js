import connectDB, { query } from '../../lib/mysql';
import { requireAuth } from '../../lib/auth';
import Subscription from '../../models/Subscription';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { testType } = req.query;

    if (!testType) {
      return res.status(400).json({
        message: 'Test type is required'
      });
    }

    // Get user's active subscription
    const subscriptions = await query(
      `SELECT * FROM subscriptions
       WHERE user_id = ? AND test_type = ? AND status = 'active' AND test_module = 'full_package'
       LIMIT 1`,
      [req.user.userId, testType]
    );

    if (subscriptions.length === 0) {
      return res.status(200).json({
        hasSubscription: false,
        modules: {
          listening: { allowed: false, reason: 'No active subscription' },
          reading: { allowed: false, reason: 'No active subscription' },
          writing: { allowed: false, reason: 'No active subscription' },
          speaking: { allowed: false, reason: 'No active subscription' }
        }
      });
    }

    const subscription = subscriptions[0];

    // Check eligibility for each module
    const moduleTypes = ['listening', 'reading', 'writing', 'speaking'];
    const modules = {};

    for (const moduleType of moduleTypes) {
      modules[moduleType] = Subscription.canAttemptModule(subscription, moduleType);
    }

    res.status(200).json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        speaking_completed: subscription.speaking_completed === 1 || subscription.speaking_completed === true,
        modules_attempted: subscription.modules_attempted
      },
      modules
    });
  } catch (error) {
    console.error('Error checking module eligibility:', error);
    res.status(500).json({
      message: 'Failed to check module eligibility',
      error: error.message
    });
  }
}

export default requireAuth(handler);
