import connectDB, { query } from '../../../../../lib/mysql';
import { requireAdmin } from '../../../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Subscription ID is required' });
    }

    // Reset the subscription's attempt tracking
    await query(
      `UPDATE subscriptions
       SET modules_attempted = '{}',
           tests_used = 0,
           speaking_completed = 0,
           speaking_completed_at = NULL
       WHERE id = ?`,
      [id]
    );

    // Also delete any attempts for this subscription so they can start fresh
    await query(
      `DELETE FROM attempts WHERE subscription_id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Subscription reset successfully. All modules can be attempted again.',
    });
  } catch (error) {
    console.error('Error resetting subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAdmin(handler);
