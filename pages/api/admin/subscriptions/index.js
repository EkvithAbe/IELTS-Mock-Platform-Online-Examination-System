import connectDB, { query } from '../../../../lib/mysql';
import { requireAuth } from '../../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Fetch all subscriptions with user details using JOIN
    const subscriptions = await query(`
      SELECT 
        s.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);

    // Calculate stats
    const stats = {
      pending: subscriptions.filter(s => s.status === 'pending').length,
      approved: subscriptions.filter(s => s.status === 'active').length,
      rejected: subscriptions.filter(s => s.status === 'cancelled').length,
      total: subscriptions.length,
      revenue: subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + parseFloat(s.price || 0), 0),
    };

    res.status(200).json({
      success: true,
      subscriptions,
      stats,
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
