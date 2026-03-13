import connectDB from '@/lib/mysql';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { name, phone } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find and update user
    const user = await User.updateById(userId, { name, phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return updated user data
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
}

export default requireAuth(handler);
