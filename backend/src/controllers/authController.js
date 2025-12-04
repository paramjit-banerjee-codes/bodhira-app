import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Result from '../models/Result.js';
import Test from '../models/Test.js';
import Classroom from '../models/Classroom.js';
import { generateOTP, sendOTPEmail, sendWelcomeEmail } from '../utils/emailService.js';

// Generate JWT Token with handle
const generateToken = (userId, handle) => {
  return jwt.sign({ userId, handle }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate unique handle from name (format: @name_####)
const generateUniqueHandle = async (name) => {
  // Convert name to lowercase, remove spaces, keep only alphanumeric and underscore
  let baseHandle = name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .substring(0, 15); // Max 15 chars for base (to leave room for _####)

  if (!baseHandle) {
    baseHandle = 'user';
  }

  // Generate random 4-digit number
  let randomNumber = Math.floor(1000 + Math.random() * 9000);
  let handle = `${baseHandle}_${randomNumber}`;

  // Check if handle exists, if so try different random numbers
  let attempts = 0;
  while (await User.findOne({ handle }) && attempts < 10) {
    randomNumber = Math.floor(1000 + Math.random() * 9000);
    handle = `${baseHandle}_${randomNumber}`;
    attempts++;
  }

  // If still exists after 10 attempts, add timestamp
  if (attempts === 10) {
    const timestamp = Date.now().toString().slice(-4);
    handle = `${baseHandle}_${timestamp}`;
  }

  return handle;
};

// @desc    Register new user (teacher or student)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match',
      });
    }

    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be either teacher or student',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Generate unique handle
    const handle = await generateUniqueHandle(name);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (initially unverified)
    const user = await User.create({
      name,
      email,
      password,
      role,
      handle,
      isVerified: false,
      verificationOTP: otp,
      otpExpiresAt: otpExpiryTime,
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, user.name, otp, 10);

    if (!emailSent) {
      // User created but email failed - still return success with message
      console.warn(`⚠️  User created but OTP email failed for ${email}`);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        email: user.email,
        requiresVerification: true,
        otpExpiresAt: otpExpiryTime,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate token with handle
    const token = generateToken(user._id, user.handle);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          handle: user.handle,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login',
    });
  }
};

// @desc    Get current user (full profile)
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get role-specific stats
    let stats = {};
    
    if (user.role === 'teacher') {
      stats = await getTeacherStatsForUser(user._id);
    } else if (user.role === 'student') {
      stats = await getStudentStatsForUser(user._id);
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          handle: user.handle,
          role: user.role,
          profilePicture: user.profilePicture,
          bio: user.bio,
          createdAt: user.createdAt,
        },
        stats: stats,
      },
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user',
    });
  }
};

// Helper: Get teacher stats for current user
async function getTeacherStatsForUser(userId) {
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
    
    // Get all classrooms and count unique total students
    const classrooms = await Classroom.find({ teacherId: userId })
      .populate('students', '_id');
    
    // Count unique students across all classrooms
    const uniqueStudentIds = new Set();
    classrooms.forEach(classroom => {
      if (classroom.students && Array.isArray(classroom.students)) {
        classroom.students.forEach(student => {
          uniqueStudentIds.add(student._id.toString());
        });
      }
    });
    const totalStudents = uniqueStudentIds.size;
    
    // Get all results from tests created by this teacher to calculate performance
    const testsIds = await Test.find({ teacherId: userId }).select('_id');
    const testIds = testsIds.map(t => t._id);
    
    const results = await Result.find({ testId: { $in: testIds } });
    
    const avgScore = results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0;
    
    const totalAttempts = results.length;
    
    // Calculate average class size
    const averageClassSize = classroomsCreated > 0 
      ? Math.round(totalStudents / classroomsCreated * 10) / 10
      : 0;
    
    return {
      testsCreated,
      publishedTests,
      classroomsCreated,
      totalStudents,
      totalAttempts,
      averageStudentScore: avgScore,
      averageClassSize,
    };
  } catch (error) {
    console.error('Error calculating teacher stats:', error);
    return {
      testsCreated: 0,
      publishedTests: 0,
      classroomsCreated: 0,
      totalStudents: 0,
      totalAttempts: 0,
      averageStudentScore: 0,
    };
  }
}

// Helper: Get student stats for current user
async function getStudentStatsForUser(userId) {
  try {
    // Results for this student
    const results = await Result.find({ userId }).sort({ createdAt: -1 });
    
    console.log(`📊 Student stats for userId ${userId}: Found ${results.length} results`);
    
    const totalTestsTaken = results.length;
    
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
    
    // Calculate streak (consecutive passing tests)
    let streak = 0;
    for (let i = 0; i < results.length; i++) {
      if (results[i].passed === true) {
        streak++;
      } else {
        break;
      }
    }
    console.log(`🔥 Streak calculation: ${streak} consecutive passes`);
    
    // Calculate improvement (recent vs older scores)
    let improvement = 0;
    if (results.length >= 2) {
      // Use available results for comparison (min 2 tests)
      const splitPoint = Math.ceil(results.length / 2);
      const recentResults = results.slice(0, splitPoint);
      const olderResults = results.slice(splitPoint);
      
      const recentAvg = Math.round(
        recentResults.reduce((sum, r) => sum + r.percentage, 0) / recentResults.length
      );
      const olderAvg = Math.round(
        olderResults.reduce((sum, r) => sum + r.percentage, 0) / olderResults.length
      );
      improvement = recentAvg - olderAvg;
      console.log(`📈 Improvement: recent avg=${recentAvg}%, older avg=${olderAvg}%, improvement=${improvement}%`);
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
      totalTestsTaken,
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
      totalTestsTaken: 0,
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

// @desc    Get user by handle
// @route   GET /api/users/:handle
// @access  Public
export const getUserByHandle = async (req, res) => {
  try {
    const { handle } = req.params;
    
    const user = await User.findOne({ handle }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          handle: user.handle,
          role: user.role,
          profilePicture: user.profilePicture,
          bio: user.bio,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get User By Handle Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user',
    });
  }
};

// @desc    Update user profile (name, bio, avatar)
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Only allow updating name, bio, and profilePicture
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          handle: user.handle,
          role: user.role,
          profilePicture: user.profilePicture,
          bio: user.bio,
          createdAt: user.createdAt,
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

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error updating profile',
    });
  }
};

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required',
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+verificationOTP +otpExpiresAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Account is already verified',
      });
    }

    // Check if OTP exists
    if (!user.verificationOTP) {
      return res.status(400).json({
        success: false,
        error: 'No OTP found. Please request a new one.',
      });
    }

    // Check if OTP is expired
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.',
      });
    }

    // Check if OTP matches
    if (user.verificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please try again.',
      });
    }

    // Mark as verified and clear OTP
    user.isVerified = true;
    user.verificationOTP = null;
    user.otpExpiresAt = null;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Generate token
    const token = generateToken(user._id, user.handle);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Your account is now active!',
      data: {
        token,
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          handle: user.handle,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during OTP verification',
    });
  }
};

// @desc    Resend OTP to email
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Account is already verified',
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    user.verificationOTP = newOTP;
    user.otpExpiresAt = expiryTime;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, user.name, newOTP, 10);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP email. Please try again later.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP has been resent to your email',
      data: {
        email: user.email,
        otpExpiresAt: expiryTime,
      },
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during OTP resend',
    });
  }
};