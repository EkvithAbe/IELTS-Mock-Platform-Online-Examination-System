import connectDB from '@/lib/mysql';

export default async function handler(req, res) {
  try {
    await connectDB();
    
    res.status(200).json({
      success: true,
      message: 'Database connected successfully! ✅',
      database: 'Connected to MongoDB Atlas',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
}
