import asyncHandler from '../middleware/asyncHandler.js';
import Student from '../models/Student.js';
import Classroom from '../models/Classroom.js';
import User from '../models/User.js';
import Result from '../models/Result.js';
import Test from '../models/Test.js';
import { generateInviteCode } from '../utils/classroomUtils.js';
import mongoose from 'mongoose';

/**
 * @desc    Add a student to classroom (teacher invites)
 * @route   POST /api/classrooms/:id/students
 * @access  Private (Teacher only)
 * @future  Send email invitation with join link
 */
export const addStudentToClassroom = asyncHandler(async (req, res) => {
  const { id: classroomId } = req.params;
  const { name, email } = req.body;
  const teacherId = req.userId;

  // Validate input
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Name and email are required'
    });
  }

  // Check if classroom exists and user is the teacher
  const classroom = await Classroom.findById(classroomId);

  if (!classroom) {
    return res.status(404).json({
      success: false,
      error: 'Classroom not found'
    });
  }

  if (classroom.teacherId.toString() !== teacherId) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to manage this classroom'
    });
  }

  // Check if student already exists in classroom
  const existingStudent = await Student.findOne({
    classroomId,
    email: email.toLowerCase()
  });

  if (existingStudent) {
    return res.status(400).json({
      success: false,
      error: 'This student is already in the classroom'
    });
  }

  // Create student record
  const student = await Student.create({
    name: name.trim(),
    email: email.toLowerCase(),
    classroomId,
    status: 'pending'
  });

  // Add student to classroom
  await Classroom.findByIdAndUpdate(
    classroomId,
    { $push: { students: student._id } },
    { new: true }
  );

  // TODO: Send email invitation with join code
  // Email should include:
  // - Classroom name
  // - Classroom code
  // - Accept invitation link

  res.status(201).json({
    success: true,
    message: 'Student invitation created successfully',
    data: {
      id: student._id,
      name: student.name,
      email: student.email,
      status: student.status,
      classroomId: student.classroomId
    }
  });
});

/**
 * @desc    Get all students in a classroom
 * @route   GET /api/classrooms/:id/students
 * @access  Private
 */
export const getClassroomStudents = asyncHandler(async (req, res) => {
  const { id: classroomId } = req.params;
  const userId = req.userId;

  const classroom = await Classroom.findById(classroomId);

  if (!classroom) {
    return res.status(404).json({
      success: false,
      error: 'Classroom not found'
    });
  }

  // Check authorization - teacher or student in classroom
  const isTeacher = classroom.teacherId.toString() === userId;
  if (!isTeacher) {
    // TODO: Check if user is student in classroom
    return res.status(403).json({
      success: false,
      error: 'Not authorized to view this classroom'
    });
  }

  const students = await Student.find({ classroomId })
    .populate('userId', 'name email username')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    data: {
      total: students.length,
      active: students.filter(s => s.status === 'active').length,
      pending: students.filter(s => s.status === 'pending').length,
      students: students.map(s => ({
        id: s._id,
        name: s.name,
        email: s.email,
        avatar: s.avatar,
        status: s.status,
        stats: s.stats,
        enrolledDate: s.inviteAcceptedAt || s.createdAt
      }))
    }
  });
});

/**
 * @desc    Remove student from classroom
 * @route   DELETE /api/classrooms/:classroomId/students/:studentId
 * @access  Private (Teacher only)
 */
export const removeStudentFromClassroom = asyncHandler(async (req, res) => {
  const { classroomId, studentId } = req.params;
  const teacherId = req.userId;

  const classroom = await Classroom.findById(classroomId);

  if (!classroom) {
    return res.status(404).json({
      success: false,
      error: 'Classroom not found'
    });
  }

  // Check authorization
  if (classroom.teacherId.toString() !== teacherId) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to manage this classroom'
    });
  }

  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }

  // Remove student from classroom
  await Classroom.findByIdAndUpdate(
    classroomId,
    { $pull: { students: studentId } },
    { new: true }
  );

  // Mark student as inactive (soft delete)
  student.status = 'inactive';
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Student removed from classroom'
  });
});

/**
 * @desc    Get student's progress in classroom
 * @route   GET /api/classrooms/:classroomId/students/:studentId
 * @access  Private
 */
export const getStudentProgress = asyncHandler(async (req, res) => {
  const { id: classroomId, studentId } = req.params;
  const userId = req.userId;

  // Validate IDs
  if (!classroomId || !studentId) {
    return res.status(400).json({
      success: false,
      error: 'Missing classroomId or studentId'
    });
  }

  // studentId is actually a User ID (from the enrollStudent flow)
  const user = await User.findById(studentId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }

  // Get the classroom to check authorization
  const classroom = await Classroom.findById(classroomId).populate('teacherId', '_id');

  if (!classroom) {
    return res.status(404).json({
      success: false,
      error: 'Classroom not found'
    });
  }

  // Check authorization - teacher of classroom or the student themselves
  const classroomTeacherId = classroom.teacherId._id;
  const isTeacher = classroomTeacherId?.toString() === userId;
  const isStudent = studentId.toString() === userId;
  
  if (!isTeacher && !isStudent) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to view this student\'s progress'
    });
  }

  // Get all tests in this classroom - use MongoDB ObjectId for classroomId
  const classroomTests = await Test.find({ classroomId: new mongoose.Types.ObjectId(classroomId) }).select('_id');
  const testIds = classroomTests.map(t => t._id);

  // Get results for this student
  let results = [];
  if (testIds.length > 0) {
    results = await Result.find({
      userId: studentId,
      testId: { $in: testIds }
    }).sort({ createdAt: -1 });
  }

  console.log(`📊 [getStudentProgress] User: ${user.name} (${studentId}), Tests in classroom: ${testIds.length}, Results found: ${results.length}`);

  // Calculate stats
  const totalTests = results.length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
    : 0;

  // Find topics with highest and lowest scores
  const topicScores = {};
  results.forEach(result => {
    if (!topicScores[result.topic]) {
      topicScores[result.topic] = [];
    }
    topicScores[result.topic].push(result.percentage);
  });

  const topicStats = Object.entries(topicScores).map(([topic, scores]) => ({
    topic,
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  })).sort((a, b) => b.avgScore - a.avgScore);

  const strengths = topicStats.slice(0, 3).map(t => t.topic);
  const weaknesses = topicStats.slice(-3).map(t => t.topic).reverse();

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      userHandle: user.handle || user.username || 'N/A',
      classroom: classroom.name,
      stats: {
        totalTests,
        avgScore,
        totalAttempts: results.filter(r => r.passed).length
      },
      strengths: strengths.length > 0 ? strengths : [],
      weaknesses: weaknesses.length > 0 ? weaknesses : [],
      enrolledDate: user.createdAt
    }
  });
  console.log('✅ [STUDENT PROGRESS] Sent response for', user.name, '- Total tests:', totalTests, 'Avg score:', avgScore);
});
