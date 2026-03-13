import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import connectDB from '../../../../lib/mysql';
import TestModule from '../../../../models/TestModule';
import { requireAdmin } from '../../../../lib/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

function getField(fields, name, fallback = '') {
  const value = fields[name];
  if (Array.isArray(value)) return value[0];
  return value ?? fallback;
}

function ensureUploadDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/modules');

async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  if (req.method === 'GET') {
    try {
      const { testType, moduleType } = req.query;
      const filters = {};

      if (testType) filters.test_type = testType;
      if (moduleType) filters.module_type = moduleType;

      const modules = await TestModule.findAll(filters);
      return res.status(200).json({ success: true, modules });
    } catch (error) {
      console.error('Error fetching modules:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  ensureUploadDir(UPLOAD_DIR);

  const form = formidable({
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: 25 * 1024 * 1024, // 25MB for audio
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, parsedFields, parsedFiles) => {
        if (err) reject(err);
        resolve([parsedFields, parsedFiles]);
      });
    });

    const moduleType = getField(fields, 'moduleType');
    const testType = getField(fields, 'testType');
    const title = getField(fields, 'title');
    const description = getField(fields, 'description', 'IELTS module');
    const price = parseFloat(getField(fields, 'price', '0')) || 0;
    const duration = parseInt(getField(fields, 'duration', '0'), 10) || 0;
    const instructions = getField(fields, 'instructions') || null;
    const tags = getField(fields, 'tags', '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (!moduleType || !testType || !title || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const moduleData = {
      title,
      description,
      test_type: testType,
      module_type: moduleType,
      price,
      duration,
      instructions,
      tags,
      content: {},
      questions: [],
    };

    // Helper to transform questions for auto-grading
    const transformQuestions = (questions, prefix) => {
      return questions.map((q, idx) => ({
        questionNumber: q.questionNumber || idx + 1,
        id: q.id || `${prefix}-${idx + 1}`,
        question: q.question || q.prompt || '',
        correctAnswer: q.correctAnswer || q.answer || '',
        marks: Number(q.marks) || 1,
        questionType: q.questionType || 'fill_blanks',
      }));
    };

    // Build module-specific content
    if (moduleType === 'listening') {
      const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
      if (!audioFile) {
        return res.status(400).json({ message: 'Audio file is required for listening module' });
      }
      const filename = path.basename(audioFile.filepath);
      moduleData.content = {
        audioUrl: `/uploads/modules/${filename}`,
        transcript: getField(fields, 'transcript', ''),
        instructions: getField(fields, 'listeningInstructions', instructions || ''),
      };

      // Support both 'questions' and 'listeningQuestions' field names
      const rawQuestions = getField(fields, 'listeningQuestions') || getField(fields, 'questions', '[]');
      if (rawQuestions) {
        try {
          const parsed = JSON.parse(rawQuestions);
          moduleData.questions = transformQuestions(parsed, 'listening');
        } catch {
          return res.status(400).json({ message: 'Invalid questions format' });
        }
      }
    } else if (moduleType === 'reading') {
      const passage = getField(fields, 'passage', '');
      // Support both 'questions' and 'readingQuestions' field names
      const rawQuestions = getField(fields, 'readingQuestions') || getField(fields, 'questions', '[]');
      let parsedQuestions = [];
      try {
        const parsed = JSON.parse(rawQuestions);
        parsedQuestions = transformQuestions(parsed, 'reading');
      } catch {
        return res.status(400).json({ message: 'Invalid questions format' });
      }
      moduleData.content = {
        passage,
        time_limit_minutes: duration,
        source: getField(fields, 'source', ''),
      };
      moduleData.questions = parsedQuestions;
    } else if (moduleType === 'writing') {
      const wordLimit = parseInt(getField(fields, 'wordLimit', '0'), 10) || 0;
      const prompt = getField(fields, 'prompt', '');
      moduleData.content = {
        prompt,
        word_limit: wordLimit,
        time_limit_minutes: duration,
        instructions: getField(fields, 'writingInstructions', instructions || ''),
      };

      const questions = [
        {
          questionNumber: 1,
          id: 'writing-1',
          question: prompt,
          prompt,
          wordLimit,
          marks: 0,
          questionType: 'essay',
        },
      ];
      moduleData.questions = questions;
    } else if (moduleType === 'speaking') {
      moduleData.content = {
        instructions: instructions || 'Complete the speaking tasks as instructed.',
      };
      moduleData.questions = [];
    } else {
      return res.status(400).json({ message: 'Unsupported module type' });
    }

    const created = await TestModule.create(moduleData);
    return res.status(201).json({ success: true, module: created });
  } catch (error) {
    console.error('Error creating test module:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export default requireAdmin(handler);
