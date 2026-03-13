import connectDB from '../../../lib/mysql';
import TestModule from '../../../models/TestModule';
import { requireAuth } from '../../../lib/auth';

const ALLOWED_MODULES = ['listening', 'reading', 'writing'];

async function handler(req, res) {
  const moduleId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!moduleId) {
    return res.status(400).json({ message: 'Module ID is required' });
  }

  try {
    await connectDB();
    const module = await TestModule.findById(moduleId);

    if (!module || !ALLOWED_MODULES.includes(module.module_type)) {
      return res.status(404).json({ message: 'Module not found' });
    }

    return res.status(200).json({ success: true, module });
  } catch (error) {
    console.error('Error fetching module:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
