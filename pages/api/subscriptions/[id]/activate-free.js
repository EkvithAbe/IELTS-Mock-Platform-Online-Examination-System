import connectDB from '../../../../lib/mysql';
import Subscription from '../../../../models/Subscription';
import { requireAuth } from '../../../../lib/auth';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if subscription belongs to user
    if (subscription.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Set expiry date (e.g., 30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Activate free subscription using MySQL model method
    const updatedSubscription = await Subscription.updateById(id, {
      status: 'active',
      payment_status: 'completed',
      start_date: new Date(),
      expiry_date: expiryDate,
    });

    res.status(200).json({
      success: true,
      subscription: updatedSubscription,
      message: 'Subscription activated successfully',
    });
  } catch (error) {
    console.error('Error activating subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
