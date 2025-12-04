import Test from '../models/Test.js';
import Result from '../models/Result.js';
import User from '../models/User.js';
import Classroom from '../models/Classroom.js';
import { canStartTest, incrementFreeTestsUsed } from '../utils/entitlements.js';

// @desc    Generate test using AI (OpenAI gpt-4o-mini)
// @route   POST /api/tests/generate
// @access  Private
// NOTE: Now handled by generationController.js
// This stub is kept for backwards compatibility only
export const generateTest = async (req, res) => {
  return res.status(500).json({
    success: false,
    error: 'Generation endpoint must be called through the router (generationController)',
  });
};

// @desc    Get test by code (public, no auth needed)
// @route   GET /api/tests/code/:testCode
// @access  Public
// DEPRECATED: Moved to generationController.js
// export const getTestByCode = async (req, res) => {
//   ...
// };

// @desc    Get test by ID (for taking test)
// @route   GET /api/tests/:testId
// @access  Private
export const getTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.userId;
    
    const test = await Test.findById(testId).select('-questions.correctAnswer');

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    // Check if test is public or if user is enrolled/teacher
    let isAuthorized = false;

    // If test is in a classroom, check if user is enrolled
    if (test.classroomId) {
      const classroom = await Classroom.findById(test.classroomId);
      if (classroom) {
        // Check if user is teacher OR enrolled student
        if (classroom.teacherId.toString() === userId) {
          isAuthorized = true;
        } else if (classroom.students && classroom.students.includes(userId)) {
          isAuthorized = true;
        }
      }
    } else if (test.isPublic) {
      // Test is not in classroom but is public
      isAuthorized = true;
    }

    if (!isAuthorized) {
      console.warn(`⚠️ Unauthorized test access: user ${userId} tried to access test ${testId}`);
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this test',
      });
    }

    // Check if test is published (for students, not teachers)
    if (!test.isPublished && !(test.createdBy?.toString() === userId || test.teacherId?.toString() === userId)) {
      return res.status(403).json({
        success: false,
        error: 'This test is not yet published. Please ask the teacher to publish it.',
      });
    }

    // Check if test has expired (students only, teachers can still view expired tests)
    const isTeacher = test.createdBy?.toString() === userId || test.teacherId?.toString() === userId;
    const now = new Date();
    if (!isTeacher && test.expiresAt && now > test.expiresAt) {
      console.log(`⏰ Test expired: testId=${testId}, expiresAt=${test.expiresAt}`);
      return res.status(410).json({
        success: false,
        error: 'This test has expired and is no longer available',
        expiredAt: test.expiresAt,
      });
    }

    // Check if user has entitlement to take the test (students only)
    if (!isTeacher) {
      const entitlement = await canStartTest(userId);
      if (!entitlement.canStart) {
        return res.status(402).json({
          success: false,
          error: entitlement.message || 'You do not have entitlement to take this test',
          reason: entitlement.reason,
        });
      }
      
      // Increment free tests if user is using free trial
      if (entitlement.reason === 'free_trial') {
        await incrementFreeTestsUsed(userId);
      }
    }

    console.log(`✅ Test accessed: ${testId} by user ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        testId: test._id,
        testCode: test.testCode,
        title: test.title,
        topic: test.topic,
        difficulty: test.difficulty,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        questions: test.questions.map((q) => ({
          question: q.question,
          options: q.options,
        })),
      },
    });
  } catch (error) {
    console.error('Get Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching test',
    });
  }
};

// @desc    Get all tests created by user (teacher)
// @route   GET /api/tests/my-tests
// @access  Private
export const getTeacherTests = async (req, res) => {
  try {
    // Get tests where user is either the teacherId or createdBy
    const tests = await Test.find({
      $or: [
        { teacherId: req.userId },
        { createdBy: req.userId }
      ]
    })
      .select('title topic difficulty totalQuestions duration testCode createdAt isPublished status')
      .sort({ createdAt: -1 });

    // Get submission counts for each test
    const testsWithCounts = await Promise.all(
      tests.map(async (test) => {
        const submissionCount = await Result.countDocuments({ testId: test._id });
        return {
          ...test.toObject(),
          submissionCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        tests: testsWithCounts,
        total: testsWithCounts.length,
      },
    });
  } catch (error) {
    console.error('Get Teacher Tests Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching tests',
    });
  }
};

// @desc    Delete test
// @route   DELETE /api/tests/:testId
// @access  Private
export const deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.userId;
    
    console.log(`🗑️ [DELETE TEST] Attempting to delete test: ${testId} by user: ${userId}`);
    
    const test = await Test.findById(testId);

    if (!test) {
      console.log(`❌ [DELETE TEST] Test not found: ${testId}`);
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    // Check authorization - test against both createdBy and teacherId
    const isCreatedBy = test.createdBy && test.createdBy.toString() === userId.toString();
    const isTeacher = test.teacherId && test.teacherId.toString() === userId.toString();
    
    console.log(`🔐 [DELETE TEST] Auth check - isCreatedBy: ${isCreatedBy}, isTeacher: ${isTeacher}`);
    console.log(`📋 [DELETE TEST] Test createdBy: ${test.createdBy}, teacherId: ${test.teacherId}`);
    
    if (!isCreatedBy && !isTeacher) {
      console.log(`❌ [DELETE TEST] Not authorized - user ${userId} cannot delete test by ${test.teacherId || test.createdBy}`);
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this test',
      });
    }

    // Delete the test
    await Test.findByIdAndDelete(testId);
    console.log(`✅ [DELETE TEST] Test document deleted: ${testId}`);
    
    // Remove from user's createdTests
    await User.findByIdAndUpdate(userId, {
      $pull: { createdTests: testId },
    });
    console.log(`✅ [DELETE TEST] Removed from user createdTests`);
    
    // Remove from any classrooms that have this test
    await Classroom.updateMany(
      { tests: testId },
      { $pull: { tests: testId } }
    );
    console.log(`✅ [DELETE TEST] Removed from classrooms`);
    
    // Delete all results associated with this test
    await Result.deleteMany({ testId: testId });
    console.log(`✅ [DELETE TEST] All results deleted`);

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    console.error('❌ [DELETE TEST ERROR]:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting test',
    });
  }
};

// @desc    Submit test and calculate score
// @route   POST /api/results/submit
// @access  Private
export const submitTest = async (req, res) => {
  try {
    const { testId, answers, timeTaken } = req.body;
    const userId = req.userId;

    if (!testId || !Array.isArray(answers) || typeof timeTaken !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'testId, answers array, and timeTaken are required',
      });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    // Check if test is published FIRST
    if (!test.isPublished) {
      return res.status(403).json({
        success: false,
        error: 'This test is not published yet',
      });
    }

    // Check if user is authorized to submit test
    // Authorization is broader now:
    // 1. If test is in a classroom, user must be enrolled
    // 2. If test is public, any authenticated user can submit
    // 3. Teachers can always take their own tests
    let isAuthorized = false;

    // Teacher can always take their own tests
    if (test.teacherId && test.teacherId.toString() === userId.toString()) {
      isAuthorized = true;
    }
    // If test is in a classroom, check if user is enrolled
    else if (test.classroomId) {
      const classroom = await Classroom.findById(test.classroomId);
      if (classroom && classroom.students && classroom.students.includes(userId)) {
        isAuthorized = true;
      }
    }
    // Test is public, any authenticated user can submit
    else if (test.isPublic) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      console.warn(`⚠️ Unauthorized test submission: user ${userId} tried to submit test ${testId}`);
      return res.status(403).json({
        success: false,
        error: 'Not authorized to submit this test',
      });
    }

    // Calculate score
    let score = 0;
    const detailedAnswers = [];

    answers.forEach((answer) => {
      const { questionIndex, selectedAnswer } = answer;

      if (
        questionIndex >= 0 &&
        questionIndex < test.questions.length &&
        typeof selectedAnswer === 'number' &&
        selectedAnswer >= 0 &&
        selectedAnswer <= 3
      ) {
        const question = test.questions[questionIndex];
        const isCorrect = selectedAnswer === parseInt(question.correctAnswer);

        if (isCorrect) score++;

        detailedAnswers.push({
          questionIndex,
          selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
        });
      }
    });

    const percentage = Math.round((score / test.totalQuestions) * 100);

    const result = await Result.create({
      userId: req.userId,
      testId: test._id,
      testCode: test.testCode,
      topic: test.topic,
      difficulty: test.difficulty,
      score,
      totalQuestions: test.totalQuestions,
      percentage,
      answers: detailedAnswers,
      timeTaken,
    });

    // Add result to user's attemptedTests
    await User.findByIdAndUpdate(req.userId, {
      $push: { attemptedTests: result._id },
    });

    // Calculate rank
    const betterResults = await Result.countDocuments({
      testCode: test.testCode,
      $or: [
        { percentage: { $gt: percentage } },
        {
          percentage: percentage,
          timeTaken: { $lt: timeTaken },
        },
      ],
    });

    const rank = betterResults + 1;

    // Update result with rank
    result.rank = rank;
    await result.save();

    res.status(201).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        resultId: result._id,
        testCode: test.testCode,
        score,
        totalQuestions: test.totalQuestions,
        percentage,
        rank,
        timeTaken,
        correctAnswers: detailedAnswers.filter((a) => a.isCorrect).length,
      },
    });
  } catch (error) {
    console.error('Submit Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error submitting test',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get result details
// @route   GET /api/results/:resultId
// @access  Private
export const getResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const result = await Result.findById(resultId)
      .populate('userId', 'name email')
      .populate('testId');

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found',
      });
    }

    if (result.userId._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this result',
      });
    }

    const detailedAnswers = result.answers.map((answer) => {
      const question = result.testId.questions[answer.questionIndex];
      return {
        questionIndex: answer.questionIndex,
        question: question.question,
        options: question.options,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: answer.correctAnswer,
        isCorrect: answer.isCorrect,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        resultId: result._id,
        testCode: result.testCode,
        topic: result.topic,
        difficulty: result.difficulty,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        rank: result.rank || 0,
        timeTaken: result.timeTaken,
        answers: detailedAnswers,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error('Get Result Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching result',
    });
  }
};

// @desc    Get results for a test code (teacher only)
// @route   GET /api/results/test/:testCode
// @access  Private
export const getTestResults = async (req, res) => {
  try {
    const { testCode } = req.params;
    const userId = req.userId;

    console.log(`📋 [GET TEST RESULTS] testCode=${testCode}, userId=${userId}`);

    const test = await Test.findOne({ testCode: String(testCode).toUpperCase() });

    if (!test) {
      console.log(`❌ [GET TEST RESULTS] Test not found for code: ${testCode}`);
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    console.log(`✅ [GET TEST RESULTS] Test found: _id=${test._id}, createdBy=${test.createdBy}`);

    if (!userId) {
      console.log(`⚠️ [GET TEST RESULTS] Missing userId`);
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view results for this test',
      });
    }

    // Check if user is the test creator OR a teacher viewing results for their classroom
    const isTestCreator = test.createdBy?.toString() === userId.toString();
    
    let isTeacherOfClassroom = false;
    if (test.classroomId) {
      const classroom = await Classroom.findById(test.classroomId);
      if (classroom && classroom.teacherId?.toString() === userId.toString()) {
        isTeacherOfClassroom = true;
      }
    }

    // Get user to check if they are a teacher
    const user = await User.findById(userId);
    const isTeacher = user?.role === 'teacher';

    console.log(`✅ [GET TEST RESULTS] isTestCreator=${isTestCreator}, isTeacherOfClassroom=${isTeacherOfClassroom}, isTeacher=${isTeacher}`);

    // Allow if: test creator OR classroom teacher OR any teacher user
    if (!isTestCreator && !isTeacherOfClassroom && !isTeacher) {
      console.log(`❌ [GET TEST RESULTS] Authorization failed. User is not authorized to view these results.`);
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view results for this test',
      });
    }

    console.log(`✅ [GET TEST RESULTS] Authorization passed. Fetching results...`);

    const results = await Result.find({ testId: test._id })
      .populate('userId', 'name email')
      .sort({ percentage: -1, timeTaken: 1, createdAt: -1 });

    console.log(`✅ [GET TEST RESULTS] Found ${results.length} results`);

    res.status(200).json({
      success: true,
      data: {
        testCode: test.testCode,
        topic: test.topic,
        results,
        total: results.length,
      },
    });
  } catch (error) {
    console.error('❌ Get Test Results Error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'Server error fetching results',
    });
  }
};

// @desc    Get test with full questions (for teachers viewing answer keys)
// @route   GET /api/tests/code/:testCode/full
// @access  Private (teachers only)
export const getTestWithAnswers = async (req, res) => {
  try {
    const { testCode } = req.params;
    const userId = req.userId;

    console.log(`📖 [GET TEST WITH ANSWERS] testCode=${testCode}, userId=${userId}`);

    const test = await Test.findOne({ testCode: String(testCode).toUpperCase() });

    if (!test) {
      console.log(`❌ [GET TEST WITH ANSWERS] Test not found for code: ${testCode}`);
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    console.log(`✅ [GET TEST WITH ANSWERS] Test found: _id=${test._id}, createdBy=${test.createdBy}`);

    if (!userId) {
      console.log(`⚠️ [GET TEST WITH ANSWERS] Missing userId`);
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this test',
      });
    }

    // Check if user is the test creator OR a teacher viewing results for their classroom
    const isTestCreator = test.createdBy?.toString() === userId.toString();
    
    let isTeacherOfClassroom = false;
    if (test.classroomId) {
      const classroom = await Classroom.findById(test.classroomId);
      if (classroom && classroom.teacherId?.toString() === userId.toString()) {
        isTeacherOfClassroom = true;
      }
    }

    // Get user to check if they are a teacher
    const user = await User.findById(userId);
    const isTeacher = user?.role === 'teacher';

    console.log(`✅ [GET TEST WITH ANSWERS] isTestCreator=${isTestCreator}, isTeacherOfClassroom=${isTeacherOfClassroom}, isTeacher=${isTeacher}`);

    // Allow if: test creator OR classroom teacher OR any teacher user
    if (!isTestCreator && !isTeacherOfClassroom && !isTeacher) {
      console.log(`❌ [GET TEST WITH ANSWERS] Authorization failed. User is not authorized.`);
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this test',
      });
    }

    console.log(`✅ [GET TEST WITH ANSWERS] Authorization passed. Returning full test...`);

    res.status(200).json({
      success: true,
      data: {
        _id: test._id,
        testId: test._id,
        testCode: test.testCode,
        title: test.title,
        topic: test.topic,
        difficulty: test.difficulty,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        questions: test.questions, // Include full questions with correct answers
        createdAt: test.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Get Test With Answers Error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'Server error fetching test',
    });
  }
};

// @desc    Publish a test (make it available to students)
// @route   PUT /api/tests/:testId/publish
// @access  Private
export const publishTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { classroomId } = req.body;
    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    // Check if user is the teacher who created this test
    const authorId = test.teacherId || test.createdBy;
    if (!authorId || authorId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to publish this test',
      });
    }

    // Set test as published
    test.isPublished = true;
    test.status = 'published';
    test.publishedAt = new Date();
    
    // Calculate expiration: test duration + 10 minutes
    const expirationMinutes = test.duration + 10;
    test.expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    
    console.log(`⏱️ Test will expire in ${expirationMinutes} minutes (at ${test.expiresAt.toISOString()})`);
    
    // Link to classroom if provided
    if (classroomId) {
      test.classroomId = classroomId;
      
      // Add test to classroom's tests array
      const classroom = await Classroom.findById(classroomId);
      if (classroom) {
        if (!classroom.tests.includes(testId)) {
          classroom.tests.push(testId);
          await classroom.save();
        }
        console.log(`✅ Test ${testId} linked to classroom ${classroomId}`);
      }
    }
    
    await test.save();

    const timestamp = new Date().toISOString();
    console.log(`\n✅ [${timestamp}] TEST PUBLISHED`);
    console.log(`   testId: ${testId}`);
    console.log(`   testCode: ${test.testCode}`);
    console.log(`   classroomId: ${test.classroomId || 'none'}`);
    console.log(`   isPublished: true`);
    console.log(`   expiresAt: ${test.expiresAt}`);

    res.status(200).json({
      success: true,
      message: 'Test published successfully',
      data: {
        testId: test._id,
        testCode: test.testCode,
        isPublished: test.isPublished,
        classroomId: test.classroomId || null,
        publishedAt: test.publishedAt,
        expiresAt: test.expiresAt,
        title: test.title,
        topic: test.topic,
        difficulty: test.difficulty,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        createdAt: test.createdAt,
      },
    });
  } catch (error) {
    console.error('Publish Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error publishing test',
    });
  }
};

// @desc    Get test preview (with correct answers visible to teacher only)
// @route   GET /api/tests/:testId/preview
// @access  Private
export const getTestPreview = async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    if (test.createdBy?.toString() !== req.userId?.toString() && test.teacherId?.toString() !== req.userId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this test',
      });
    }

    // Defensive checks for questions
    if (!test.questions || !Array.isArray(test.questions)) {
      return res.status(400).json({
        success: false,
        error: 'Test questions are missing or invalid',
      });
    }

    // Validate each question
    const validQuestions = test.questions.map((q, idx) => {
      if (!q.question || typeof q.question !== 'string') {
        throw new Error(`Question ${idx}: Invalid question field`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${idx}: Must have exactly 4 options`);
      }
      if (!q.correctAnswer || typeof q.correctAnswer !== 'string') {
        throw new Error(`Question ${idx}: Invalid correctAnswer field`);
      }
      if (typeof q.explanation !== 'string') {
        q.explanation = q.explanation ? String(q.explanation) : '';
      }

      return {
        question: q.question,
        options: q.options.map(o => String(o || '')),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      };
    });

    res.status(200).json({
      success: true,
      data: {
        testId: test._id,
        testCode: test.testCode,
        title: test.title,
        topic: test.topic,
        difficulty: test.difficulty,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        isPublished: test.isPublished,
        questions: validQuestions,
      },
    });
  } catch (error) {
    console.error('Get Test Preview Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching test preview',
    });
  }
};

// @desc    Link test to a classroom
// @route   PUT /api/tests/:testId/link-classroom
// @access  Private (teacher only)
export const linkTestToClassroom = async (req, res) => {
  try {
    const { testId } = req.params;
    const { classroomId } = req.body;
    const userId = req.userId;

    if (!classroomId) {
      return res.status(400).json({
        success: false,
        error: 'Classroom ID is required',
      });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    // Check if user is the teacher who created this test
    const authorId = test.teacherId || test.createdBy;
    if (!authorId || authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to link this test',
      });
    }

    // Verify classroom exists and user is the owner
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: 'Classroom not found',
      });
    }

    if (classroom.teacherId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not the owner of this classroom',
      });
    }

    // Link test to classroom
    test.classroomId = classroomId;
    await test.save();

    // Add test to classroom's tests array if not already there
    if (!classroom.tests.includes(testId)) {
      classroom.tests.push(testId);
      await classroom.save();
    }

    console.log(`✅ Test ${testId} linked to classroom ${classroomId}`);

    res.status(200).json({
      success: true,
      message: 'Test linked to classroom successfully',
      data: {
        testId: test._id,
        classroomId: test.classroomId,
        testCode: test.testCode,
      },
    });
  } catch (error) {
    console.error('Link Test to Classroom Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error linking test to classroom',
    });
  }
};

// @desc    Get question-wise analytics for a test
// @route   GET /api/tests/:testId/analytics
// @access  Private (teachers only)
export const getTestAnalytics = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.userId;

    console.log(`📊 [GET TEST ANALYTICS] testId=${testId}, userId=${userId}`);

    // Fetch the test
    const test = await Test.findById(testId);
    if (!test) {
      console.log(`❌ [GET TEST ANALYTICS] Test not found: ${testId}`);
      return res.status(404).json({
        success: false,
        error: 'Test not found',
      });
    }

    // Authorization: check if user is teacher
    const user = await User.findById(userId);
    if (!user || user.role !== 'teacher') {
      console.log(`❌ [GET TEST ANALYTICS] Not authorized. User role: ${user?.role}`);
      return res.status(403).json({
        success: false,
        error: 'Only teachers can view test analytics',
      });
    }

    console.log(`✅ [GET TEST ANALYTICS] Authorization passed. Fetching results...`);

    // Fetch all results for this test
    const results = await Result.find({ testId: testId });
    
    if (results.length === 0) {
      console.log(`ℹ️ [GET TEST ANALYTICS] No results found for test ${testId}`);
      return res.status(200).json({
        success: true,
        data: {
          testId: test._id,
          testCode: test.testCode,
          topic: test.topic,
          totalQuestions: test.totalQuestions,
          totalStudents: 0,
          questions: test.questions.map((q, idx) => ({
            questionIndex: idx,
            text: q.text,
            rightCount: 0,
            wrongCount: 0,
            accuracy: 0,
          })),
        },
      });
    }

    console.log(`✅ [GET TEST ANALYTICS] Found ${results.length} results`);

    // Build question-wise analytics
    const questionStats = {};

    // Initialize stats for each question
    test.questions.forEach((q, idx) => {
      questionStats[idx] = {
        text: q.text,
        rightCount: 0,
        wrongCount: 0,
      };
    });

    // Count correct/wrong answers per question
    results.forEach((result) => {
      result.answers.forEach((answer) => {
        const qIdx = answer.questionIndex;
        if (questionStats[qIdx]) {
          if (answer.isCorrect) {
            questionStats[qIdx].rightCount++;
          } else {
            questionStats[qIdx].wrongCount++;
          }
        }
      });
    });

    // Calculate accuracy and prepare final data
    const questionsAnalytics = Object.keys(questionStats)
      .map((idx) => {
        const stats = questionStats[idx];
        const total = stats.rightCount + stats.wrongCount;
        const accuracy = total > 0 ? Math.round((stats.rightCount / total) * 100) : 0;
        return {
          questionIndex: parseInt(idx),
          text: stats.text,
          rightCount: stats.rightCount,
          wrongCount: stats.wrongCount,
          accuracy,
        };
      })
      .sort((a, b) => a.wrongCount - b.wrongCount); // Sort by wrong count (ascending, so most wrong first)

    console.log(`✅ [GET TEST ANALYTICS] Analytics prepared for ${questionsAnalytics.length} questions`);

    res.status(200).json({
      success: true,
      data: {
        testId: test._id,
        testCode: test.testCode,
        topic: test.topic,
        totalQuestions: test.totalQuestions,
        totalStudents: results.length,
        questions: questionsAnalytics,
      },
    });
  } catch (error) {
    console.error('❌ Get Test Analytics Error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'Server error fetching test analytics',
    });
  }
};

