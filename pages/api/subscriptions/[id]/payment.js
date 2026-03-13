import connectDB from '../../../../lib/mysql';
import Subscription from '../../../../models/Subscription';
import { requireAuth } from '../../../../lib/auth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Parse form data
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public/uploads/payment-slips'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: function ({ name, originalFilename, mimetype }) {
        // Only allow image files and PDFs for payment slips
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        return allowedTypes.includes(mimetype);
      },
    });

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads/payment-slips');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if subscription belongs to user
    if (subscription.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prepare update data
    const updates = {
      payment_status: 'pending',
      status: 'pending',
    };

    if (fields.paymentMethod) {
      updates.payment_method = fields.paymentMethod[0];
    }

    if (files.paymentSlip) {
      const file = Array.isArray(files.paymentSlip) ? files.paymentSlip[0] : files.paymentSlip;
      const filename = path.basename(file.filepath);
      updates.payment_slip = `/uploads/payment-slips/${filename}`;
    }

    const updatedSubscription = await Subscription.updateById(id, updates);

    res.status(200).json({
      success: true,
      subscription: updatedSubscription,
      message: 'Payment submitted successfully. Waiting for admin approval.',
    });
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
