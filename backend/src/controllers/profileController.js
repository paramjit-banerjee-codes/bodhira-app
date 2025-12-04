import User from '../models/User.js';
import Test from '../models/Test.js';
import Result from '../models/Result.js';
import Classroom from '../models/Classroom.js';

// @desc    Get user profile with role-specific stats
// @route   GET /api/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: 'createdTests',
        select: 'title topic difficulty testCode createdAt totalQuestions',
      })
      .populate({
        path: 'attemptedTests',
        select: 'testCode topic score totalQuestions percentage createdAt',
        populate: { path: 'userId', select: 'name' },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get created tests - either from user.createdTests or from Test collection if not populated
    let createdTestsData = user.createdTests || [];
    
    // If createdTests is empty, fetch all tests where teacherId matches (for backward compatibility)
    if (createdTestsData.length === 0) {
      createdTestsData = await Test.find(
        { teacherId: req.userId },
        'title topic difficulty testCode createdAt totalQuestions'
      ).lean();
    }

    // Fetch role-specific stats
    let roleStats = {};
    
    if (user.role === 'teacher') {
      roleStats = await getTeacherStats(user._id);
    } else if (user.role === 'student') {
      roleStats = await getStudentStats(user._id);
    }

    res.status(200).json({
      success: true,
      data: {
        profile: {
          id: user._id,
          name: user.name,
          email: user.email,
          handle: user.handle,
          bio: user.bio,
          role: user.role,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
        },
        createdTests: createdTestsData,
        attemptedTests: user.attemptedTests || [],
        stats: roleStats,
      },
    });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching profile',
    });
  }
};

// Helper: Get teacher-specific stats
async function getTeacherStats(userId) {
  try {
    // Tests created by this teacher
    const testsCreated = await Test.countDocuments({ teacherId: userId });
    
    // Published tests
    const publishedTests = await Test.countDocuments({ 
      teacherId: userId, 
      isPublished: true 
    });
    
    // Classrooms created by this teacher
    const classroomsCreated = await Classroom.countDocuments({ teacherId: userId });
    
    // Get all classrooms and count total students
    const classrooms = await Classroom.find({ teacherId: userId })
      .populate('students', '_id');
    
    const totalStudents = classrooms.reduce((acc, classroom) => {
      return acc + (classroom.students?.length || 0);
    }, 0);
    
    // Calculate average class size
    const averageClassSize = classroomsCreated > 0 
      ? Math.round(totalStudents / classroomsCreated)
      : 0;
    
    // Get all results from tests created by this teacher to calculate performance
    const testsIds = await Test.find({ teacherId: userId }).select('_id');
    const testIds = testsIds.map(t => t._id);
    
    const results = await Result.find({ testId: { $in: testIds } });
    
    const avgScore = results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0;
    
    const totalAttempts = results.length;
    
    return {
      testsCreated,
      publishedTests,
      classroomsCreated,
      totalStudents,
      averageClassSize,
      totalAttempts,
      averageStudentScore: avgScore,
    };
  } catch (error) {
    console.error('Error calculating teacher stats:', error);
    return {
      testsCreated: 0,
      publishedTests: 0,
      classroomsCreated: 0,
      totalStudents: 0,
      averageClassSize: 0,
      totalAttempts: 0,
      averageStudentScore: 0,
    };
  }
}

// Helper: Get student-specific stats
async function getStudentStats(userId) {
  try {
    // Results for this student
    const results = await Result.find({ userId }).sort({ createdAt: -1 });
    
    const testsAttempted = results.length;
    
    // Count passed tests (percentage >= 60)
    const testsPassed = results.filter(r => r.passed).length;
    
    const averageScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0;
    
    // Calculate topic performance
    const topicPerformance = {};
    results.forEach(result => {
      if (!topicPerformance[result.topic]) {
        topicPerformance[result.topic] = { scores: [], count: 0 };
      }
      topicPerformance[result.topic].scores.push(result.percentage);
      topicPerformance[result.topic].count++;
    });
    
    // Calculate average for each topic
    const topicStats = Object.entries(topicPerformance).map(([topic, data]) => ({
      topic,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count),
      count: data.count,
    }));
    
    // Sort to get strongest and weakest topics
    topicStats.sort((a, b) => b.avgScore - a.avgScore);
    
    const strongestTopics = topicStats.slice(0, 3).map(t => ({
      topic: t.topic,
      score: t.avgScore,
    }));
    
    const weakestTopics = topicStats.slice(-3).map(t => ({
      topic: t.topic,
      score: t.avgScore,
    })).reverse();
    
    // Calculate streak (consecutive passing tests from most recent)
    let streak = 0;
    if (results.length > 0) {
      for (let i = 0; i < results.length; i++) {
        if (results[i].passed) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate improvement (recent vs older scores)
    let improvement = 0;
    if (results.length >= 2) {
      // For 2-4 tests: compare first with last
      // For 5+ tests: compare first half with second half
      // For 10+ tests: compare last 5 with first 5
      
      let recentAvg = 0;
      let olderAvg = 0;
      
      if (results.length < 5) {
        // Few tests: compare most recent with oldest
        recentAvg = results[0].percentage;
        olderAvg = results[results.length - 1].percentage;
      } else if (results.length < 10) {
        // 5-9 tests: compare first half with second half
        const mid = Math.ceil(results.length / 2);
        recentAvg = Math.round(
          results.slice(0, mid).reduce((sum, r) => sum + r.percentage, 0) / mid
        );
        const olderLength = results.length - mid;
        olderAvg = Math.round(
          results.slice(mid).reduce((sum, r) => sum + r.percentage, 0) / olderLength
        );
      } else {
        // 10+ tests: compare last 5 with first 5
        recentAvg = Math.round(
          results.slice(0, 5).reduce((sum, r) => sum + r.percentage, 0) / 5
        );
        olderAvg = Math.round(
          results.slice(-5).reduce((sum, r) => sum + r.percentage, 0) / 5
        );
      }
      
      improvement = recentAvg - olderAvg;
    }
    
    // Recent test results (last 5)
    const recentTests = results.slice(0, 5).map(r => ({
      testCode: r.testCode,
      topic: r.topic,
      score: r.percentage,
      date: r.createdAt,
      difficulty: r.difficulty,
    }));
    
    return {
      testsAttempted,
      testsPassed,
      averageScore,
      strongestTopics,
      weakestTopics,
      streak,
      improvement,
      recentTests,
      topicCount: topicStats.length,
    };
  } catch (error) {
    console.error('Error calculating student stats:', error);
    return {
      testsAttempted: 0,
      testsPassed: 0,
      averageScore: 0,
      strongestTopics: [],
      weakestTopics: [],
      streak: 0,
      improvement: 0,
      recentTests: [],
      topicCount: 0,
    };
  }
}

// @desc    Delete all user history (created and attempted tests)
// @route   DELETE /api/profile/history/all
// @access  Private
export const deleteAllHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get IDs of tests to delete
    const createdTestIds = user.createdTests || [];
    const attemptedResultIds = user.attemptedTests || [];

    // Delete all created tests - ONLY for this user, verified by teacherId
    if (createdTestIds.length > 0) {
      // Verify tests belong to current user before deleting
      await Test.deleteMany({ 
        _id: { $in: createdTestIds },
        teacherId: req.userId  // Add ownership check
      });
      
      // Also delete results for these tests - ONLY for this user
      await Result.deleteMany({ 
        testId: { $in: createdTestIds },
        userId: req.userId  // Add ownership check
      });
    }

    // Delete all result records for attempted tests - ONLY for this user
    if (attemptedResultIds.length > 0) {
      await Result.deleteMany({ 
        _id: { $in: attemptedResultIds },
        userId: req.userId  // Add ownership check - critical security fix
      });
    }

    // Clear both created and attempted tests history from user
    // IMPORTANT: Do NOT touch generation_count - it tracks total tests ever generated
    // and should NEVER be reset by deleting test history
    const updates = {
      createdTests: [],
      attemptedTests: [],
      // generation_count is intentionally NOT included - it's a cumulative counter
    };

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    });

    console.log(`✅ [DELETE HISTORY] User: ${req.userId}, generation_count preserved: ${updatedUser.generation_count}`);

    res.status(200).json({
      success: true,
      message: 'All history deleted successfully',
      data: {
        profile: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          generation_count: updatedUser.generation_count,  // Include counter to show it's preserved
        },
      },
    });
  } catch (error) {
    console.error('Delete All History Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting history',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error updating profile',
    });
  }
};
