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
const ALLOWED_MODULES = ['listening', 'reading', 'writing'];

async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  const moduleId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (!moduleId) {
    return res.status(400).json({ message: 'Module ID is required' });
  }

  let existing;
  try {
    existing = await TestModule.findById(moduleId);
  } catch (error) {
    console.error('Error fetching module:', error);
    return res.status(500).json({ message: 'Server error' });
  }

  if (!existing) {
    return res.status(404).json({ message: 'Module not found' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ success: true, module: existing });
  }

  if (req.method === 'DELETE') {
    try {
      if (existing.module_type === 'listening' && existing.content?.audioUrl) {
        const audioPath = path.join(process.cwd(), 'public', existing.content.audioUrl);
        if (fs.existsSync(audioPath)) {
          fs.unlink(audioPath, () => {});
        }
      }
      await TestModule.deleteById(moduleId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting module:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method !== 'PUT') {
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

    const moduleType = getField(fields, 'moduleType', existing.module_type);
    if (!ALLOWED_MODULES.includes(moduleType)) {
      return res.status(400).json({ message: 'Unsupported module type' });
    }

    const testType = getField(fields, 'testType', existing.test_type);
    const title = getField(fields, 'title', existing.title);
    const description = getField(fields, 'description', existing.description);
    const price = parseFloat(getField(fields, 'price', `${existing.price || 0}`)) || 0;
    const duration = parseInt(getField(fields, 'duration', `${existing.duration || 0}`), 10) || 0;
    const instructions = getField(fields, 'instructions', existing.instructions || null);
    const tags = getField(
      fields,
      'tags',
      Array.isArray(existing.tags) ? existing.tags.join(',') : ''
    )
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updates = {
      test_type: testType,
      module_type: moduleType,
      title,
      description,
      price,
      duration,
      instructions,
      tags,
    };

    // Helper to transform questions for auto-grading (answer -> correctAnswer)
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

    // Module-specific updates
    if (moduleType === 'listening') {
      const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
      let audioUrl = existing.content?.audioUrl || '';
      if (audioFile) {
        audioUrl = `/uploads/modules/${path.basename(audioFile.filepath)}`;
      }

      const rawQuestions = getField(fields, 'listeningQuestions', JSON.stringify(existing.questions || []));
      let listeningQuestions = existing.questions || [];
      if (rawQuestions) {
        try {
          const parsed = JSON.parse(rawQuestions);
          listeningQuestions = transformQuestions(parsed, 'listening');
        } catch {
          return res.status(400).json({ message: 'Invalid listening questions format' });
        }
      }

      updates.content = {
        ...existing.content,
        audioUrl,
        transcript: getField(fields, 'transcript', existing.content?.transcript || ''),
        instructions: getField(fields, 'listeningInstructions', existing.content?.instructions || ''),
      };
      updates.questions = listeningQuestions;
    } else if (moduleType === 'reading') {
      const rawQuestions = getField(fields, 'readingQuestions', JSON.stringify(existing.questions || []));
      let readingQuestions = existing.questions || [];
      if (rawQuestions) {
        try {
          const parsed = JSON.parse(rawQuestions);
          readingQuestions = transformQuestions(parsed, 'reading');
        } catch {
          return res.status(400).json({ message: 'Invalid reading questions format' });
        }
      }

      updates.content = {
        ...existing.content,
        passage: getField(fields, 'passage', existing.content?.passage || ''),
        source: getField(fields, 'source', existing.content?.source || ''),
        time_limit_minutes: duration || existing.content?.time_limit_minutes || 0,
      };
      updates.questions = readingQuestions;
    } else if (moduleType === 'writing') {
      const wordLimit = parseInt(
        getField(fields, 'wordLimit', `${existing.content?.word_limit || 0}`),
        10
      ) || 0;
      const prompt = getField(fields, 'prompt', existing.content?.prompt || '');

      updates.content = {
        ...existing.content,
        prompt,
        word_limit: wordLimit,
        time_limit_minutes: duration || existing.content?.time_limit_minutes || 0,
        instructions: getField(fields, 'writingInstructions', existing.content?.instructions || ''),
      };
      updates.questions = [
        {
          id: existing.questions?.[0]?.id || 'writing-1',
          prompt,
          wordLimit,
          marks: existing.questions?.[0]?.marks || 0,
        },
      ];
    }

    const updated = await TestModule.updateById(moduleId, updates);
    return res.status(200).json({ success: true, module: updated });
  } catch (error) {
    console.error('Error updating module:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export default requireAdmin(handler);
