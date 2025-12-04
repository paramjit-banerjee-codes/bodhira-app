# Changed Code Files - OpenAI Migration

## Backend Files

### 1. backend/package.json
```json
{
  "dependencies": {
    "openai": "^4.52.0"  // ADDED (removed @google/generative-ai)
  }
}
```

### 2. backend/src/utils/openaiClient.js (NEW)
```javascript
import OpenAI from 'openai';

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment');
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export async function callOpenAI(prompt) {
  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      return { success: false, message: 'Empty response from OpenAI' };
    }

    return { success: true, text };
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    return { success: false, message: error.message || 'OpenAI API call failed' };
  }
}
```

### 3. backend/src/controllers/generationController.js (REWRITTEN)
```javascript
import asyncHandler from '../middleware/asyncHandler.js';
import Test from '../models/Test.js';
import { callOpenAI } from '../utils/openaiClient.js';
import { parseTestQuestions, createTestObject } from '../utils/testGenerationHelpers.js';

export const generateTestRequest = asyncHandler(async (req, res) => {
  const { topic, difficulty = 'medium', numberOfQuestions = 10 } = req.body;
  const userId = req.userId;

  // Validation
  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Topic is required' });
  }
  if (numberOfQuestions < 1 || numberOfQuestions > 50) {
    return res.status(400).json({ success: false, error: 'Questions must be 1-50' });
  }
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ success: false, error: 'Invalid difficulty' });
  }

  try {
    console.log(`[GENERATION] Starting: topic=${topic}, qty=${numberOfQuestions}, difficulty=${difficulty}`);

    const difficultyGuide = {
      easy: 'basic facts and definitions',
      medium: 'apply concepts and problem-solving',
      hard: 'complex analysis and critical thinking'
    };

    const prompt = `You are an expert test creator. Generate exactly ${numberOfQuestions} multiple choice questions about "${topic}" at ${difficulty} level (${difficultyGuide[difficulty]}).

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

    // Call OpenAI
    const llmResult = await callOpenAI(prompt);
    if (!llmResult.success) {
      console.error(`❌ LLM failed: ${llmResult.message}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate test from AI',
        details: llmResult.message,
      });
    }

    // Parse JSON
    let questionsData;
    try {
      questionsData = JSON.parse(llmResult.text);
    } catch (parseError) {
      console.error(`❌ Failed to parse LLM JSON: ${parseError.message}`);
      return res.status(500).json({
        success: false,
        error: 'Invalid JSON response from AI',
        details: parseError.message,
      });
    }

    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response format from AI',
      });
    }

    // Parse and validate questions
    let questions;
    try {
      questions = parseTestQuestions(JSON.stringify(questionsData.questions));
      if (!questions || questions.length === 0) {
        throw new Error('No valid questions parsed');
      }
    } catch (parseError) {
      console.error(`❌ Question parsing failed: ${parseError.message}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse generated questions',
        details: parseError.message,
      });
    }

    // Create and save test
    const testData = createTestObject({
      topic,
      questions,
      difficulty,
      numberOfQuestions: questions.length,
    });

    const test = await Test.create({
      ...testData,
      teacherId: userId,
    });

    console.log(`✅ [GENERATION SUCCESS] testCode=${test.testCode}, questions=${questions.length}`);

    res.status(201).json({
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
    });
  } catch (error) {
    console.error(`❌ [GENERATION ERROR] ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Test generation failed',
      details: error.message,
    });
  }
});

export const getTestByCode = async (req, res) => {
  try {
    const { testCode } = req.params;
    const test = await Test.findOne({
      testCode: String(testCode).toUpperCase(),
      isPublished: true,
    }).select('-questions.correctAnswer');

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found or not published',
      });
    }

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
```

### 4. backend/src/utils/testGenerationHelpers.js (UPDATED)
```javascript
// Removed: sanitizeLLMResponse() function
// Updated: parseTestQuestions() to handle OpenAI format

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
      if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
        throw new Error(`Question ${idx}: Invalid 'question' field`);
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${idx}: Must have exactly 4 options`);
      }

      const normalizedOptions = q.options.map((opt, optIdx) => {
        if (!opt || typeof opt !== 'string') {
          throw new Error(`Question ${idx}, Option ${optIdx}: Invalid option`);
        }
        return opt.trim();
      });

      if (!q.correctAnswer || typeof q.correctAnswer !== 'string') {
        throw new Error(`Question ${idx}: Invalid 'correctAnswer' field`);
      }

      const correctAnswer = q.correctAnswer.trim();
      const answerExists = normalizedOptions.some(opt => opt === correctAnswer);
      if (!answerExists) {
        throw new Error(
          `Question ${idx}: correctAnswer "${correctAnswer}" does not match any option`
        );
      }

      let explanation = q.explanation || '';
      if (typeof explanation !== 'string') {
        explanation = String(explanation);
      }
      explanation = explanation.replace(/[\n\r\t]+/g, ' ').trim();

      return {
        questionNumber: idx + 1,
        question: q.question.trim(),
        options: normalizedOptions,
        correctAnswer: correctAnswer,
        explanation: explanation,
      };
    });

    return validatedQuestions;
  } catch (error) {
    console.error('❌ Parse error:', error.message);
    throw error;
  }
}
```

### 5. backend/src/routes/testRoutes.js (UPDATED)
```javascript
import {
  generateTestRequest,
  getTestByCode,  // NOW from generationController
} from '../controllers/generationController.js';

// Removed getGenerationStatus import

// ... rest of routes

router.post('/generate', generateTestRequest);
// REMOVED: router.get('/generate/status/:requestId', getGenerationStatus);
```

---

## Frontend Files

### 1. frontend/src/components/GenerationStatusModal.jsx (REWRITTEN)
```jsx
import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { testAPI } from '../services/api';
import toast from '../utils/toast';
import '../pages/GenerateTest.css';

export default function GenerationStatusModal({
  topic,
  difficulty,
  numberOfQuestions,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [status, setStatus] = useState('generating');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Call API to generate test
  useEffect(() => {
    if (!isOpen) return;

    const generate = async () => {
      try {
        setStatus('generating');
        setError(null);
        
        const response = await testAPI.generateTest({
          topic,
          difficulty,
          numberOfQuestions,
        });

        if (response.success && response.data) {
          setStatus('success');
          setResult(response.data);
          onSuccess(response.data);
        } else {
          setStatus('failed');
          setError({ message: response.error || 'Generation failed' });
        }
      } catch (err) {
        console.error('Generation error:', err);
        setStatus('failed');
        setError({ message: err.message || 'Generation failed' });
      }
    };

    generate();
  }, [isOpen, topic, difficulty, numberOfQuestions, onSuccess]);

  return (
    isOpen && (
      <div className="modal-overlay" style={{ zIndex: 1000 }}>
        <div className="modal-content" style={{ maxWidth: '500px' }}>
          <div className="modal-header">
            <h2>Generating Test...</h2>
            <button onClick={onClose} className="modal-close-btn">
              <X size={20} />
            </button>
          </div>

          <div className="modal-body" style={{ padding: '40px 24px' }}>
            {status === 'generating' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <Loader size={64} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
                </div>
                <h3 style={{ color: '#e2e8f0', marginBottom: '12px' }}>
                  Generating Questions...
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>
                  AI is generating your test questions. This usually takes 2-5 seconds.
                </p>
              </div>
            ) : status === 'success' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <CheckCircle size={64} style={{ color: '#10b981' }} />
                </div>
                <h3 style={{ color: '#e2e8f0', marginBottom: '12px' }}>
                  Test Generated Successfully! ✅
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>
                  Your test has been created and is ready for preview.
                </p>
                {result && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
                    <p style={{ color: '#a7f3d0', fontSize: '12px', margin: '0 0 8px 0' }}>
                      <strong>Test Details:</strong>
                    </p>
                    <p style={{ color: '#d1fae5', fontSize: '13px', margin: '4px 0' }}>
                      • Questions: {result.totalQuestions}
                    </p>
                    <p style={{ color: '#d1fae5', fontSize: '13px', margin: '4px 0' }}>
                      • Difficulty: {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}
                    </p>
                    <p style={{ color: '#d1fae5', fontSize: '13px', margin: '4px 0' }}>
                      • Duration: {result.duration} minutes
                    </p>
                  </div>
                )}
              </div>
            ) : status === 'failed' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <AlertCircle size={64} style={{ color: '#ef4444' }} />
                </div>
                <h3 style={{ color: '#e2e8f0', marginBottom: '12px' }}>
                  Generation Failed
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>
                  {error?.message || 'The AI service encountered an error.'}
                </p>
                <button onClick={() => { onClose(); toast.info('Please try again.'); }} className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Close
                </button>
              </div>
            ) : null}
          </div>

          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            /* ...rest of styles... */
          `}</style>
        </div>
      </div>
    )
  );
}
```

### 2. frontend/src/pages/GenerateTest.jsx (UPDATED)
```jsx
// Changed: handleSubmit now just opens modal (no API call here)
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setGeneratedTest(null);
  setCopySuccess(false);

  try {
    console.log('Generating test with:', formData);
    setShowGenerationModal(true);
  } catch (err) {
    console.error('Error:', err);
    setError('Failed to start test generation. Please try again.');
  }
};

// Changed: Modal props now pass test parameters
{showGenerationModal && (
  <GenerationStatusModal
    topic={formData.topic}
    difficulty={formData.difficulty}
    numberOfQuestions={formData.numberOfQuestions}
    isOpen={showGenerationModal}
    onClose={() => setShowGenerationModal(false)}
    onSuccess={handleGenerationSuccess}
  />
)}
```

---

## Summary of All Changed Files

### Backend (5 files):
1. ✅ package.json - Added openai SDK
2. ✅ utils/openaiClient.js - NEW FILE
3. ✅ controllers/generationController.js - REWRITTEN
4. ✅ utils/testGenerationHelpers.js - UPDATED
5. ✅ routes/testRoutes.js - UPDATED

### Frontend (2 files):
1. ✅ components/GenerationStatusModal.jsx - REWRITTEN
2. ✅ pages/GenerateTest.jsx - UPDATED

**Total Changes: 7 files**
**Lines Added/Changed: ~400**
**Lines Removed: ~600 (queue/polling logic)**
