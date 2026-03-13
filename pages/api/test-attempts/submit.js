import connectDB, { query } from '../../../lib/mysql';
import { requireAuth } from '../../../lib/auth';
import Subscription from '../../../models/Subscription';
import TestModule from '../../../models/TestModule';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { testType, testModule, answers, timeSpent, totalQuestions, testModuleId } = req.body;

    if (!testType || !testModule || !answers) {
      return res.status(400).json({
        message: 'Test type, module, and answers are required'
      });
    }

    // Check if user has valid subscription from MySQL
    const subscriptions = await query(
      `SELECT * FROM subscriptions
       WHERE user_id = ? AND test_type = ? AND status = 'active' AND test_module = 'full_package'
       LIMIT 1`,
      [req.user.userId, testType]
    );

    if (subscriptions.length === 0) {
      return res.status(403).json({
        message: 'No active subscription found for this test type'
      });
    }

    const subscription = subscriptions[0];

    // Check if module can be attempted using business rules
    const attemptCheck = Subscription.canAttemptModule(subscription, testModule);

    if (!attemptCheck.allowed) {
      return res.status(403).json({
        message: attemptCheck.reason,
        needsSpeaking: attemptCheck.needsSpeaking,
        requiresBooking: attemptCheck.requiresBooking
      });
    }

    // AUTO-GRADING: Fetch test module with correct answers from database
    let score = 0;
    let totalMarks = totalQuestions;
    let isGraded = false;
    let gradingDetails = [];

    // Find the test module to get correct answers
    let dbTestModule = null;
    if (testModuleId) {
      dbTestModule = await TestModule.findById(testModuleId);
    } else {
      // Find by test_type and module_type
      const modules = await query(
        `SELECT * FROM test_modules
         WHERE test_type = ? AND module_type = ? AND is_active = 1
         ORDER BY created_at DESC LIMIT 1`,
        [testType, testModule]
      );
      if (modules.length > 0) {
        dbTestModule = modules[0];
        // Parse JSON fields
        if (typeof dbTestModule.questions === 'string') {
          dbTestModule.questions = JSON.parse(dbTestModule.questions || '[]');
        }
        if (typeof dbTestModule.content === 'string') {
          dbTestModule.content = JSON.parse(dbTestModule.content || '{}');
        }
      }
    }

    // Auto-grade for listening and reading
    if (testModule === 'listening' || testModule === 'reading') {
      if (dbTestModule && dbTestModule.questions && dbTestModule.questions.length > 0) {
        const questions = dbTestModule.questions;
        totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

        questions.forEach((q) => {
          const questionKey = q.questionNumber || q.id;
          const userAnswer = answers[questionKey] || answers[q.id] || '';
          const correctAnswer = q.correctAnswer || q.answer || '';

          let isCorrect = false;
          if (userAnswer && correctAnswer) {
            // Case-insensitive, trimmed comparison
            const normalizedUser = userAnswer.toString().trim().toLowerCase();
            const normalizedCorrect = correctAnswer.toString().trim().toLowerCase();

            // Handle array of correct answers
            if (Array.isArray(correctAnswer)) {
              isCorrect = correctAnswer.some(ans =>
                ans.toString().trim().toLowerCase() === normalizedUser
              );
            } else {
              isCorrect = normalizedUser === normalizedCorrect;
            }
          }

          if (isCorrect) {
            score += Number(q.marks) || 1;
          }

          gradingDetails.push({
            questionNumber: questionKey,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect,
            marks: isCorrect ? (Number(q.marks) || 1) : 0,
          });
        });

        isGraded = true;
      } else {
        // Fallback if no questions found - should not happen in production
        score = 0;
        isGraded = false;
      }
    } else {
      // Writing and speaking require manual grading
      isGraded = false;
      score = 0;
    }

    // Calculate percentage and grade
    const scorePercentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    let scoreGrade = 'F';
    if (scorePercentage >= 90) scoreGrade = 'A+';
    else if (scorePercentage >= 80) scoreGrade = 'A';
    else if (scorePercentage >= 70) scoreGrade = 'B';
    else if (scorePercentage >= 60) scoreGrade = 'C';
    else if (scorePercentage >= 50) scoreGrade = 'D';

    // Create attempt record in the main attempts table for consistency
    const answersJson = JSON.stringify(answers);
    const gradingDetailsJson = JSON.stringify(gradingDetails);

    // Insert into the main attempts table (used by progress API)
    const result = await query(
      `INSERT INTO attempts (
        user_id, test_module_id, subscription_id, attempt_number,
        status, started_at, completed_at, duration,
        answers, score_obtained, score_total, score_percentage, score_grade,
        is_graded, feedback
      ) VALUES (?, ?, ?, 1, 'finished', DATE_SUB(NOW(), INTERVAL ? SECOND), NOW(), ?,
        ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        dbTestModule?.id || null,
        subscription.id,
        timeSpent || 0,
        Math.ceil((timeSpent || 0) / 60),
        answersJson,
        score,
        totalMarks,
        scorePercentage,
        scoreGrade,
        isGraded ? 1 : 0,
        isGraded ? gradingDetailsJson : null
      ]
    );

    // Mark module as attempted using Subscription model
    await Subscription.markModuleAttempted(subscription.id, testModule);

    res.status(201).json({
      success: true,
      attemptId: result.insertId,
      score: score,
      totalMarks: totalMarks,
      scorePercentage: Math.round(scorePercentage * 10) / 10,
      scoreGrade: scoreGrade,
      isGraded: isGraded,
      gradingDetails: isGraded ? gradingDetails : null,
      message: isGraded
        ? `Test graded! You scored ${score}/${totalMarks} (${Math.round(scorePercentage)}%)`
        : 'Test submitted. Writing/Speaking requires manual grading.',
      isFirstAttempt: attemptCheck.isFirstAttempt
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    console.error('Error details:', {
      message: error.message,
      sql: error.sql,
      code: error.code
    });
    res.status(500).json({ 
      message: 'Failed to submit test. Please contact support.',
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
}

export default requireAuth(handler);
