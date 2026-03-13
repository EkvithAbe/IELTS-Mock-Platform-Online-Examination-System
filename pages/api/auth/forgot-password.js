import connectDB from '@/lib/mysql';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success for security (don't reveal if email exists)
    // In production, you would send an email here
    if (user) {
      // TODO: Generate reset token and send email
      // For now, just log it for admin to manually reset
      console.log(`Password reset requested for: ${email}`);
    }

    // Always return success response (even if user doesn't exist)
    return res.status(200).json({
      success: true,
      message: 'If the email exists, you will receive reset instructions.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request. Please try again.',
      error: error.message,
    });
  }
}
