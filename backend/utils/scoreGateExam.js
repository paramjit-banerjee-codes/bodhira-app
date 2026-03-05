/**
 * GATE Exam Scoring Engine
 * 
 * Handles:
 * - MCQ scoring with negative marking
 * - MSQ (all-or-nothing) scoring
 * - NAT (numerical) scoring with tolerance
 * - Per-question result tracking
 * - Section-wise score breakdown
 * - Weak topics identification
 */

/**
 * Score a complete GATE exam submission
 * 
 * @param {object} examData - The exam with questions and correct answers
 * @param {array} answers - User's answers [ { qid, type, response } ]
 * @returns {object} Detailed scoring result
 * 
 * Example response:
 * {
 *   totalScore: 68.33,
 *   totalMarks: 100,
 *   sections: {
 *     A: { score: 12.67, maxMarks: 15, totalQuestions: 10 },
 *     B: { score: 55.66, maxMarks: 85, totalQuestions: 55 }
 *   },
 *   totalNegativeMarks: 1.33,
 *   perQuestion: [
 *     { qid, qno, sectionId, marks, status: "correct", awardedMarks, correctAnswers }
 *   ],
 *   weakTopics: [
 *     { topic: "Trees", missedMarks: 5, totalMarks: 10, accuracy: 50 }
 *   ]
 * }
 */
export function scoreGateExam(examData, answers) {
  // Create answer map for O(1) lookup
  const answerMap = {};
  answers.forEach(ans => {
    answerMap[ans.qid] = ans;
  });

  // Track results
  const perQuestion = [];
  const sectionScores = { A: { score: 0, maxMarks: 0, totalQuestions: 0 }, 
                          B: { score: 0, maxMarks: 0, totalQuestions: 0 } };
  const topicStats = {}; // { topic: { missed: x, total: x } }
  let totalNegativeMarks = 0;

  // Process each question
  examData.sections.forEach(section => {
    sectionScores[section.id].totalQuestions = section.questions.length;

    section.questions.forEach(question => {
      const userAnswer = answerMap[question.id];
      const result = scoreQuestion(question, userAnswer);

      // Add to per-question results
      perQuestion.push({
        qid: question.id,
        qno: question.qno,
        sectionId: section.id,
        marks: question.marks,
        type: question.type,
        topic: question.topic,
        difficulty: question.difficulty,
        status: result.status,
        awardedMarks: result.awardedMarks,
        correctAnswers: result.correctAnswers || question.answer
      });

      // Update section scores
      sectionScores[section.id].score += result.awardedMarks;
      sectionScores[section.id].maxMarks += question.marks;

      // Track negative marks
      if (result.negativeMarks) {
        totalNegativeMarks += result.negativeMarks;
      }

      // Track topic-wise stats
      const topic = question.topic;
      if (!topicStats[topic]) {
        topicStats[topic] = { missed: 0, total: 0 };
      }
      topicStats[topic].total += question.marks;
      if (result.status !== 'correct') {
        topicStats[topic].missed += question.marks - result.awardedMarks;
      }
    });
  });

  // Calculate total score
  const totalScore = Math.round((sectionScores.A.score + sectionScores.B.score) * 100) / 100;
  const totalMarks = sectionScores.A.maxMarks + sectionScores.B.maxMarks;

  // Identify weak topics (topics with >30% marks missed)
  const weakTopics = Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      missedMarks: Math.round(stats.missed * 100) / 100,
      totalMarks: stats.total,
      accuracy: Math.round((1 - stats.missed / stats.total) * 100)
    }))
    .filter(t => t.missedMarks > 0)
    .sort((a, b) => b.missedMarks - a.missedMarks)
    .slice(0, 5); // Top 5 weak topics

  return {
    totalScore,
    totalMarks,
    sections: sectionScores,
    totalNegativeMarks: Math.round(totalNegativeMarks * 100) / 100,
    perQuestion,
    weakTopics
  };
}

/**
 * Score a single question
 * 
 * MCQ/MSQ: Use correct answer from question data
 * NAT: Use numeric comparison with tolerance
 */
function scoreQuestion(question, userAnswer) {
  // Not attempted
  if (!userAnswer) {
    return {
      status: 'unattempted',
      awardedMarks: 0,
      negativeMarks: 0
    };
  }

  const { type, marks, answer: correctAnswer } = question;
  const { response } = userAnswer;

  switch (type) {
    case 'MCQ':
      return scoreMCQ(response, correctAnswer, marks);

    case 'MSQ':
      return scoreMSQ(response, correctAnswer, marks);

    case 'NAT':
      return scoreNAT(response, correctAnswer, marks);

    default:
      return { status: 'unattempted', awardedMarks: 0 };
  }
}

/**
 * Score a Multiple Choice Question
 * 
 * Rules:
 * - 1-mark MCQ: +1 correct, −1/3 wrong, 0 if not attempted
 * - 2-mark MCQ: +2 correct, −2/3 wrong, 0 if not attempted
 * 
 * @param {number} response - Selected option index (0-based) or null
 * @param {number} correctIndex - Correct option index
 * @param {number} marks - Question marks (1 or 2)
 */
function scoreMCQ(response, correctIndex, marks) {
  if (response === null || response === undefined) {
    return { status: 'unattempted', awardedMarks: 0 };
  }

  if (response === correctIndex) {
    return { status: 'correct', awardedMarks: marks };
  } else {
    // Wrong answer - apply negative marking
    const negativeMarks = marks === 1 ? 1/3 : 2/3;
    return {
      status: 'incorrect',
      awardedMarks: -negativeMarks,
      negativeMarks: negativeMarks
    };
  }
}

/**
 * Score a Multiple Select Question
 * 
 * Rules:
 * - All or nothing: must select EXACTLY the correct set
 * - No negative marking
 * - If any option is wrong or any correct option is missing: 0 marks
 * 
 * @param {array} response - Selected option indices [0, 2, 3] or null
 * @param {array} correctIndices - Correct option indices (sorted)
 * @param {number} marks - Question marks (1 or 2)
 */
function scoreMSQ(response, correctIndices, marks) {
  if (!response || response.length === 0) {
    return { status: 'unattempted', awardedMarks: 0 };
  }

  // Normalize both arrays for comparison
  const sortedResponse = response.sort((a, b) => a - b);
  const sortedCorrect = correctIndices.sort((a, b) => a - b);

  // Check if exact match
  if (arraysEqual(sortedResponse, sortedCorrect)) {
    return { status: 'correct', awardedMarks: marks };
  } else {
    // Partial credit is NOT allowed in MSQ - always 0 if not fully correct
    return { status: 'incorrect', awardedMarks: 0 };
  }
}

/**
 * Score a Numerical Answer Type question
 * 
 * Rules:
 * - Exact numeric match within tolerance 0.01
 * - No negative marking
 * - Accepts decimal numbers
 * 
 * @param {string|number} response - User's numeric response
 * @param {string|number} correctAnswer - Correct numeric answer
 * @param {number} marks - Question marks (1 or 2)
 */
function scoreNAT(response, correctAnswer, marks) {
  if (response === null || response === undefined || response === '') {
    return { status: 'unattempted', awardedMarks: 0 };
  }

  try {
    const userNum = parseFloat(response);
    const correctNum = parseFloat(correctAnswer);

    if (isNaN(userNum) || isNaN(correctNum)) {
      return { status: 'incorrect', awardedMarks: 0 };
    }

    // Check if within tolerance (0.01)
    const tolerance = 0.01;
    if (Math.abs(userNum - correctNum) < tolerance) {
      return { status: 'correct', awardedMarks: marks };
    } else {
      return { status: 'incorrect', awardedMarks: 0 };
    }
  } catch (error) {
    return { status: 'incorrect', awardedMarks: 0 };
  }
}

/**
 * Helper: Compare two arrays for equality
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default scoreGateExam;
