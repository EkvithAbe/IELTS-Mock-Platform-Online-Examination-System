import connectDB from '../../../lib/mysql';
import Subscription from '../../../models/Subscription';
import TestModule from '../../../models/TestModule';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get active subscriptions for the user
    const subscriptions = await Subscription.findAll({
      user_id: req.user.userId,
      status: 'active',
    });

    // For each subscription, get the test module details
    const subscriptionsWithModules = await Promise.all(
      subscriptions.map(async (sub) => {
        // Find a test module matching the subscription
        const testModules = await TestModule.findAll({
          test_type: sub.test_type,
          module_type: sub.test_module,
          is_active: true,
        });
        
        const testModule = testModules[0]; // Get first matching module

        return {
          ...sub,
          test_module: sub.test_module,
          duration: testModule ? testModule.duration : 60,
          module_id: testModule ? testModule.id : null,
        };
      })
    );

    res.status(200).json({ 
      success: true, 
      subscriptions: subscriptionsWithModules 
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export default requireAuth(handler);
