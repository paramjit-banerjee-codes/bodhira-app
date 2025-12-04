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

/**
 * Call OpenAI with gpt-4o-mini for test generation
 * Returns { success: true, text: jsonString } or { success: false, message: error }
 */
export async function callOpenAI(prompt) {
  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content;

    if (!text) {
      return {
        success: false,
        message: 'Empty response from OpenAI',
      };
    }

    return {
      success: true,
      text: text,
    };
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    return {
      success: false,
      message: error.message || 'OpenAI API call failed',
    };
  }
}
