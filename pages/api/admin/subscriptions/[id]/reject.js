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

    const { reason } = req.body;

    // Get current subscription to append to notes
    const subscriptions = await query('SELECT notes FROM subscriptions WHERE id = ?', [id]);

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const currentNotes = subscriptions[0].notes || '';
    const rejectionNote = `\n\n--- REJECTED ---\nReason: ${reason}\nRejected at: ${new Date().toLocaleString()}`;

    // Update subscription status in MySQL
    const result = await query(
      `UPDATE subscriptions 
       SET status = 'cancelled', 
           payment_status = 'failed',
           notes = CONCAT(COALESCE(notes, ''), ?),
           updated_at = NOW()
       WHERE id = ?`,
      [rejectionNote, id]
    );

    res.status(200).json({
      success: true,
      message: 'Payment rejected',
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
}

export default requireAuth(handler);
