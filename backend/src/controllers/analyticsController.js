import mongoose from 'mongoose';
import Result from '../models/Result.js';
import Test from '../models/Test.js';
import User from '../models/User.js';
import Classroom from '../models/Classroom.js';

/**
 * Helper to verify user is the classroom teacher
 */
async function verifyTeacherAccess(classroomId, userId) {
  try {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return { authorized: false, error: 'Classroom not found' };
    }
    
    if (classroom.teacherId.toString() !== userId.toString()) {
      return { authorized: false, error: 'Only the teacher can access classroom analytics' };
    }
    
    return { authorized: true };
  } catch (err) {
    console.error('Error verifying teacher access:', err);
    return { authorized: false, error: 'Authorization check failed' };
  }
}

/**
 * Helper to compute median from JS array of numbers
 */
function computeMedian(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const copy = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(copy.length / 2);
  if (copy.length % 2 === 0) {
    return Math.round(((copy[mid - 1] + copy[mid]) / 2) * 100) / 100;
  }
  return Math.round(copy[mid] * 100) / 100;
}

const overview = async (req, res, next) => {
  try {
    const classroomId = req.params.id;
    const userId = req.userId;

    if (!classroomId) {
      return res.status(400).json({ success: false, error: 'Missing classroom id' });
    }

    // ✅ Verify user is the classroom teacher
    const authCheck = await verifyTeacherAccess(classroomId, userId);
    if (!authCheck.authorized) {
      return res.status(403).json({ success: false, error: authCheck.error });
    }

    const classroomObjectId = mongoose.Types.ObjectId.isValid(classroomId)
      ? new mongoose.Types.ObjectId(classroomId)
      : null;
    if (!classroomObjectId) {
      return res.status(400).json({ success: false, error: 'Invalid classroom id' });
    }

    // Base lookup pipeline: join Test and filter by test.classroomId
    const basePipeline = [
      {
        $lookup: {
          from: 'tests',
          localField: 'testId',
          foreignField: '_id',
          as: 'test',
        },
      },
      { $unwind: '$test' },
      { $match: { 'test.classroomId': classroomObjectId } },
    ];

    // 1) Scores array for median, avg, min, max
    const statsPipeline = basePipeline.concat([
      {
        $group: {
          _id: null,
          scores: { $push: '$percentage' },
          avgScore: { $avg: '$percentage' },
          minScore: { $min: '$percentage' },
          maxScore: { $max: '$percentage' },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsResult = await Result.aggregate(statsPipeline).allowDiskUse(true);
    const stats = statsResult && statsResult.length ? statsResult[0] : null;

    const scoresArray = stats?.scores || [];
    const avgScore = stats?.avgScore ? Math.round(stats.avgScore * 100) / 100 : 0;
    const minScore = stats?.minScore ?? 0;
    const maxScore = stats?.maxScore ?? 0;
    const medianScore = computeMedian(scoresArray) ?? 0;

    // 2) Distribution bins (F: <60, D:60-69, C:70-79, B:80-89, A:90-100)
    const distributionPipeline = basePipeline.concat([
      {
        $bucket: {
          groupBy: '$percentage',
          boundaries: [0, 60, 70, 80, 90, 101],
          default: 'other',
          output: {
            count: { $sum: 1 },
            avg: { $avg: '$percentage' },
          },
        },
      },
    ]);

    const distributionRaw = await Result.aggregate(distributionPipeline).allowDiskUse(true);
    // Map buckets to labels
    const bucketLabels = ['F (<60)', 'D (60-69)', 'C (70-79)', 'B (80-89)', 'A (90-100)'];
    const distribution = distributionRaw.map((b, idx) => ({
      label: bucketLabels[idx] || String(b._id),
      count: b.count || 0,
      avg: b.avg ? Math.round(b.avg * 100) / 100 : 0,
    }));

    // 3) Performance trend: average per test (ordered by test createdAt)
    const trendPipeline = basePipeline.concat([
      {
        $group: {
          _id: '$test._id',
          avgScore: { $avg: '$percentage' },
          createdAt: { $first: '$test.createdAt' },
          topic: { $first: '$test.topic' },
        },
      },
      { $sort: { createdAt: 1 } },
      {
        $project: {
          _id: 0,
          testId: '$_id',
          avgScore: { $round: ['$avgScore', 2] },
          createdAt: 1,
          topic: 1,
        },
      },
    ]);

    const performanceTrend = await Result.aggregate(trendPipeline).allowDiskUse(true);

    // 4) Topic stats: avg score per topic, tests count, attempts
    const topicPipeline = basePipeline.concat([
      {
        $group: {
          _id: '$test.topic',
          avgScore: { $avg: '$percentage' },
          attempts: { $sum: 1 },
          testsSet: { $addToSet: '$test._id' },
        },
      },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          avgScore: { $round: ['$avgScore', 2] },
          attempts: 1,
          testsCount: { $size: '$testsSet' },
        },
      },
      { $sort: { avgScore: -1 } },
    ]);

    const topicStats = await Result.aggregate(topicPipeline).allowDiskUse(true);

    return res.status(200).json({
      success: true,
      data: {
        avgScore,
        minScore,
        maxScore,
        medianScore,
        totalResults: stats?.count || 0,
        distribution,
        performanceTrend,
        topicStats,
      },
    });
  } catch (err) {
    console.error('analyticsController.overview error', err);
    return res.status(500).json({ success: false, error: 'Failed to compute analytics overview' });
  }
};

// GET /api/classrooms/:id/analytics/students
const students = async (req, res, next) => {
  try {
    const classroomId = req.params.id;
    const userId = req.userId;

    if (!classroomId) return res.status(400).json({ success: false, error: 'Missing classroom id' });

    // ✅ Verify user is the classroom teacher
    const authCheck = await verifyTeacherAccess(classroomId, userId);
    if (!authCheck.authorized) {
      return res.status(403).json({ success: false, error: authCheck.error });
    }

    const classroomObjectId = mongoose.Types.ObjectId.isValid(classroomId)
      ? new mongoose.Types.ObjectId(classroomId)
      : null;
    if (!classroomObjectId) return res.status(400).json({ success: false, error: 'Invalid classroom id' });

    const basePipeline = [
      {
        $lookup: {
          from: 'tests',
          localField: 'testId',
          foreignField: '_id',
          as: 'test',
        },
      },
      { $unwind: '$test' },
      { $match: { 'test.classroomId': classroomObjectId } },
      { $sort: { createdAt: -1 } }, // newest first
    ];

    const groupStage = {
      $group: {
        _id: '$userId',
        testsTaken: { $sum: 1 },
        avgScore: { $avg: '$percentage' },
        stdDev: { $stdDevSamp: '$percentage' },
        scores: { $push: '$percentage' },
        lastScore: { $first: '$percentage' },
        lastTestAt: { $first: '$createdAt' },
      },
    };

    const projectStage = {
      $project: {
        studentId: '$_id',
        avgScore: { $round: ['$avgScore', 2] },
        testsTaken: 1,
        lastScore: 1,
        consistencyScore: { $round: ['$stdDev', 2] },
        scores: 1,
      },
    };

    const pipeline = basePipeline.concat([groupStage, projectStage]);

    let results = await Result.aggregate(pipeline).allowDiskUse(true);

    // Compute improvementDelta: recent 3 vs previous 3
    results = await Promise.all(
      results.map(async (r) => {
        const scores = r.scores || [];
        const recent = scores.slice(0, 3);
        const previous = scores.slice(3, 6);
        const avg = (arr) => (arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
        const recentAvg = avg(recent);
        const previousAvg = avg(previous);
        const improvementDelta = recentAvg !== null && previousAvg !== null ? Math.round((recentAvg - previousAvg) * 100) / 100 : null;

        // Lookup user name
        let name = null;
        try {
          const user = await mongoose.model('User').findById(r.studentId).lean();
          name = user ? user.name || user.email || `${user.firstName || ''} ${user.lastName || ''}`.trim() : null;
        } catch (e) {
          name = null;
        }

        return {
          studentId: String(r.studentId),
          name: name || 'Unknown',
          avgScore: r.avgScore,
          testsTaken: r.testsTaken,
          lastScore: r.lastScore,
          consistencyScore: r.consistencyScore || 0,
          improvementDelta,
        };
      })
    );

    // Sort by avgScore desc
    results.sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));

    // Fetch detailed test results for each student for AI analysis
    const enrichedResults = await Promise.all(
      results.map(async (student) => {
        try {
          // Get all test results for this student in the classroom
          const testResults = await Result.find({
            userId: new mongoose.Types.ObjectId(student.studentId),
          })
            .populate({
              path: 'testId',
              match: { classroomId: classroomObjectId },
              select: 'topic difficulty testCode',
            })
            .select('percentage testId createdAt')
            .lean()
            .exec();

          // Filter out results where test wasn't found (null populate)
          const validResults = testResults.filter(r => r.testId && r.testId._id);

          return {
            ...student,
            testResults: validResults.map(r => ({
              score: r.percentage,
              topic: r.testId?.topic || 'Unknown',
              difficulty: r.testId?.difficulty || 'medium',
              testCode: r.testId?.testCode || '',
              createdAt: r.createdAt,
            })),
          };
        } catch (err) {
          console.error('Error fetching test results for student:', student.studentId, err);
          return {
            ...student,
            testResults: [],
          };
        }
      })
    );

    return res.status(200).json({ success: true, data: enrichedResults });
  } catch (err) {
    console.error('analyticsController.students error', err);
    return res.status(500).json({ success: false, error: 'Failed to compute student analytics' });
  }
};

// GET /api/classrooms/:id/analytics/students/:studentId/history
const studentHistory = async (req, res, next) => {
  try {
    const classroomId = req.params.id;
    const studentId = req.params.studentId;
    const userId = req.userId;

    if (!classroomId || !studentId) return res.status(400).json({ success: false, error: 'Missing ids' });

    // ✅ Verify user is the classroom teacher
    const authCheck = await verifyTeacherAccess(classroomId, userId);
    if (!authCheck.authorized) {
      return res.status(403).json({ success: false, error: authCheck.error });
    }

    const classroomObjectId = mongoose.Types.ObjectId.isValid(classroomId)
      ? new mongoose.Types.ObjectId(classroomId)
      : null;
    if (!classroomObjectId) return res.status(400).json({ success: false, error: 'Invalid classroom id' });

    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : null;
    if (!studentObjectId) return res.status(400).json({ success: false, error: 'Invalid student id' });

    const pipeline = [
      {
        $match: { userId: studentObjectId },
      },
      {
        $lookup: {
          from: 'tests',
          localField: 'testId',
          foreignField: '_id',
          as: 'test',
        },
      },
      { $unwind: '$test' },
      { $match: { 'test.classroomId': classroomObjectId } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 0,
          testId: '$test._id',
          testDate: '$test.createdAt',
          topic: '$test.topic',
          score: '$percentage',
        },
      },
    ];

    const history = await Result.aggregate(pipeline).allowDiskUse(true);
    return res.status(200).json({ success: true, data: history });
  } catch (err) {
    console.error('analyticsController.studentHistory error', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch student history' });
  }
};

export default { overview, students, studentHistory };
