/**
 * GATE Subject-wise Mock Test Generator
 * 
 * This function generates a GATE-style mock test by:
 * 1. Filtering questions by subject
 * 2. Separating 1-mark and 2-mark questions
 * 3. Balancing difficulty levels (easy, medium, hard)
 * 4. Mixing different topics
 * 5. Shuffling the final question set
 * 
 * BEGINNER GUIDE:
 * - Comments explain what each part does
 * - Simple logic (no complex algorithms)
 * - Easy to modify and understand
 */

import { gateQuestions } from '../data/gateQuestions.js';

/**
 * Helper Function 1: Shuffle an array randomly
 * 
 * How it works:
 * - Takes an array as input
 * - Randomizes the order using Fisher-Yates shuffle
 * - Returns the shuffled array
 * 
 * @param {Array} array - The array to shuffle
 * @returns {Array} - Shuffled copy of the array
 */
function shuffleArray(array) {
  // Create a copy so we don't modify the original
  const shuffled = [...array];
  
  // Go through each element from end to start
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const randomIndex = Math.floor(Math.random() * (i + 1));
    
    // Swap the current element with the random element
    const temp = shuffled[i];
    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }
  
  return shuffled;
}

/**
 * Helper Function 2: Get questions with specific marks
 * 
 * How it works:
 * - Filter all questions by a specific marks value (1 or 2)
 * - Return the filtered array
 * 
 * @param {Array} questions - Array of question objects
 * @param {Number} marks - Number of marks (1 or 2)
 * @returns {Array} - Questions with specified marks
 */
function getQuestionsByMarks(questions, marks) {
  return questions.filter(q => q.marks === marks);
}

/**
 * Helper Function 3: Get balanced questions by difficulty
 * 
 * How it works:
 * - Takes a set of questions and a required count
 * - Tries to balance easy, medium, hard difficulty levels
 * - Returns the selected questions
 * 
 * Example: If we need 25 one-mark questions
 * → Try to get ~8 easy + ~8 medium + ~9 hard
 * 
 * @param {Array} questions - Array of question objects
 * @param {Number} count - How many questions we need
 * @returns {Array} - Selected questions with balanced difficulty
 */
function selectBalancedQuestions(questions, count) {
  // Separate questions by difficulty level
  const easyQuestions = questions.filter(q => q.difficulty === 'easy');
  const mediumQuestions = questions.filter(q => q.difficulty === 'medium');
  const hardQuestions = questions.filter(q => q.difficulty === 'hard');
  
  // Calculate how many of each difficulty we need
  // Example: for 25 questions → 8 easy, 8 medium, 9 hard
  const easyCount = Math.floor(count / 3);
  const mediumCount = Math.floor(count / 3);
  const hardCount = count - easyCount - mediumCount;
  
  // Create a result array
  let selected = [];
  
  // Add easy questions (but only if we have enough)
  selected.push(...easyQuestions.slice(0, easyCount));
  
  // Add medium questions
  selected.push(...mediumQuestions.slice(0, mediumCount));
  
  // Add hard questions
  selected.push(...hardQuestions.slice(0, hardCount));
  
  // If we don't have enough questions, add more from any difficulty
  if (selected.length < count) {
    const remaining = count - selected.length;
    const allNotSelected = questions.filter(
      q => !selected.includes(q)
    );
    selected.push(...allNotSelected.slice(0, remaining));
  }
  
  return selected;
}

/**
 * MAIN FUNCTION: Generate GATE Subject-wise Mock Test Paper
 * 
 * This is the main function you'll call to generate a mock test
 * 
 * How it works:
 * 1. Filter questions by subject (e.g., "DSA")
 * 2. Separate into 1-mark and 2-mark questions
 * 3. Select 25 one-mark questions with balanced difficulty
 * 4. Select 25 two-mark questions with balanced difficulty
 * 5. Combine and shuffle
 * 6. Return 50-question mock test
 * 
 * @param {String} subject - The subject name (e.g., "DSA", "OS", "CN")
 * @returns {Array} - Array of 50 questions for the mock test
 * 
 * Example usage:
 * const paper = generateGatePaper("DSA");
 * console.log(paper); // Returns 50 questions
 */
function generateGatePaper(subject) {
  console.log(`\n📝 Generating GATE ${subject} Mock Test...\n`);
  
  // STEP 1: Get all questions for this subject
  // Filter means: keep only questions where subject matches
  const subjectQuestions = gateQuestions.filter(
    q => q.subject === subject
  );
  
  // Check if we have enough questions
  if (subjectQuestions.length === 0) {
    console.error(`❌ No questions found for subject: ${subject}`);
    return [];
  }
  
  console.log(`✓ Found ${subjectQuestions.length} total questions for ${subject}`);
  
  // STEP 2: Separate 1-mark and 2-mark questions
  const oneMarkQuestions = getQuestionsByMarks(subjectQuestions, 1);
  const twoMarkQuestions = getQuestionsByMarks(subjectQuestions, 2);
  
  console.log(`  • One-mark questions: ${oneMarkQuestions.length}`);
  console.log(`  • Two-mark questions: ${twoMarkQuestions.length}`);
  
  // STEP 3: Select 25 one-mark questions with balanced difficulty
  // This tries to have a mix of easy, medium, and hard questions
  const selectedOneMark = selectBalancedQuestions(oneMarkQuestions, 25);
  
  // STEP 4: Select 25 two-mark questions with balanced difficulty
  const selectedTwoMark = selectBalancedQuestions(twoMarkQuestions, 25);
  
  console.log(`\n✓ Selected 25 one-mark questions`);
  console.log(`✓ Selected 25 two-mark questions`);
  
  // STEP 5: Combine both sets
  const mockTest = [...selectedOneMark, ...selectedTwoMark];
  
  // STEP 6: Shuffle the questions so they're in random order
  const shuffledTest = shuffleArray(mockTest);
  
  // STEP 7: Add question numbers (1, 2, 3, ... 50)
  const finalTest = shuffledTest.map((question, index) => ({
    questionNumber: index + 1, // Add question number (1 to 50)
    ...question // Include all original question data
  }));
  
  console.log(`✓ Shuffled all questions`);
  console.log(`\n✅ Mock Test Ready! Total: ${finalTest.length} questions\n`);
  
  // Return the final mock test
  return finalTest;
}

/**
 * Export the main function so other files can use it
 * 
 * Usage in other files:
 * import { generateGatePaper } from './generateGateSubjectPaper.js';
 */
export { generateGatePaper };
