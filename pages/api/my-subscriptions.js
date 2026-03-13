import connectDB, { query } from '../../lib/mysql';
import { requireAuth } from '../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Fetch user's subscriptions from MySQL
    const subscriptions = await query(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    // Get active subscriptions (approved and not used up)
    const activeSubscriptions = subscriptions.filter(s => 
      s.status === 'active' && s.tests_used < s.tests_allowed
    );

    res.status(200).json({
      success: true,
      subscriptions,
      activeSubscriptions,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
}

export default requireAuth(handler);
