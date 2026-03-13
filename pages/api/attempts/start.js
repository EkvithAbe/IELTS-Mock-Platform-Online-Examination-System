import connectDB from '../../../lib/mysql';
import Attempt from '../../../models/Attempt';
import TestModule from '../../../models/TestModule';
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { testModuleId } = req.body;

    if (!testModuleId) {
      return res.status(400).json({ message: 'Test module ID is required' });
    }

    const testModule = await TestModule.findById(testModuleId);

    if (!testModule) {
      return res.status(404).json({ message: 'Test module not found' });
    }

    // Check active subscription (module or full package)
    const subscription =
      (await Subscription.getActiveSubscription(req.user.userId, testModule.test_type, testModule.module_type)) ||
      (await Subscription.getActiveSubscription(req.user.userId, testModule.test_type, 'full_package')) ||
      (await Subscription.getActiveSubscription(req.user.userId, testModule.test_type, 'package'));

    if (!subscription) {
      return res.status(403).json({
        message: 'You need an active subscription to start this test',
      });
    }

    // For full packages, check if this specific module has already been attempted
    const isFullPackage = subscription.test_module === 'full_package' || subscription.test_module === 'package';
    if (isFullPackage) {
      const moduleType = testModule.module_type || testModule.moduleType;
      const alreadyAttempted = Subscription.hasModuleBeenAttempted(subscription, moduleType);

      if (alreadyAttempted) {
        return res.status(403).json({
          message: `You have already attempted the ${moduleType} module. Each module can only be attempted once per package.`,
        });
      }
    }

    const existingAttempts = await Attempt.findByUserAndModule(req.user.userId, testModuleId);
    const inProgress = existingAttempts.find((a) => a.status === 'in_progress');

    if (inProgress) {
      return res.status(200).json({
        success: true,
        attempt: mapAttempt(inProgress),
        message: 'Continuing existing attempt',
      });
    }

    const attemptNumber = await Attempt.getNextAttemptNumber(req.user.userId, testModuleId);

    const attempt = await Attempt.create({
      user_id: req.user.userId,
      test_module_id: testModuleId,
      subscription_id: subscription.id,
      attempt_number: attemptNumber,
      status: 'in_progress',
      started_at: new Date(),
    });

    res.status(201).json({
      success: true,
      attempt: mapAttempt(attempt),
    });
  } catch (error) {
    console.error('Error starting attempt:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
