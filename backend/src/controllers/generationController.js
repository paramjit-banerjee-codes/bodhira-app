import asyncHandler from '../middleware/asyncHandler.js';
import Test from '../models/Test.js';
import User from '../models/User.js';
import Classroom from '../models/Classroom.js';
import Subscription from '../models/Subscription.js';
import { callOpenAI } from '../utils/openaiClient.js';
import {
  parseTestQuestions,
  createTestObject,
} from '../utils/testGenerationHelpers.js';

// Constants for test generation limits
const TEST_GENERATION_LIMITS = {
  FREE_TEACHER: 5,        // Unpaid teachers can generate max 5 tests
  UNLIMITED: Infinity      // Subscribed/paid users get unlimited
};

/**
 * Check if user can generate a test based on subscription status
 * CRITICAL: This uses generation_count (cumulative lifetime counter) NOT current test count
 * The counter NEVER resets, even when tests are deleted - it tracks total usage for free tier limit
 * @param {string} userId - User ID
 * @returns {Promise<{canGenerate: boolean, remaining: number, limit: number, message: string}>}
 */
async function checkTestGenerationLimit(userId) {
  try {
    // Check if user has active subscription
    const activeSubscription = await Subscription.findOne({
      userId,
      status: 'active',
      expiryDate: { $gt: new Date() }
    });

    // If user has active subscription, unlimited generation
    if (activeSubscription) {
      return {
        canGenerate: true,
        remaining: Infinity,
        limit: Infinity,
        isPaid: true,
        message: 'Unlimited test generation (Premium)'
      };
    }

    // CRITICAL: Use generation_count field - this is cumulative lifetime counter that NEVER resets
    // Deleting tests does NOT decrease this counter
    const user = await User.findById(userId).select('generation_count createdTests');
    
    // Ensure generation_count exists (for existing users who may not have this field)
    if (user && user.generation_count === undefined) {
      user.generation_count = 0;
      await user.save();
    }
    
    // Use generation_count - this is the cumulative lifetime counter
    // CRITICAL: Never sync with createdTests.length because deleted tests reduce that array
    // but generation_count must stay the same to track total usage for quota enforcement
    let testCount = user?.generation_count || 0;
    const actualCreatedCount = user?.createdTests?.length || 0;
    
    // Log if there's a mismatch but DON'T correct it
    // Mismatches happen when tests are deleted (createdTests reduced but generation_count preserved)
    if (testCount !== actualCreatedCount) {
      console.log(`ℹ️  [GENERATION COUNT INFO] generation_count=${testCount} (cumulative), createdTests.length=${actualCreatedCount} (current). This is normal after deleting tests.`);
    }

    const limit = TEST_GENERATION_LIMITS.FREE_TEACHER;
    const remaining = Math.max(0, limit - testCount);
    const canGenerate = remaining > 0;

    console.log(`📊 [LIMIT CHECK] userId=${userId}, Tests generated (lifetime): ${testCount}, Remaining: ${remaining}/${limit}, createdTests.length=${actualCreatedCount}`);

    return {
      canGenerate,
      remaining,
      limit,
      isPaid: false,
      message: canGenerate 
        ? `You can generate ${remaining} more test(s) (Free tier limit: ${limit})`
        : `Test generation limit reached. Upgrade to Premium for unlimited generation`
    };
  } catch (error) {
    console.error('❌ Error checking test generation limit:', error);
    throw error;
  }
}

/**
 * @desc    Check current test generation quota for user
 * @route   GET /api/tests/quota
 * @access  Private
 */
export const getQuotaStatus = asyncHandler(async (req, res) => {
  const userId = req.userId;
  
  try {
    const quotaStatus = await checkTestGenerationLimit(userId);
    
    res.status(200).json({
      success: true,
      data: quotaStatus
    });
  } catch (error) {
    console.error('❌ Error fetching quota status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quota status'
    });
  }
});

/**
 * @desc    Generate a test INSTANTLY using OpenAI
 * @route   POST /api/tests/generate
 * @access  Private (Teacher)
 * @returns Complete test object with all questions
 */
export const generateTestRequest = asyncHandler(async (req, res) => {
  const { topic, difficulty = 'medium', numberOfQuestions = 10, provided_content } = req.body;
  const userId = req.userId;

  // CHECK TEST GENERATION LIMIT
  const limitCheck = await checkTestGenerationLimit(userId);
  console.log(`📊 [LIMIT CHECK] User: ${userId}, Can generate: ${limitCheck.canGenerate}, Remaining: ${limitCheck.remaining}/${limitCheck.limit}`);
  
  if (!limitCheck.canGenerate) {
    return res.status(403).json({
      success: false,
      error: limitCheck.message,
      limitReached: true,
      isPaid: limitCheck.isPaid,
      remaining: limitCheck.remaining,
      limit: limitCheck.limit
    });
  }

  // Validate input
  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Topic is required' });
  }

  if (numberOfQuestions < 1 || numberOfQuestions > 50) {
    return res.status(400).json({
      success: false,
      error: 'Number of questions must be between 1 and 50',
    });
  }

  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({
      success: false,
      error: 'Difficulty must be easy, medium, or hard',
    });
  }

  // Validate provided_content if it exists
  let useProvidedContent = false;
  if (provided_content) {
    const contentLength = provided_content.trim().length;
    if (contentLength > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long. Please reduce to below 10,000 characters.',
      });
    }
    if (contentLength >= 150) {
      useProvidedContent = true;
    }
  }

  try {
    // Use setImmediate to prevent blocking the event loop
    setImmediate(() => {
      const contentInfo = useProvidedContent ? ` [from provided content: ${provided_content.length} chars]` : '';
      console.log(`[GENERATION] Starting: topic=${topic}, qty=${numberOfQuestions}, difficulty=${difficulty}${contentInfo}`);
    });

    // Build prompt for OpenAI
    const difficultyGuide = {
      easy: 'basic facts and definitions',
      medium: 'apply concepts and problem-solving',
      hard: 'complex analysis and critical thinking'
    };

    let prompt;
    if (useProvidedContent) {
      prompt = `You are a test generator AI. Generate exactly ${numberOfQuestions} multiple choice questions about "${topic}" at ${difficulty} level (${difficultyGuide[difficulty]}). Generate questions ONLY from the provided content below. Do NOT use external knowledge.

PROVIDED CONTENT:
${provided_content}

Return ONLY a valid JSON object with no additional text:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    }
  ]
}

Rules:
- Generate questions ONLY from the provided content
- Do NOT use knowledge outside the provided text
- Return exactly ${numberOfQuestions} questions
- Each question must have exactly 4 options
- correctAnswer must match one of the 4 options exactly
- explanation should be 1-2 sentences
- All fields are required
- Return ONLY valid JSON, no markdown or code blocks`;
    } else {
      prompt = `You are an expert test creator. Generate exactly ${numberOfQuestions} multiple choice questions about "${topic}" at ${difficulty} level (${difficultyGuide[difficulty]}).

Return ONLY a valid JSON object with no additional text:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    }
  ]
}

Rules:
- Return exactly ${numberOfQuestions} questions
- Each question must have exactly 4 options
- correctAnswer must match one of the 4 options exactly
- explanation should be 1-2 sentences
- All fields are required
- Return ONLY valid JSON, no markdown or code blocks`;
    }

    // Call OpenAI
    const llmResult = await callOpenAI(prompt);

    if (!llmResult.success) {
      setImmediate(() => {
        console.error(`❌ LLM failed: ${llmResult.message}`);
      });
      return res.status(500).json({
        success: false,
        error: 'Failed to generate test from AI',
        details: llmResult.message,
      });
    }

    // Parse the JSON response
    let questionsData;
    try {
      questionsData = JSON.parse(llmResult.text);
    } catch (parseError) {
      setImmediate(() => {
        console.error(`❌ Failed to parse LLM JSON: ${parseError.message}`);
      });
      return res.status(500).json({
        success: false,
        error: 'Invalid JSON response from AI',
        details: parseError.message,
      });
    }

    // Handle both formats: array or object with questions property
    let questionsArray = questionsData;
    if (questionsData && typeof questionsData === 'object' && !Array.isArray(questionsData)) {
      if (questionsData.questions && Array.isArray(questionsData.questions)) {
        questionsArray = questionsData.questions;
      }
    }

    if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response format from AI - expected array of questions',
      });
    }

    // Parse and validate questions
    let questions;
    try {
      questions = parseTestQuestions(
        JSON.stringify(questionsArray)
      );

      if (!questions || questions.length === 0) {
        throw new Error('No valid questions parsed');
      }
    } catch (parseError) {
      setImmediate(() => {
        console.error(`❌ Question parsing failed: ${parseError.message}`);
      });
      return res.status(500).json({
        success: false,
        error: 'Failed to parse generated questions',
        details: parseError.message,
      });
    }

    // Create test object
    const testData = createTestObject({
      topic,
      questions,
      difficulty,
      numberOfQuestions: questions.length,
    });

    // Save test to database
    const test = await Test.create({
      ...testData,
      teacherId: userId,
      isPublished: false,  // Start as draft - teacher must publish manually
      isPublic: false,     // Keep private until teacher publishes
      status: 'draft',     // Status is draft until published
    });

    // Add test to user's createdTests array AND increment generation_count by exactly 1
    // IMPORTANT: generation_count is cumulative lifetime counter - NEVER reset or decremented
    // even if tests are deleted. This tracks total usage for free tier limit enforcement.
    await User.findByIdAndUpdate(
      userId,
      { 
        $push: { createdTests: test._id },
        $inc: { generation_count: 1 }  // Increment lifetime counter by 1 (MongoDB atomic operation)
      },
      { new: true }
    );

    console.log(`✅ [GENERATION COUNT INCREMENTED] userId=${userId}, testCode=${test.testCode}, cumulative_generation_count now increased`);

    // Log asynchronously to prevent blocking
    setImmediate(() => {
      const contentInfo = useProvidedContent ? ` [from provided content]` : '';
      console.log(`✅ [GENERATION SUCCESS] testCode=${test.testCode}, isPublished=${test.isPublished}, status=${test.status}, questions=${questions.length}${contentInfo}`);
    });
    
    // Prepare response - send immediately without awaiting logs
    const responsePayload = {
      success: true,
      message: 'Test generated successfully',
      data: {
        _id: test._id,
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
        isPublished: test.isPublished,
        createdAt: test.createdAt,
      },
    };

    // Send response immediately - this is the critical fix
    res.status(201).json(responsePayload);
    
    // Log after response sent
    setImmediate(() => {
      console.log(`📤 [BACKEND] Response sent immediately for testCode=${test.testCode}`);
    });
  } catch (error) {
    setImmediate(() => {
      console.error(`❌ [GENERATION ERROR] ${error.message}`);
    });
    return res.status(500).json({
      success: false,
      error: 'Test generation failed',
      details: error.message,
    });
  }
});

/**
 * @desc    Get test by code for taking test
 * @route   GET /api/tests/code/:testCode
 * @access  Public (anyone can join with code)
 */
export const getTestByCode = async (req, res) => {
  try {
    const { testCode } = req.params;
    console.log(`🔍 [GET TEST BY CODE] Looking for testCode: ${testCode}`);
    
    const test = await Test.findOne({
      testCode: String(testCode).toUpperCase(),
      isPublished: true,
    }).select('-questions.correctAnswer');

    if (!test) {
      console.log(`❌ [GET TEST BY CODE] Not found: testCode=${testCode}, isPublished=true`);
      return res.status(404).json({
        success: false,
        error: 'Test not found or not published',
      });
    }

    // Check if test has expired
    const now = new Date();
    if (test.expiresAt && now > test.expiresAt) {
      console.log(`⏰ [GET TEST BY CODE] Test expired: testCode=${testCode}, expiresAt=${test.expiresAt}`);
      return res.status(410).json({
        success: false,
        error: 'This test has expired and is no longer available',
        expiredAt: test.expiresAt,
      });
    }

    console.log(`✅ [GET TEST BY CODE] Found: testCode=${test.testCode}, questions=${test.questions.length}`);

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
        questions: test.questions.map((q) => ({
          question: q.question,
          options: q.options,
        })),
        expiresAt: test.expiresAt,
      },
    });
  } catch (error) {
    console.error('❌ Get test by code error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error fetching test',
    });
  }
};

/**
 * @desc    Generate a test INSTANTLY for a classroom using OpenAI
 * @route   POST /api/classrooms/:id/tests/generate
 * @access  Private (Classroom Teacher)
 * @returns Complete test object with all questions and classroom link
 */
export const generateClassroomTestRequest = asyncHandler(async (req, res) => {
  const { topic, difficulty = 'medium', numberOfQuestions = 10, provided_content } = req.body;
  const userId = req.userId;
  const classroomId = req.params.id;

  // CHECK TEST GENERATION LIMIT
  const limitCheck = await checkTestGenerationLimit(userId);
  console.log(`📊 [LIMIT CHECK - CLASSROOM] User: ${userId}, Can generate: ${limitCheck.canGenerate}, Remaining: ${limitCheck.remaining}/${limitCheck.limit}`);
  
  if (!limitCheck.canGenerate) {
    return res.status(403).json({
      success: false,
      error: limitCheck.message,
      limitReached: true,
      isPaid: limitCheck.isPaid,
      remaining: limitCheck.remaining,
      limit: limitCheck.limit
    });
  }

  // Validate input
  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Topic is required' });
  }

  if (numberOfQuestions < 1 || numberOfQuestions > 50) {
    return res.status(400).json({
      success: false,
      error: 'Number of questions must be between 1 and 50',
    });
  }

  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({
      success: false,
      error: 'Difficulty must be easy, medium, or hard',
    });
  }

  // Validate provided_content if it exists
  let useProvidedContent = false;
  if (provided_content) {
    const contentLength = provided_content.trim().length;
    if (contentLength > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long. Please reduce to below 10,000 characters.',
      });
    }
    if (contentLength >= 150) {
      useProvidedContent = true;
    }
  }

  // Build prompt for OpenAI
  let prompt;
  if (useProvidedContent) {
    prompt = `You are a test generator AI. Generate exactly ${numberOfQuestions} multiple choice questions about "${topic}" at ${difficulty} difficulty level. Generate questions ONLY from the provided content below. Do NOT use external knowledge.

PROVIDED CONTENT:
${provided_content}

Return ONLY valid JSON array with NO markdown, NO code blocks, NO explanations:

[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

RULES:
- Generate questions ONLY from the provided content
- Do NOT use knowledge outside the provided text
- Each question MUST have exactly 4 options
- correctAnswer MUST be 0-3 (index of correct option)
- Generate exactly ${numberOfQuestions} questions
- NO markdown formatting, NO code blocks, NO explanation text
- Return ONLY the JSON array`;
  } else {
    prompt = `Generate exactly ${numberOfQuestions} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

Return ONLY valid JSON array with NO markdown, NO code blocks, NO explanations:

[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

RULES:
- Each question MUST have exactly 4 options
- correctAnswer MUST be 0-3 (index of correct option)
- Generate exactly ${numberOfQuestions} questions
- NO markdown formatting, NO code blocks, NO explanation text
- Return ONLY the JSON array`;
  }

  // Call OpenAI
  const openaiResult = await callOpenAI(prompt);
  if (!openaiResult.success) {
    return res.status(500).json({
      success: false,
      error: 'Failed to generate test: ' + openaiResult.message,
    });
  }

  // Parse questions
  let questions;
  try {
    questions = parseTestQuestions(openaiResult.text);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to parse questions: ' + error.message,
    });
  }

  // Create test
  const test = createTestObject(
    topic,
    difficulty,
    questions,
    userId,
    true // isPublished
  );

  // Save test
  const savedTest = await Test.create(test);

  // Link test to classroom
  await Classroom.findByIdAndUpdate(classroomId, {
    $push: { tests: savedTest._id },
  });

  // Add test to user's createdTests array AND increment generation_count by exactly 1
  // IMPORTANT: generation_count is cumulative lifetime counter - NEVER reset or decremented
  // even if tests are deleted. This tracks total usage for free tier limit enforcement.
  await User.findByIdAndUpdate(
    userId,
    { 
      $push: { createdTests: savedTest._id },
      $inc: { generation_count: 1 }  // Increment lifetime counter by 1 (MongoDB atomic operation)
    },
    { new: true }
  );

  console.log(`✅ [GENERATION COUNT INCREMENTED - CLASSROOM] userId=${userId}, testCode=${savedTest.testCode}, cumulative_generation_count now increased`);

  // Return success response
  res.status(201).json({
    success: true,
    message: 'Test generated and linked to classroom',
    data: {
      _id: savedTest._id,
      testId: savedTest._id,
      testCode: savedTest.testCode,
      title: savedTest.title,
      topic: savedTest.topic,
      difficulty: savedTest.difficulty,
      questions: savedTest.questions,
      duration: savedTest.duration,
      totalQuestions: savedTest.totalQuestions,
      isPublished: savedTest.isPublished,
      createdAt: savedTest.createdAt,
    },
  });
});
