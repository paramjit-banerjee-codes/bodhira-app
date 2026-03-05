/**
 * GATE MOCK TEST ROUTES
 * 
 * Endpoints:
 * - GET /api/tests/gate/generate         (backward compatible - old format)
 * - GET /api/tests/gate/full-exam        (new - 65 questions, 2 sections)
 * - POST /api/tests/gate/submit          (grade submission)
 * - GET /api/tests/gate/subjects         (list available subjects)
 */

import express from 'express';
import { generateGatePaper } from '../../utils/generateGateSubjectPaper.js';
import generateGateFullExam from '../../utils/generateGateFullExam.js';
import scoreGateExam from '../../utils/scoreGateExam.js';
import GateExamResult from '../models/GateExamResult.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/tests/gate/generate
 * 
 * Generates a GATE subject-wise mock test
 * 
 * Query Parameters:
 *   - subject (required): The subject to generate test for (e.g., "DSA")
 * 
 * Example:
 *   GET http://localhost:5000/api/tests/gate/generate?subject=DSA
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     subject: "DSA",
 *     totalQuestions: 50,
 *     oneMarkQuestions: 25,
 *     twoMarkQuestions: 25,
 *     totalMarks: 75,
 *     questions: [...]
 *   }
 * }
 */
router.get('/gate/generate', (req, res) => {
  try {
    // Get subject from query parameters
    const { subject } = req.query;

    // Validate that subject is provided
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject parameter is required',
        example: 'GET /api/tests/gate/generate?subject=DSA'
      });
    }

    console.log(`📝 Generating GATE ${subject} mock test...`);

    // Call the generator function
    const mockTest = generateGatePaper(subject);

    // Check if questions were found
    if (mockTest.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for subject: ${subject}`,
        availableSubjects: ['DSA', 'OS', 'CN']
      });
    }

    // Count statistics
    const oneMarkCount = mockTest.filter(q => q.marks === 1).length;
    const twoMarkCount = mockTest.filter(q => q.marks === 2).length;
    const totalMarks = oneMarkCount * 1 + twoMarkCount * 2;

    // Send successful response
    res.status(200).json({
      success: true,
      data: {
        exam: 'GATE',
        subject,
        totalQuestions: mockTest.length,
        oneMarkQuestions: oneMarkCount,
        twoMarkQuestions: twoMarkCount,
        totalMarks,
        questions: mockTest
      }
    });

  } catch (error) {
    console.error('Error generating mock test:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/tests/gate/subjects
 * 
 * Returns list of available subjects
 * 
 * Example:
 *   GET http://localhost:5000/api/tests/gate/subjects
 * 
 * Response:
 * {
 *   success: true,
 *   subjects: ["DSA", "OS", "CN"]
 * }
 */
router.get('/gate/subjects', (req, res) => {
  try {
    // List of available subjects (add more as you add questions)
    const availableSubjects = ['DSA', 'OS', 'CN'];

    res.status(200).json({
      success: true,
      subjects: availableSubjects,
      message: 'Use these subjects with /gate/generate?subject=SUBJECT_NAME'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tests/gate/full-exam
 * 
 * Generate a complete GATE exam with 65 questions in 2 sections
 * - Section A: General Aptitude (10 questions, 15 marks)
 * - Section B: Subject-specific (55 questions, 85 marks)
 * - Total: 65 questions, 100 marks, 180 minutes
 * 
 * Query Parameters:
 *   - subject (required): e.g., "DSA", "OS", "CN"
 * 
 * Example:
 *   GET /api/tests/gate/full-exam?subject=DSA
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     examId: "GATE_2025_DSA_123456",
 *     exam: "GATE",
 *     subject: "DSA",
 *     totalTimeMinutes: 180,
 *     totalQuestions: 65,
 *     totalMarks: 100,
 *     sections: [
 *       {
 *         id: "A",
 *         title: "General Aptitude",
 *         questions: [
 *           {
 *             id: "q1",
 *             qno: 1,
 *             sectionId: "A",
 *             type: "MCQ",
 *             marks: 1,
 *             topic: "Logic",
 *             difficulty: "easy",
 *             question: "...",
 *             options: ["A", "B", "C", "D"]
 *           },
 *           ...
 *         ]
 *       },
 *       {
 *         id: "B",
 *         title: "DSA",
 *         questions: [ ... 55 questions ... ]
 *       }
 *     ]
 *   }
 * }
 */
router.get('/gate/full-exam', (req, res) => {
  try {
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject parameter is required',
        example: 'GET /api/tests/gate/full-exam?subject=DSA'
      });
    }

    console.log(`📚 Generating full GATE exam for ${subject}...`);

    const exam = generateGateFullExam(subject);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: `Could not generate exam for subject: ${subject}`,
        availableSubjects: ['DSA', 'OS', 'CN']
      });
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error generating full exam:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/tests/gate/submit
 * 
 * Submit exam answers and get detailed grading
 * 
 * Request Body:
 * {
 *   examId: "GATE_2025_DSA_123456",
 *   subject: "DSA",
 *   answers: [
 *     { qid: "q1", type: "MCQ", response: 2 },      // MCQ: index (0-based)
 *     { qid: "q3", type: "MSQ", response: [0, 2] }, // MSQ: array of indices
 *     { qid: "q4", type: "NAT", response: 42.5 }    // NAT: numeric
 *   ],
 *   startedAt: "2025-01-10T10:00:00Z",
 *   submittedAt: "2025-01-10T13:00:00Z"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     examId: "GATE_2025_DSA_123456",
 *     totalScore: 68.33,
 *     totalMarks: 100,
 *     percentage: 68.33,
 *     totalNegativeMarks: 1.33,
 *     sections: {
 *       A: { score: 12.67, maxMarks: 15, totalQuestions: 10 },
 *       B: { score: 55.66, maxMarks: 85, totalQuestions: 55 }
 *     },
 *     perQuestion: [
 *       { qid, qno, sectionId, marks, status: "correct"|"incorrect"|"unattempted"|"partial", awardedMarks },
 *       ...
 *     ],
 *     weakTopics: [
 *       { topic: "Trees", missedMarks: 5, totalMarks: 10, accuracy: 50 },
 *       ...
 *     ],
 *     submittedAt: "2025-01-10T13:00:00Z"
 *   }
 * }
 */
router.post('/gate/submit', authMiddleware, async (req, res) => {
  try {
    const { examId, subject, answers, startedAt, submittedAt, userId } = req.body;

    // Validate required fields
    if (!examId || !subject || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: examId, subject, answers (array)'
      });
    }

    console.log(`🎯 Grading exam ${examId} for ${subject}... (${answers.length} answers)`);

    // Regenerate exam to access question metadata (correct answers, marks, etc.)
    const examData = generateGateFullExam(subject);
    if (!examData) {
      return res.status(500).json({
        success: false,
        message: 'Could not regenerate exam for grading'
      });
    }

    // Score the exam
    const scoreResult = scoreGateExam(examData, answers);

    // Calculate percentage
    const percentage = Math.round((scoreResult.totalScore / scoreResult.totalMarks) * 100 * 100) / 100;

    // Build response
    const resultData = {
      examId,
      totalScore: scoreResult.totalScore,
      totalMarks: scoreResult.totalMarks,
      percentage,
      totalNegativeMarks: scoreResult.totalNegativeMarks,
      sections: scoreResult.sections,
      perQuestion: scoreResult.perQuestion,
      weakTopics: scoreResult.weakTopics,
      submittedAt: submittedAt || new Date().toISOString(),
      startedAt: startedAt || new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    };

    console.log(`✅ Exam graded. Score: ${resultData.totalScore}/${resultData.totalMarks} (${percentage}%)`);

    // Save result to database if userId provided
    let resultId = null;
    if (userId) {
      const timeTakenSeconds = (new Date(resultData.submittedAt) - new Date(resultData.startedAt)) / 1000;
      
      const savedResult = new GateExamResult({
        userId,
        examId,
        subject,
        totalScore: resultData.totalScore,
        totalMarks: resultData.totalMarks,
        percentage: resultData.percentage,
        totalNegativeMarks: resultData.totalNegativeMarks,
        sectionScores: resultData.sections,
        perQuestion: resultData.perQuestion,
        weakTopics: resultData.weakTopics,
        startedAt: new Date(resultData.startedAt),
        submittedAt: new Date(resultData.submittedAt),
        timeTakenSeconds: Math.round(timeTakenSeconds)
      });

      try {
        await savedResult.save();
        resultId = savedResult.resultId;
        console.log(`💾 Result saved with ID: ${resultId}`);
      } catch (dbError) {
        console.error('Error saving result to database:', dbError);
        // Continue anyway - don't fail the submission just because DB save failed
        console.warn('⚠️ Result scored but not persisted');
      }
    }

    res.status(200).json({
      success: true,
      resultId: resultId,
      data: resultData
    });
  } catch (error) {
    console.error('Error grading exam:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/tests/gate/history?userId=123
 * 
 * Get list of past exam attempts for a user
 * 
 * Query Parameters:
 *   - userId (required): User ID
 *   - subject (optional): Filter by subject
 *   - limit (optional): Number of results (default: 10)
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       resultId: "GATE_DSA_123456_abc123",
 *       subject: "DSA",
 *       totalScore: 68.33,
 *       percentage: 68.33,
 *       totalMarks: 100,
 *       submittedAt: "2025-01-10T13:00:00Z",
 *       weakTopics: [...]
 *     },
 *     ...
 *   ],
 *   total: 5
 * }
 */
router.get('/gate/history', authMiddleware, async (req, res) => {
  try {
    const { userId, subject, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId query parameter is required'
      });
    }

    console.log(`📚 Fetching history for user ${userId}...`);

    // Build query
    const query = { userId };
    if (subject) {
      query.subject = subject;
    }

    // Fetch results
    const results = await GateExamResult.find(query)
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Format response
    const historyData = results.map(result => ({
      resultId: result.resultId,
      examId: result.examId,
      subject: result.subject,
      totalScore: result.totalScore,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      totalNegativeMarks: result.totalNegativeMarks,
      submittedAt: result.submittedAt,
      timeTakenSeconds: result.timeTakenSeconds,
      weakTopics: result.weakTopics,
      status: result.status
    }));

    console.log(`✅ Found ${historyData.length} attempts`);

    res.status(200).json({
      success: true,
      data: historyData,
      total: historyData.length
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exam history',
      error: error.message
    });
  }
});

/**
 * GET /api/tests/gate/history/:resultId
 * 
 * Get full details of a specific exam attempt
 * Used for review mode
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     resultId, examId, subject, totalScore, percentage,
 *     sectionScores, perQuestion[], weakTopics[],
 *     startedAt, submittedAt, timeTakenSeconds
 *   }
 * }
 */
router.get('/gate/history/:resultId', authMiddleware, async (req, res) => {
  try {
    const { resultId } = req.params;

    console.log(`📖 Fetching result ${resultId}...`);

    const result = await GateExamResult.findOne({ resultId }).lean();

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Result not found: ${resultId}`
      });
    }

    console.log(`✅ Result found for ${result.subject}`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exam result',
      error: error.message
    });
  }
});

export default router;
