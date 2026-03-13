import connectDB, { query } from '../../../lib/mysql';
import { requireAuth } from '../../../lib/auth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Parse form data
    const uploadDir = path.join(process.cwd(), 'public/uploads/payment-receipts');
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: function ({ name, originalFilename, mimetype }) {
        // Only allow image files and PDFs for payment receipts
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        return allowedTypes.includes(mimetype);
      },
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Extract form data (formidable returns arrays for each field)
    const fullName = Array.isArray(fields.fullName) ? fields.fullName[0] : fields.fullName;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
    const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;
    const city = Array.isArray(fields.city) ? fields.city[0] : fields.city;
    const country = Array.isArray(fields.country) ? fields.country[0] : fields.country;
    const transactionId = Array.isArray(fields.transactionId) ? fields.transactionId[0] : fields.transactionId;
    const paymentMethod = Array.isArray(fields.paymentMethod) ? fields.paymentMethod[0] : fields.paymentMethod;
    const notes = Array.isArray(fields.notes) ? fields.notes[0] : fields.notes;
    const testType = Array.isArray(fields.testType) ? fields.testType[0] : fields.testType;
    const testModule = Array.isArray(fields.testModule) ? fields.testModule[0] : fields.testModule;
    const quizId = Array.isArray(fields.quizId) ? fields.quizId[0] : fields.quizId;
    const quizName = Array.isArray(fields.quizName) ? fields.quizName[0] : fields.quizName;
    const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;
    const testsAllowedRaw = Array.isArray(fields.testsAllowed) ? fields.testsAllowed[0] : fields.testsAllowed;
    const moduleId = Array.isArray(fields.moduleId) ? fields.moduleId[0] : fields.moduleId;
    const moduleTitle = Array.isArray(fields.moduleTitle) ? fields.moduleTitle[0] : fields.moduleTitle;

    const parsedTestsAllowed = parseInt(testsAllowedRaw, 10);
    const testsAllowed = !isNaN(parsedTestsAllowed)
      ? parsedTestsAllowed
      : (testModule === 'full_package' || testModule === 'package' ? 4 : 1); // 4 tests: Listening, Reading, Writing, Speaking

    // Get uploaded file
    let receiptPath = null;
    if (files.paymentSlip) {
      const file = Array.isArray(files.paymentSlip) ? files.paymentSlip[0] : files.paymentSlip;
      const filename = path.basename(file.filepath);
      receiptPath = `/uploads/payment-receipts/${filename}`;
    }

    // Create subscription record in MySQL
    const notesText = `
Customer Info:
Name: ${fullName}
Email: ${email}
Phone: ${phone}
Address: ${address}
City: ${city}
Country: ${country}

Quiz: ${quizName}
Quiz ID: ${quizId}
Module Title: ${moduleTitle || quizName}
Module DB ID: ${moduleId || 'N/A'}
Transaction ID: ${transactionId}

Additional Notes: ${notes || 'None'}
    `.trim();

    const result = await query(
      `INSERT INTO subscriptions (
        user_id, test_type, test_module, price, status,
        payment_status, payment_method, payment_slip, 
        transaction_id, tests_allowed, tests_used, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.user.userId,
        testType, // Academic or General
        testModule, // full_package or specific module key
        parseFloat(price),
        'pending', // Waiting for admin approval
        'pending',
        paymentMethod || 'bank_transfer',
        receiptPath,
        transactionId,
        testsAllowed || 1,
        0,
        notesText
      ]
    );

    res.status(201).json({
      success: true,
      subscriptionId: result.insertId,
      message: 'Payment submitted successfully. Waiting for admin approval.',
    });
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
}

export default requireAuth(handler);
