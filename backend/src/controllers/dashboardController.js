import User from '../models/User.js';
import Test from '../models/Test.js';
import Result from '../models/Result.js';
import Classroom from '../models/Classroom.js';

// @desc    Get comprehensive dashboard analytics for teacher
// @route   GET /api/dashboard/analytics
// @access  Private (Teacher only)
export const getDashboardAnalytics = async (req, res) => {
  try {
    const teacherId = req.userId;
    
    console.log('📊 Fetching dashboard analytics for teacher:', teacherId);

    // Fetch all teacher's tests and classrooms
    const [tests, classrooms] = await Promise.all([
      Test.find({ teacherId }).lean(),
      Classroom.find({ teacherId }).populate('students', '_id name email').lean()
    ]);

    const testIds = tests.map(t => t._id);
    
    // Fetch all results for teacher's tests
    const results = await Result.find({ testId: { $in: testIds } })
      .populate('userId', 'name email')
      .lean();

    console.log(`Found ${tests.length} tests, ${classrooms.length} classrooms, ${results.length} results`);

    // Calculate stats
    const totalStudents = new Set(classrooms.flatMap(c => c.students.map(s => s._id.toString()))).size;
    const totalTests = tests.length;
    const publishedTests = tests.filter(t => t.isPublished).length;
    const activeClassrooms = classrooms.length;

    // Class average from all results
    const classAverage = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0;

    // Score distribution
    const scoreRanges = {
      '0-20': 0,
      '20-40': 0,
      '40-60': 0,
      '60-80': 0,
      '80-100': 0
    };
    
    results.forEach(r => {
      const score = r.percentage;
      if (score < 20) scoreRanges['0-20']++;
      else if (score < 40) scoreRanges['20-40']++;
      else if (score < 60) scoreRanges['40-60']++;
      else if (score < 80) scoreRanges['60-80']++;
      else scoreRanges['80-100']++;
    });

    const scoreDistribution = Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count,
      percentage: results.length > 0 ? Math.round((count / results.length) * 100) : 0,
      color: range === '0-20' ? '#ff5252' :
             range === '20-40' ? '#ffab00' :
             range === '40-60' ? '#ffd600' :
             range === '60-80' ? '#76ff03' : '#00e676'
    }));

    // Peak and lowest scores
    const scores = results.map(r => r.percentage);
    const peakScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Recent test activity (last 5 tests with submissions)
    const testsWithSubmissions = tests
      .map(test => {
        const testResults = results.filter(r => r.testId.toString() === test._id.toString());
        const avgScore = testResults.length > 0
          ? Math.round(testResults.reduce((sum, r) => sum + r.percentage, 0) / testResults.length)
          : 0;
        
        return {
          id: test._id,
          name: test.title,
          classroom: test.classroom || 'General',
          submissions: testResults.length,
          averageScore: avgScore,
          timestamp: test.createdAt,
          studentAvatars: testResults.slice(0, 3).map(r => ({
            name: r.userId?.name || 'Student',
            initial: (r.userId?.name || 'S').charAt(0).toUpperCase()
          }))
        };
      })
      .filter(t => t.submissions > 0)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    // Top performers (top 5 students by average score)
    const studentPerformance = {};
    results.forEach(result => {
      const studentId = result.userId?._id?.toString();
      if (!studentId) return;
      
      if (!studentPerformance[studentId]) {
        studentPerformance[studentId] = {
          id: studentId,
          name: result.userId?.name || 'Unknown',
          scores: [],
          testsCompleted: 0
        };
      }
      studentPerformance[studentId].scores.push(result.percentage);
      studentPerformance[studentId].testsCompleted++;
    });

    const topPerformers = Object.values(studentPerformance)
      .map(student => ({
        ...student,
        score: Math.round(student.scores.reduce((a, b) => a + b, 0) / student.scores.length)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((student, index) => ({
        id: student.id,
        name: student.name,
        score: student.score,
        testsCompleted: student.testsCompleted,
        rank: index + 1
      }));

    // Topic analysis
    const topicPerformance = {};
    results.forEach(result => {
      const topic = result.topic || 'General';
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { scores: [], count: 0 };
      }
      topicPerformance[topic].scores.push(result.percentage);
      topicPerformance[topic].count++;
    });

    const topicStats = Object.entries(topicPerformance)
      .map(([topic, data]) => ({
        topic,
        percentage: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count),
        count: data.count
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const strongTopics = topicStats.filter(t => t.percentage >= 70).slice(0, 3);
    const needsHelpTopics = topicStats.filter(t => t.percentage < 70).slice(0, 3);

    // Performance trend (last 4 weeks)
    const weeklyPerformance = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));

      const weekResults = results.filter(r => {
        const date = new Date(r.createdAt);
        return date >= weekStart && date < weekEnd;
      });

      const avg = weekResults.length > 0
        ? Math.round(weekResults.reduce((sum, r) => sum + r.percentage, 0) / weekResults.length)
        : 0;

      weeklyPerformance.push({
        period: `Week ${4 - i}`,
        classAverage: avg,
        benchmark: 70
      });
    }

    // AI Insights (dynamic based on data)
    const aiInsights = [];
    
    // Insight 1: Best day analysis
    const dayPerformance = {};
    results.forEach(r => {
      const day = new Date(r.createdAt).getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
      if (!dayPerformance[dayName]) dayPerformance[dayName] = [];
      dayPerformance[dayName].push(r.percentage);
    });
    const bestDay = Object.entries(dayPerformance)
      .map(([day, scores]) => ({
        day,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length
      }))
      .sort((a, b) => b.avg - a.avg)[0];
    
    if (bestDay) {
      aiInsights.push({
        icon: 'calendar',
        text: `Peak engagement detected on ${bestDay.day}. Consider scheduling important tests then.`
      });
    }

    // Insight 2: Trend analysis
    if (weeklyPerformance.length >= 2) {
      const recentAvg = weeklyPerformance[weeklyPerformance.length - 1].classAverage;
      const previousAvg = weeklyPerformance[weeklyPerformance.length - 2].classAverage;
      const improvement = recentAvg - previousAvg;
      
      if (improvement > 0) {
        aiInsights.push({
          icon: 'activity',
          text: `Class average improved ${improvement}% this week. Great work! Keep the momentum going.`
        });
      } else if (improvement < 0) {
        aiInsights.push({
          icon: 'alert',
          text: `Class average dropped ${Math.abs(improvement)}% this week. Consider reviewing difficult topics.`
        });
      }
    }

    // Insight 3: Topic suggestion
    if (needsHelpTopics.length > 0) {
      aiInsights.push({
        icon: 'book',
        text: `${needsHelpTopics[0].topic} needs attention (${needsHelpTopics[0].percentage}% avg). Consider creating practice tests.`
      });
    }

    // Trends (calculate percentage changes)
    // For demo, using positive trends - replace with actual historical comparison
    const trends = {
      students: totalStudents > 0 ? 12 : 0,
      tests: totalTests > 0 ? 8 : 0,
      average: classAverage > 0 ? 5 : 0
    };

    const response = {
      success: true,
      data: {
        overview: {
          totalStudents,
          totalTests,
          publishedTests,
          classAverage,
          activeClassrooms,
          trends
        },
        scoreDistribution,
        performance: {
          peakScore,
          lowestScore,
          trend: classAverage >= 70 ? 'Improving' : 'Needs Attention',
          weeklyData: weeklyPerformance
        },
        recentActivity: testsWithSubmissions,
        topPerformers,
        topicsAnalysis: {
          strong: strongTopics,
          needsHelp: needsHelpTopics
        },
        aiInsights,
        classroomHandle: classrooms.length > 0 ? classrooms[0].classroomHandle : '@classroom-1'
      }
    };

    console.log('✅ Dashboard analytics compiled successfully');
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard analytics'
    });
  }
};
