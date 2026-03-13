import connectDB, { query } from '../../../../../lib/mysql';
import { requireAuth } from '../../../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    await connectDB();

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Update subscription status in MySQL
    const result = await query(
      `UPDATE subscriptions 
       SET status = 'active', 
           payment_status = 'completed',
           start_date = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment approved successfully. Quiz unlocked for student.',
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
}

export default requireAuth(handler);
