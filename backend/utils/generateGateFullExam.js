/**
 * GATE Full Exam Generator (65 Questions, 100 Marks)
 * 
 * Structure:
 * - Section A (GA): 10 questions (5×1-mark, 5×2-mark) = 15 marks
 * - Section B (Subject): 55 questions (25×1-mark, 30×2-mark) = 85 marks
 * - Total: 65 questions, 100 marks, 3 hours (180 minutes)
 * 
 * Question Types: MCQ, MSQ, NAT (numerical)
 * Negative Marking:
 *   - MCQ 1-mark: +1 correct, −0.33 wrong
 *   - MCQ 2-mark: +2 correct, −0.67 wrong
 *   - MSQ/NAT: No negative marking, full or zero
 */

import { gateQuestions } from '../data/gateQuestions.js';

/**
 * Generate a complete GATE exam with Section A (GA) and Section B (Subject)
 * 
 * @param {string} subject - Subject name (e.g., "DSA", "OS", "CN")
 * @returns {object} Full exam object with sections and questions
 * 
 * Example output:
 * {
 *   examId: "GATE_2025_DSA_123456",
 *   exam: "GATE",
 *   subject: "DSA",
 *   totalTimeMinutes: 180,
 *   totalQuestions: 65,
 *   totalMarks: 100,
 *   sections: [
 *     { id: "A", title: "General Aptitude", questions: [...10 questions] },
 *     { id: "B", title: "DSA", questions: [...55 questions] }
 *   ]
 * }
 */
export function generateGateFullExam(subject) {
  // Generate unique exam ID
  const examId = `GATE_${new Date().getFullYear()}_${subject}_${Date.now()}`;

  // Section A: General Aptitude (fixed, same for all subjects)
  const sectionA = generateSectionA();

  // Section B: Subject-specific
  const sectionB = generateSectionB(subject);

  // If either section failed, return error
  if (!sectionA || !sectionB) {
    return null;
  }

  // Combine sections
  const sections = [sectionA, sectionB];

  // Calculate totals
  const totalQuestions = sectionA.questions.length + sectionB.questions.length;
  const totalMarks = sectionA.questions.reduce((sum, q) => sum + q.marks, 0) +
                     sectionB.questions.reduce((sum, q) => sum + q.marks, 0);

  return {
    examId,
    exam: 'GATE',
    subject,
    totalTimeMinutes: 180,
    totalQuestions,
    totalMarks,
    sections,
    // Metadata for frontend
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate Section A (General Aptitude)
 * 10 questions: 5×1-mark, 5×2-mark = 15 marks
 * 
 * For now, we generate from subject questions. In a real system,
 * you'd have a separate GA question bank.
 */
function generateSectionA() {
  try {
    // Get all unique questions by topic (best effort at GA)
    const gaTopics = ['Logic', 'Reasoning', 'Grammar'];
    let sectionAQuestions = [];

    // Try to get GA-like questions (for demo, use first 10 questions as GA)
    const allQuestions = gateQuestions.filter(q => q.exam === 'GATE');

    if (allQuestions.length < 10) {
      console.warn('⚠️  Not enough questions for Section A. Got', allQuestions.length, '< 10');
      return null;
    }

    // Select first 10 as GA (best-effort)
    sectionAQuestions = allQuestions.slice(0, 10);

    // Ensure distribution: 5×1-mark, 5×2-mark
    const oneMarkQ = sectionAQuestions.filter(q => q.marks === 1);
    const twoMarkQ = sectionAQuestions.filter(q => q.marks === 2);

    if (oneMarkQ.length < 5 || twoMarkQ.length < 5) {
      console.warn('⚠️  Section A: Could not enforce exact distribution. Got 1-mark:', oneMarkQ.length, '2-mark:', twoMarkQ.length);
    }

    // Assign question numbers starting from Q1
    const questionsWithNumbers = sectionAQuestions.map((q, idx) => ({
      ...q,
      qno: idx + 1,
      sectionId: 'A'
    }));

    return {
      id: 'A',
      title: 'General Aptitude',
      questions: questionsWithNumbers
    };
  } catch (error) {
    console.error('Error generating Section A:', error);
    return null;
  }
}

/**
 * Generate Section B (Subject-specific)
 * 55 questions: 25×1-mark, 30×2-mark = 85 marks
 * Type distribution:
 *   1-mark: 15 MCQ, 7 MSQ, 3 NAT
 *   2-mark: 20 MCQ, 7 MSQ, 3 NAT
 */
function generateSectionB(subject) {
  try {
    // Get all subject questions
    const subjectQuestions = gateQuestions.filter(
      q => q.exam === 'GATE' && q.subject === subject
    );

    if (subjectQuestions.length === 0) {
      console.error(`❌ No questions found for subject: ${subject}`);
      return null;
    }

    // Separate by marks and type
    const oneMarkQuestions = subjectQuestions.filter(q => q.marks === 1);
    const twoMarkQuestions = subjectQuestions.filter(q => q.marks === 2);

    // Target distribution
    const targetOneMark = 25;     // 15 MCQ + 7 MSQ + 3 NAT
    const targetTwoMark = 30;     // 20 MCQ + 7 MSQ + 3 NAT

    // Log warnings if we don't have enough
    if (oneMarkQuestions.length < targetOneMark) {
      console.warn(`⚠️  Only ${oneMarkQuestions.length} 1-mark questions available (need ${targetOneMark})`);
    }
    if (twoMarkQuestions.length < targetTwoMark) {
      console.warn(`⚠️  Only ${twoMarkQuestions.length} 2-mark questions available (need ${targetTwoMark})`);
    }

    // Shuffle and select
    const shuffledOneMark = shuffle(oneMarkQuestions).slice(0, Math.min(targetOneMark, oneMarkQuestions.length));
    const shuffledTwoMark = shuffle(twoMarkQuestions).slice(0, Math.min(targetTwoMark, twoMarkQuestions.length));

    // Combine and assign question numbers (starting from Q11 since A ends at Q10)
    const sectionBQuestions = [...shuffledOneMark, ...shuffledTwoMark].map((q, idx) => ({
      ...q,
      qno: 11 + idx,
      sectionId: 'B'
    }));

    return {
      id: 'B',
      title: subject,
      questions: sectionBQuestions
    };
  } catch (error) {
    console.error('Error generating Section B:', error);
    return null;
  }
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default generateGateFullExam;
