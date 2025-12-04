import crypto from 'crypto';

/**
 * Generate a unique request ID for tracking generation requests
 */
export function generateRequestId() {
  return `gen_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Parse test questions from LLM response
 */
export function parseTestQuestions(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Response text is empty');
    }

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Invalid JSON: ${parseError.message}`);
    }

    // Handle both array and object with questions property
    let questions = parsed;
    if (!Array.isArray(parsed)) {
      if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else {
        throw new Error('Response must be an array or object with questions array');
      }
    }

    // Validate and normalize questions
    const validatedQuestions = questions.map((q, idx) => {
      // Validate question field
      if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
        throw new Error(`Question ${idx}: Invalid 'question' field`);
      }

      // Validate options field
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${idx}: Must have exactly 4 options, got ${Array.isArray(q.options) ? q.options.length : 'not array'}`);
      }

      const normalizedOptions = q.options.map((opt, optIdx) => {
        if (!opt || typeof opt !== 'string') {
          throw new Error(`Question ${idx}, Option ${optIdx}: All options must be non-empty strings`);
        }
        return opt.trim();
      });

      // Validate correctAnswer
      let correctAnswerValue = q.correctAnswer;
      let correctAnswerIndex = -1;

      // Handle both formats: number (0-3 index) and string (matching option)
      if (typeof correctAnswerValue === 'number') {
        // OpenAI format: correctAnswer is the index
        if (correctAnswerValue < 0 || correctAnswerValue >= 4) {
          throw new Error(
            `Question ${idx}: correctAnswer index must be 0-3, got ${correctAnswerValue}`
          );
        }
        correctAnswerIndex = correctAnswerValue;
        correctAnswerValue = normalizedOptions[correctAnswerIndex];
      } else if (typeof correctAnswerValue === 'string') {
        // String format: find matching option
        correctAnswerValue = correctAnswerValue.trim();
        correctAnswerIndex = normalizedOptions.indexOf(correctAnswerValue);
        if (correctAnswerIndex === -1) {
          throw new Error(
            `Question ${idx}: correctAnswer "${correctAnswerValue}" does not match any option`
          );
        }
      } else {
        throw new Error(`Question ${idx}: Invalid 'correctAnswer' field`);
      }

      // Validate explanation
      let explanation = q.explanation || '';
      if (typeof explanation !== 'string') {
        explanation = String(explanation);
      }
      explanation = explanation.replace(/[\n\r\t]+/g, ' ').trim();

      return {
        questionNumber: idx + 1,
        question: q.question.trim(),
        options: normalizedOptions,
        correctAnswer: String(correctAnswerIndex),
        explanation: explanation,
      };
    });

    return validatedQuestions;
  } catch (error) {
    console.error('❌ Parse error:', error.message);
    throw error;
  }
}

/**
 * Generate a unique test code
 */
export function generateTestCode() {
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  console.log(`[TESTCODE GENERATED] ${code}`);
  return code;
}

/**
 * Create a valid test object from generation result
 */
export function createTestObject(generationData) {
  const { topic, questions, difficulty, numberOfQuestions } = generationData;
  const testCode = generateTestCode();
  
  console.log(`[CREATE TEST OBJECT] testCode=${testCode}, questions=${questions.length}, isPublished=true`);

  return {
    title: `${topic} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`,
    topic: topic,
    difficulty: difficulty,
    questions: questions,
    totalQuestions: questions.length,
    duration: Math.ceil(numberOfQuestions * 1.5),
    testCode: testCode,
    status: 'published',
    isPublished: true,
    isPublic: true,
    avgScore: 0,
  };
}
