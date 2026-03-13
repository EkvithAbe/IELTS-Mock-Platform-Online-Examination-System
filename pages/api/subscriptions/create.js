import connectDB from '../../../lib/mysql';
import Subscription from '../../../models/Subscription';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { testType, testModule, price, paymentMethod } = req.body;

    if (!testType || !testModule || !price) {
      return res.status(400).json({ 
        message: 'Test type, module, and price are required' 
      });
    }

    // Create subscription
    const subscription = await Subscription.create({
      user_id: req.user.userId,
      test_type: testType,
      test_module: testModule,
      price,
      payment_method: paymentMethod || 'bank_transfer',
      status: 'pending',
      payment_status: 'pending',
      tests_allowed: 1,
      tests_used: 0,
    });

    res.status(201).json({
      success: true,
      subscription,
      message: 'Subscription created. Please complete payment.',
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
