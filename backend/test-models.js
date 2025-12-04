import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

console.log('API Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 15));
console.log('API Key length:', process.env.GEMINI_API_KEY?.length);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testAPI() {
  try {
    console.log('\n🔍 Testing Gemini API...\n');

    // Test with the most common working model
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-2.0-flash',
    });

    console.log('Sending test prompt...');
    const result = await model.generateContent('Say hello in one word');
    const response = await result.response;
    const text = response.text();

    console.log('✅ SUCCESS! API is working!');
    console.log('Response:', text);
    console.log('\n✅ Your API key is valid and working!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message.includes('API key not valid')) {
      console.log('\n🔴 Your API key is INVALID or EXPIRED');
      console.log('👉 Get a new key from: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('404')) {
      console.log('\n🔴 Model not found - your API key might not have Gemini API access');
      console.log('👉 Check if Gemini API is enabled: https://aistudio.google.com/');
    } else if (error.message.includes('429')) {
      console.log('\n🔴 Rate limit exceeded - wait a few minutes and try again');
    }
  }
}

testAPI();