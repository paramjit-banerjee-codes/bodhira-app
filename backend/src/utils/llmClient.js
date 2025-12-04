import { GoogleGenerativeAI } from '@google/generative-ai';

let client = null;
let cachedWorkingModel = null;

// Model priority list - try in this order
const MODEL_LIST = [
  'models/gemini-2.0-flash',
];

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment');
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

/**
 * STRICT JSON SANITIZER
 * Cleans malformed JSON from LLM responses
 */
function sanitizeJSON(text) {
  if (!text) return '';
  
  // Remove markdown code blocks (``` ``` )
  let cleaned = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove any text before first '[' 
  const startIdx = cleaned.indexOf('[');
  if (startIdx !== -1) {
    cleaned = cleaned.substring(startIdx);
  }
  
  // Remove any text after last ']'
  const endIdx = cleaned.lastIndexOf(']');
  if (endIdx !== -1) {
    cleaned = cleaned.substring(0, endIdx + 1);
  }
  
  // Remove control characters except standard whitespace
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Clean up newline escape sequences inside strings
  cleaned = cleaned.replace(/\\n/g, ' ');
  cleaned = cleaned.replace(/\\r/g, ' ');
  cleaned = cleaned.replace(/\\t/g, ' ');
  
  return cleaned.trim();
}

/**
 * Call LLM with dynamic model selection, timeout, and caching
 * Automatically tries backup models if primary fails with 404
 * CRITICAL: Adds abort timeout to ensure <10 second response
 */
export async function callLLMWithRetry(prompt, maxRetries = 1) {
  const client = getClient();
  const LLM_TIMEOUT = 90000;  // 90 seconds timeout to allow full LLM response

  // Use cached model if available, otherwise start with first model
  let modelIndex = cachedWorkingModel ? MODEL_LIST.indexOf(cachedWorkingModel) : 0;
  let currentModel = null;
  let lastError = null;

  // Try each model in the list
  while (modelIndex < MODEL_LIST.length) {
    currentModel = MODEL_LIST[modelIndex];
    console.log(`🚀 Trying model: ${currentModel}`);

    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      const startTime = Date.now();
      
      try {
        console.log(`  Attempt ${attempt}/${maxRetries} (timeout: ${LLM_TIMEOUT}ms)`);
        
        const model = client.getGenerativeModel({ 
          model: currentModel,
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 20,
          }
        });

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, LLM_TIMEOUT);

        try {
          const result = await Promise.race([
            model.generateContent(prompt),
            new Promise((_, reject) => {
              controller.signal.addEventListener('abort', () => {
                reject(new Error(`LLM_TIMEOUT: No response within ${LLM_TIMEOUT}ms`));
              });
            })
          ]);

          clearTimeout(timeoutId);
          let responseText = result.response.text();
          const duration = Date.now() - startTime;

          // SANITIZE the response
          responseText = sanitizeJSON(responseText);

          console.log(`✅ Success with ${currentModel} (${duration}ms)`);
          
          // Cache the working model for future calls
          cachedWorkingModel = currentModel;

          return {
            success: true,
            text: responseText,
            attempt,
            code: 'SUCCESS',
            message: 'LLM call successful',
            duration,
            model: currentModel,
          };
        } catch (timeoutError) {
          clearTimeout(timeoutId);
          throw timeoutError;
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        lastError = error;
        
        // Check if it's a "model not found" error
        const is404Error = 
          error.message.includes('404') || 
          error.message.includes('not found') ||
          error.message.includes('not supported for generateContent') ||
          error.message.includes('INVALID_ARGUMENT');

        if (is404Error) {
          console.log(`  ❌ Model not available: ${error.message}`);
          // Break inner loop to try next model
          break;
        }

        // For other errors, retry current model
        const isRecoverable = 
          error.message.includes('429') || 
          error.message.includes('RESOURCE_EXHAUSTED') ||
          error.message.includes('DEADLINE_EXCEEDED');

        if (isRecoverable && attempt < maxRetries) {
          console.log(`  ⏳ Recoverable error, retrying in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        if (!is404Error) {
          // Non-404 non-recoverable error - fail immediately
          console.error(`  ❌ Error (${duration}ms): ${error.message}`);
          return {
            success: false,
            error: error.message,
            code: 'LLM_ERROR',
            message: error.message,
            attempt,
            duration,
            model: currentModel,
          };
        }
      }
    }

    // If we got here, this model failed - try next model
    modelIndex++;
  }

  // All models failed
  console.error(`❌ All models exhausted. Last error: ${lastError?.message || 'Unknown'}`);
  return {
    success: false,
    error: lastError?.message || 'All models failed',
    code: 'ALL_MODELS_FAILED',
    message: `Exhausted all ${MODEL_LIST.length} models`,
    model: 'none',
  };
}
