/**
 * TEST FILE: Generate a sample GATE DSA mock test and display results
 * 
 * Run this file from terminal:
 * node backend/utils/testGenerator.js
 * 
 * This will generate and print a 50-question mock test
 */

import { generateGatePaper } from './generateGateSubjectPaper.js';

// ============================================================
// TEST 1: Generate a GATE DSA mock test
// ============================================================
console.log('='.repeat(60));
console.log('       GATE SUBJECT-WISE MOCK TEST GENERATOR - TEST');
console.log('='.repeat(60));

// Call the main function with subject "DSA"
const mockTest = generateGatePaper('DSA');

// ============================================================
// Display the results
// ============================================================

if (mockTest.length === 0) {
  console.log('❌ Test generation failed!');
  process.exit(1);
}

console.log('📋 MOCK TEST STRUCTURE:');
console.log('-'.repeat(60));

// Count statistics
const oneMarkCount = mockTest.filter(q => q.marks === 1).length;
const twoMarkCount = mockTest.filter(q => q.marks === 2).length;
const totalMarks = oneMarkCount * 1 + twoMarkCount * 2;

console.log(`✓ Total Questions: ${mockTest.length}`);
console.log(`  • 1-mark questions: ${oneMarkCount}`);
console.log(`  • 2-mark questions: ${twoMarkCount}`);
console.log(`  • Total marks: ${totalMarks}`);

// Show difficulty distribution
const easy = mockTest.filter(q => q.difficulty === 'easy').length;
const medium = mockTest.filter(q => q.difficulty === 'medium').length;
const hard = mockTest.filter(q => q.difficulty === 'hard').length;

console.log(`\n✓ Difficulty Distribution:`);
console.log(`  • Easy: ${easy} questions`);
console.log(`  • Medium: ${medium} questions`);
console.log(`  • Hard: ${hard} questions`);

// Show topic distribution
const topics = {};
mockTest.forEach(q => {
  topics[q.topic] = (topics[q.topic] || 0) + 1;
});

console.log(`\n✓ Topic Distribution:`);
Object.entries(topics).forEach(([topic, count]) => {
  console.log(`  • ${topic}: ${count} questions`);
});

// ============================================================
// Display first 5 questions as sample
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('       SAMPLE QUESTIONS (First 5)');
console.log('='.repeat(60));

mockTest.slice(0, 5).forEach((q, index) => {
  console.log(`\nQ${q.questionNumber} (${q.marks} mark${q.marks > 1 ? 's' : ''}) [${q.difficulty.toUpperCase()}]`);
  console.log(`Topic: ${q.topic}`);
  console.log(`${q.question}`);
  console.log(`Options:`);
  q.options.forEach((option, i) => {
    const isCorrect = i === q.answer ? ' ✓ CORRECT' : '';
    console.log(`  ${String.fromCharCode(65 + i)}) ${option}${isCorrect}`);
  });
});

// ============================================================
// Export full mock test as JSON (optional)
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('       FULL MOCK TEST DATA (JSON Format)');
console.log('='.repeat(60));
console.log('\n// You can save this to a file and use it in your app:');
console.log(JSON.stringify(mockTest, null, 2).substring(0, 500) + '\n... (showing first 500 chars)\n');

console.log('✅ Test generation completed successfully!');
console.log('\n📌 To use this in your app:');
console.log('   1. Import the function: const { generateGatePaper } = require(\'./generateGateSubjectPaper\');');
console.log('   2. Call it: const paper = generateGatePaper("DSA");');
console.log('   3. Use the paper array in your frontend or store in database\n');
