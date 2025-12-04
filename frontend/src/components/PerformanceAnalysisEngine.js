/**
 * AI/ML-Based Performance Analysis Engine
 * Calculates student strengths, weaknesses, and confidence scores
 * using mathematical analysis of multi-test performance data
 */

class PerformanceAnalysisEngine {
  /**
   * Map difficulty string to numeric value
   */
  static mapDifficultyToNumeric(difficulty) {
    if (typeof difficulty === 'number') return Math.max(1, Math.min(100, difficulty));
    const difficultyMap = {
      'easy': 30,
      'medium': 60,
      'hard': 85,
    };
    return difficultyMap[String(difficulty || '').toLowerCase()] || 50;
  }

  /**
   * Calculate weighted performance score
   * Recent tests have higher weight (exponential decay)
   * @param {Array} testResults - Array of test result objects
   * @param {Date} recentDaysThreshold - Weight decay based on recency
   */
  static calculateWeightedScore(testResults, recentDaysThreshold = 30) {
    if (!testResults || testResults.length === 0) return 0;

    const now = new Date();
    let totalWeightedScore = 0;
    let totalWeight = 0;

    testResults.forEach((result) => {
      const testDate = new Date(result.createdAt || result.testDate || now);
      const daysAgo = (now - testDate) / (1000 * 60 * 60 * 24);
      
      // Exponential decay: recent tests weighted more heavily
      // Weight = e^(-daysAgo/threshold)
      const weight = Math.exp(-daysAgo / recentDaysThreshold);
      const score = result.score !== undefined ? result.score : (result.accuracy !== undefined ? result.accuracy : result.percentage || 0);
      
      // Ensure score is a valid number
      const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;

      totalWeightedScore += validScore * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight * 100) / 100 : 0;
  }

  /**
   * Calculate consistency score (how stable is performance)
   * Low variance = high consistency (confidence in assessment)
   */
  static calculateConsistency(scores) {
    if (!scores || scores.length < 2) return 100;

    // Filter out invalid scores
    const validScores = scores.filter(s => typeof s === 'number' && !isNaN(s));
    if (validScores.length < 2) return 100;

    const mean = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    const variance = validScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / validScores.length;
    const stdDev = Math.sqrt(variance);

    // Convert std dev to consistency score (0-100)
    // Lower std dev = higher consistency
    // Formula: 100 - (stdDev / 50) capped at 0-100
    const consistency = Math.max(0, Math.min(100, 100 - (stdDev / 50) * 100));
    return Math.round(consistency);
  }

  /**
   * Calculate improvement trend
   * Compares early vs recent performance
   */
  static calculateImprovementTrend(testResults) {
    if (!testResults || testResults.length < 2) return 0;

    const sorted = [...testResults].sort((a, b) => 
      new Date(a.createdAt || a.testDate) - new Date(b.createdAt || b.testDate)
    );

    const mid = Math.floor(sorted.length / 2);
    const earlyTests = sorted.slice(0, mid);
    const recentTests = sorted.slice(mid);

    const getScore = (t) => t.score !== undefined ? t.score : (t.accuracy !== undefined ? t.accuracy : t.percentage || 0);
    const earlyAvg = earlyTests.reduce((sum, t) => sum + getScore(t), 0) / earlyTests.length;
    const recentAvg = recentTests.reduce((sum, t) => sum + getScore(t), 0) / recentTests.length;

    // Improvement as percentage point change
    const trend = recentAvg - earlyAvg;
    return isNaN(trend) ? 0 : Math.round(trend);
  }

  /**
   * Calculate difficulty-adjusted accuracy
   * Same score on harder test = higher confidence
   */
  static calculateDifficultyAdjustedScore(score, difficulty = 50) {
    // Difficulty range: 1-100
    // Harder tests contribute more to confidence
    const numericDifficulty = this.mapDifficultyToNumeric(difficulty);
    const difficultyFactor = numericDifficulty / 100;
    const adjustedScore = score * (1 + difficultyFactor * 0.5);
    return Math.min(100, adjustedScore);
  }

  /**
   * Generate Confidence Score (0-100)
   * Based on: accuracy, consistency, improvement trend, test count
   */
  static generateConfidenceScore(params) {
    const {
      accuracy = 0,
      consistency = 50,
      improvementTrend = 0,
      testCount = 1,
      avgDifficulty = 50,
    } = params;

    // Validate and clean inputs
    const validAccuracy = typeof accuracy === 'number' && !isNaN(accuracy) ? Math.max(0, Math.min(100, accuracy)) : 0;
    const validConsistency = typeof consistency === 'number' && !isNaN(consistency) ? Math.max(0, Math.min(100, consistency)) : 50;
    const validTestCount = typeof testCount === 'number' && !isNaN(testCount) ? Math.max(1, testCount) : 1;
    const validTrend = typeof improvementTrend === 'number' && !isNaN(improvementTrend) ? improvementTrend : 0;
    const numericDifficulty = this.mapDifficultyToNumeric(avgDifficulty);

    // Weights for confidence calculation
    const weights = {
      accuracy: 0.45,      // Primary factor
      consistency: 0.25,   // Reliability of performance
      improvement: 0.15,   // Positive trajectory
      testCount: 0.10,     // More data = more confidence
      difficulty: 0.05,    // Harder questions = more reliable
    };

    // Test count factor (0-1): logarithmic scale
    // 1 test = 0.3, 5 tests = 0.7, 10+ tests = 0.9
    const testCountFactor = Math.min(1, 0.3 + Math.log(validTestCount + 1) * 0.2);

    // Improvement factor (-1 to +1)
    const improvementFactor = Math.max(-1, Math.min(1, validTrend / 30));

    // Difficulty factor (0.5-1.0)
    const difficultyFactor = 0.5 + (numericDifficulty / 200);

    const confidenceScore = 
      (validAccuracy * weights.accuracy) +
      (validConsistency * weights.consistency / 100) +
      ((improvementFactor + 1) * 50 * weights.improvement) +
      (testCountFactor * 100 * weights.testCount) +
      (difficultyFactor * 100 * weights.difficulty);

    const result = Math.round(Math.max(0, Math.min(100, confidenceScore)));
    return isNaN(result) ? 0 : result;
  }

  /**
   * Analyze topic performance for a student
   */
  static analyzeTopicPerformance(topicResults) {
    if (!topicResults || topicResults.length === 0) {
      return {
        avgScore: 0,
        strength: 'UNKNOWN',
        confidence: 0,
        trend: 0,
        consistency: 0,
        color: '#94a3b8',
        testCount: 0,
        scores: [],
      };
    }

    const getScore = (r) => r.score !== undefined ? r.score : (r.accuracy !== undefined ? r.accuracy : r.percentage || 0);
    const scores = topicResults.map(r => {
      const score = getScore(r);
      return typeof score === 'number' && !isNaN(score) ? score : 0;
    });
    
    const validScores = scores.filter(s => s >= 0 && s <= 100);
    if (validScores.length === 0) {
      return {
        avgScore: 0,
        strength: 'UNKNOWN',
        confidence: 0,
        trend: 0,
        consistency: 0,
        color: '#94a3b8',
        testCount: 0,
        scores: [],
      };
    }
    
    const avgScore = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
    const consistency = this.calculateConsistency(validScores);
    const weightedScore = this.calculateWeightedScore(topicResults);
    const trend = this.calculateImprovementTrend(topicResults);

    // Determine strength level
    let strength, color;
    if (avgScore >= 85) {
      strength = 'EXCELLENT';
      color = '#10b981';
    } else if (avgScore >= 70) {
      strength = 'STRONG';
      color = '#6ee7b7';
    } else if (avgScore >= 55) {
      strength = 'AVERAGE';
      color = '#f59e0b';
    } else if (avgScore >= 40) {
      strength = 'WEAK';
      color = '#f97316';
    } else {
      strength = 'CRITICAL';
      color = '#ef4444';
    }

    const avgDifficulty = topicResults[0]?.difficulty || 'medium';
    const confidenceScore = this.generateConfidenceScore({
      accuracy: Math.max(0, Math.min(100, weightedScore)),
      consistency,
      improvementTrend: trend,
      testCount: topicResults.length,
      avgDifficulty,
    });

    return {
      avgScore,
      strength,
      confidence: Math.max(0, Math.min(100, isNaN(confidenceScore) ? 0 : confidenceScore)),
      trend: isNaN(trend) ? 0 : trend,
      consistency,
      color,
      testCount: topicResults.length,
      scores: validScores,
    };
  }

  /**
   * Build comprehensive strength/weakness map for a student
   */
  static buildPerformanceMap(allTestResults) {
    if (!allTestResults || allTestResults.length === 0) {
      return { strengths: {}, weaknesses: {}, topicAnalysis: {}, overallScore: 0 };
    }

    // Group by topic
    const topicMap = {};
    allTestResults.forEach((result) => {
      if (result && typeof result === 'object') {
        const topic = result.topic || result.subject || 'General';
        if (!topicMap[topic]) {
          topicMap[topic] = [];
        }
        topicMap[topic].push(result);
      }
    });

    if (Object.keys(topicMap).length === 0) {
      return { strengths: {}, weaknesses: {}, topicAnalysis: {}, overallScore: 0 };
    }

    // Analyze each topic
    const topicAnalysis = {};
    Object.entries(topicMap).forEach(([topic, results]) => {
      topicAnalysis[topic] = this.analyzeTopicPerformance(results);
    });

    // Separate into strengths and weaknesses
    const strengths = {};
    const weaknesses = {};

    Object.entries(topicAnalysis).forEach(([topic, analysis]) => {
      if (analysis && analysis.strength) {
        if (analysis.strength === 'EXCELLENT' || analysis.strength === 'STRONG') {
          strengths[topic] = analysis;
        } else if (analysis.strength === 'WEAK' || analysis.strength === 'CRITICAL') {
          weaknesses[topic] = analysis;
        }
      }
    });

    // Calculate overall score
    const validAnalyses = Object.values(topicAnalysis).filter(t => t && typeof t.avgScore === 'number' && !isNaN(t.avgScore));
    const overallScore = validAnalyses.length > 0 
      ? Math.round(validAnalyses.reduce((sum, t) => sum + t.avgScore, 0) / validAnalyses.length)
      : 0;

    return {
      strengths,
      weaknesses,
      topicAnalysis,
      overallScore: isNaN(overallScore) ? 0 : overallScore,
    };
  }

  /**
   * Generate "Suggested Learning Priority" recommendations
   */
  static generateLearningPriorities(performanceMap, limit = 5) {
    const { weaknesses, strengths, topicAnalysis } = performanceMap;

    if (!topicAnalysis || Object.keys(topicAnalysis).length === 0) {
      return [];
    }

    // Prioritize topics by:
    // 1. Lowest confidence (need most help)
    // 2. Negative or minimal improvement trend
    // 3. Number of attempts (more attempts = higher priority to improve)

    const priorities = Object.entries(topicAnalysis)
      .filter(([topic]) => weaknesses[topic]) // Only weak topics
      .map(([topic, analysis]) => {
        if (!analysis || !analysis.confidence) {
          return null;
        }
        const validConfidence = typeof analysis.confidence === 'number' && !isNaN(analysis.confidence) ? analysis.confidence : 50;
        const validTrend = typeof analysis.trend === 'number' && !isNaN(analysis.trend) ? analysis.trend : 0;
        const validTestCount = typeof analysis.testCount === 'number' && !isNaN(analysis.testCount) ? analysis.testCount : 0;
        
        return {
          topic,
          score: analysis.avgScore || 0,
          confidence: validConfidence,
          trend: validTrend,
          attempts: validTestCount,
          priority: (100 - validConfidence) * 0.4 + // Low confidence = high priority
                    Math.abs(Math.min(validTrend, 0)) * 0.3 + // Negative trend = high priority
                    validTestCount * 0.3, // More attempts = higher priority
        };
      })
      .filter(p => p !== null)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);

    return priorities;
  }

  /**
   * Prepare visualization data for heatmap
   */
  static prepareHeatmapData(performanceMap) {
    const { topicAnalysis } = performanceMap;

    if (!topicAnalysis || Object.keys(topicAnalysis).length === 0) {
      return [];
    }

    return Object.entries(topicAnalysis)
      .map(([topic, analysis]) => {
        if (!analysis) return null;
        return {
          topic,
          score: typeof analysis.avgScore === 'number' ? analysis.avgScore : 0,
          strength: analysis.strength || 'UNKNOWN',
          color: analysis.color || '#94a3b8',
          confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0,
          testCount: typeof analysis.testCount === 'number' ? analysis.testCount : 0,
        };
      })
      .filter(d => d !== null)
      .sort((a, b) => a.score - b.score); // Weakest first
  }

  /**
   * Get class-wide performance analytics
   */
  static analyzeClassPerformance(allStudentsData) {
    if (!allStudentsData || allStudentsData.length === 0) {
      return {
        classAverage: 0,
        classMedian: 0,
        classStdDev: 0,
        topTopics: [],
        bottomTopics: [],
        studentCount: 0,
      };
    }

    // Get all scores
    const scores = allStudentsData
      .flatMap(s => s.scores || [])
      .filter(s => typeof s === 'number' && !isNaN(s) && s >= 0 && s <= 100);

    if (scores.length === 0) {
      return {
        classAverage: 0,
        classMedian: 0,
        classStdDev: 0,
        topTopics: [],
        bottomTopics: [],
        studentCount: allStudentsData.length,
      };
    }

    // Calculate statistics
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sorted = scores.slice().sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Analyze topics across all students
    const topicScores = {};
    allStudentsData.forEach(student => {
      if (student.topicAnalysis && typeof student.topicAnalysis === 'object') {
        Object.entries(student.topicAnalysis).forEach(([topic, analysis]) => {
          if (analysis && typeof analysis.avgScore === 'number' && !isNaN(analysis.avgScore)) {
            if (!topicScores[topic]) {
              topicScores[topic] = [];
            }
            topicScores[topic].push(analysis.avgScore);
          }
        });
      }
    });

    // Get top and bottom topics
    const topicAverages = Object.entries(topicScores)
      .map(([topic, topicScoresList]) => ({
        topic,
        avgScore: Math.round(topicScoresList.reduce((a, b) => a + b, 0) / topicScoresList.length),
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    return {
      classAverage: isNaN(average) ? 0 : Math.round(average),
      classMedian: isNaN(median) ? 0 : Math.round(median),
      classStdDev: isNaN(stdDev) ? 0 : Math.round(stdDev),
      topTopics: topicAverages.slice(0, 5),
      bottomTopics: topicAverages.slice(-5).reverse(),
      studentCount: allStudentsData.length,
    };
  }
}

export default PerformanceAnalysisEngine;