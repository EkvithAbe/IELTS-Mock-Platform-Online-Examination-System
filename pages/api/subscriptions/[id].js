import connectDB from '../../../lib/mysql';
import Subscription from '../../../models/Subscription';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if subscription belongs to user
    if (subscription.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
