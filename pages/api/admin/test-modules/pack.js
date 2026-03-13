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

    const testType = getField(fields, 'testType');
    const baseTitle = getField(fields, 'baseTitle');
    const baseDescription = getField(fields, 'baseDescription', 'IELTS mock pack');

    if (!testType || !baseTitle) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const listeningDuration = parseInt(getField(fields, 'listeningDuration', '0'), 10) || 0;
    const readingDuration = parseInt(getField(fields, 'readingDuration', '0'), 10) || 0;
    const writingDuration = parseInt(getField(fields, 'writingDuration', '0'), 10) || 0;

    const packPrice = parseFloat(getField(fields, 'packPrice', '0')) || 0;

    const wordLimit = parseInt(getField(fields, 'wordLimit', '0'), 10) || 0;

    const listeningAudio = Array.isArray(files.listeningAudio) ? files.listeningAudio[0] : files.listeningAudio;
    if (!listeningAudio) {
      return res.status(400).json({ message: 'Listening audio is required' });
    }
    const audioFilename = path.basename(listeningAudio.filepath);

    // Parse questions and transform answer -> correctAnswer for auto-grading
    let listeningQuestions = [];
    let readingQuestions = [];
    try {
      const rawListening = JSON.parse(getField(fields, 'listeningQuestions', '[]'));
      listeningQuestions = rawListening.map((q, idx) => ({
        questionNumber: idx + 1,
        id: q.id || `listening-${idx + 1}`,
        question: q.prompt || q.question || '',
        correctAnswer: q.answer || q.correctAnswer || '',
        marks: Number(q.marks) || 1,
        questionType: q.questionType || 'fill_blanks',
      }));
    } catch {
      return res.status(400).json({ message: 'Invalid listening questions format' });
    }
    try {
      const rawReading = JSON.parse(getField(fields, 'readingQuestions', '[]'));
      readingQuestions = rawReading.map((q, idx) => ({
        questionNumber: idx + 1,
        id: q.id || `reading-${idx + 1}`,
        question: q.prompt || q.question || '',
        correctAnswer: q.answer || q.correctAnswer || '',
        marks: Number(q.marks) || 1,
        questionType: q.questionType || 'fill_blanks',
      }));
    } catch {
      return res.status(400).json({ message: 'Invalid reading questions format' });
    }

    const modulesCreated = [];

    // Listening module
    const listeningModule = await TestModule.create({
      title: `${baseTitle} - Listening`,
      description: baseDescription,
      test_type: testType,
      module_type: 'listening',
      duration: listeningDuration,
      price: packPrice,
      content: {
        audioUrl: `/uploads/modules/${audioFilename}`,
        transcript: getField(fields, 'listeningTranscript', ''),
        instructions: getField(fields, 'listeningInstructions', ''),
      },
      questions: listeningQuestions,
    });
    modulesCreated.push(listeningModule);

    // Reading module
    const readingModule = await TestModule.create({
      title: `${baseTitle} - Reading`,
      description: baseDescription,
      test_type: testType,
      module_type: 'reading',
      duration: readingDuration,
      price: packPrice,
      content: {
        passage: getField(fields, 'readingPassage', ''),
        source: getField(fields, 'readingSource', ''),
        time_limit_minutes: readingDuration,
      },
      questions: readingQuestions,
    });
    modulesCreated.push(readingModule);

    // Writing module
    const writingModule = await TestModule.create({
      title: `${baseTitle} - Writing`,
      description: baseDescription,
      test_type: testType,
      module_type: 'writing',
      duration: writingDuration,
      price: packPrice,
      content: {
        prompt: getField(fields, 'writingPrompt', ''),
        word_limit: wordLimit,
        time_limit_minutes: writingDuration,
        instructions: getField(fields, 'writingInstructions', ''),
      },
      questions: [
        {
          id: 'writing-1',
          prompt: getField(fields, 'writingPrompt', ''),
          wordLimit,
          marks: 0,
        },
      ],
    });
    modulesCreated.push(writingModule);

    return res.status(201).json({ success: true, modules: modulesCreated });
  } catch (error) {
    console.error('Error creating pack:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export default requireAdmin(handler);
