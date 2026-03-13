import connectDB from '../../../../lib/mysql';
import User from '../../../../models/User';
import { requireAdmin } from '../../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get all users with basic info (no passwords)
    const users = await User.findAll();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAdmin(handler);
