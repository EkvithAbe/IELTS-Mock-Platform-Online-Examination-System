import connectDB from '../../../lib/mysql';
import TestModule from '../../../models/TestModule';
import { requireAuth } from '../../../lib/auth';

const ALLOWED_MODULES = ['listening', 'reading', 'writing', 'speaking'];

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { testType, moduleType } = req.query;
    const filters = { is_active: true };

    if (testType) filters.test_type = testType;
    if (moduleType) filters.module_type = moduleType;

    const modules = await TestModule.findAll(filters);
    const filtered = modules.filter((mod) => ALLOWED_MODULES.includes(mod.module_type));

    return res.status(200).json({ success: true, modules: filtered });
  } catch (error) {
    console.error('Error fetching modules:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export default requireAuth(handler);
