import Result from '../models/Result.js';

// @desc    Get leaderboard for a specific test code
// @route   GET /api/leaderboard/code/:testCode
// @access  Public
export const getLeaderboardByCode = async (req, res) => {
  try {
    const { testCode } = req.params;
    const { limit = 100 } = req.query;

    const code = String(testCode).toUpperCase();

    const leaderboard = await Result.aggregate([
      { $match: { testCode: code } },
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$percentage' },
          bestTime: { $min: '$timeTaken' },
          attempts: { $sum: 1 },
        },
      },
      { $sort: { bestScore: -1, bestTime: 1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          bestScore: 1,
          bestTime: 1,
          attempts: 1,
        },
      },
    ]);

    const ranked = leaderboard.map((entry, idx) => ({ rank: idx + 1, ...entry }));

    res.status(200).json({
      success: true,
      data: {
        testCode: code,
        leaderboard: ranked,
        total: ranked.length,
      },
    });
  } catch (error) {
    console.error('Get Leaderboard By Code Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching leaderboard',
    });
  }
};

// @desc    Get leaderboard by topic
// @route   GET /api/leaderboard/topic/:topic
// @access  Private
export const getTopicLeaderboard = async (req, res) => {
  try {
    const { topic } = req.params;
    const { limit = 50 } = req.query;

    const leaderboard = await Result.aggregate([
      { $match: { topic: { $regex: topic, $options: 'i' } } },
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$percentage' },
          bestTime: { $min: '$timeTaken' },
          attempts: { $sum: 1 },
        },
      },
      { $sort: { bestScore: -1, bestTime: 1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          bestScore: 1,
          bestTime: 1,
          attempts: 1,
        },
      },
    ]);

    const ranked = leaderboard.map((entry, idx) => ({ rank: idx + 1, ...entry }));

    res.status(200).json({
      success: true,
      data: {
        topic,
        leaderboard: ranked,
        total: ranked.length,
      },
    });
  } catch (error) {
    console.error('Get Topic Leaderboard Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching leaderboard',
    });
  }
};
