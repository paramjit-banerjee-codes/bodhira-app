import asyncHandler from '../middleware/asyncHandler.js';
import Classroom from '../models/Classroom.js';
import Student from '../models/Student.js';
import Test from '../models/Test.js';
import User from '../models/User.js';
import Result from '../models/Result.js';
import { generateClassroomHandle, generateInviteCode, isHandleUnique } from '../utils/classroomUtils.js';

/**
 * @desc    Create a new classroom
 * @route   POST /api/classrooms
 * @access  Private (Teacher only)
 */
export const createClassroom = asyncHandler(async (req, res) => {
  const { name, subject, description, handle } = req.body;
  const teacherId = req.userId;

  // Validate required fields
  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Classroom name is required'
    });
  }

  // Check if classroom with same handle already exists
  if (handle) {
    const handleExists = await Classroom.findOne({ handle });
    if (handleExists) {
      return res.status(400).json({
        success: false,
        error: 'This classroom handle is already taken'
      });
    }
  }

  // Generate unique handle if not provided
  const classroomHandle = handle || await generateClassroomHandle(name);

  // Generate invite code
  const inviteCode = generateInviteCode();

  // Create classroom
  const classroom = await Classroom.create({
    name: name.trim(),
    handle: classroomHandle,
    subject: subject || 'Programming',
    description: description ? description.trim() : '',
    teacherId,
    inviteCode
  });

  // Add classroom to teacher's profile
  await User.findByIdAndUpdate(
    teacherId,
    { $push: { classrooms: classroom._id } },
    { new: true }
  );

  res.status(201).json({
    success: true,
    message: 'Classroom created successfully',
    data: {
      id: classroom._id,
      _id: classroom._id,
      name: classroom.name,
      handle: classroom.handle,
      subject: classroom.subject,
      description: classroom.description,
      inviteCode: classroom.inviteCode,
      totalStudents: 0,
      totalTests: 0,
      createdAt: classroom.createdAt
    }
  });
});

/**
 * @desc    Get all classrooms for logged-in teacher
 * @route   GET /api/classrooms
 * @access  Private (Teacher only)
 */
export const getClassroomsForTeacher = asyncHandler(async (req, res) => {
  // Allow an explicit teacherId query parameter for flexibility (e.g. admin views)
  const teacherId = req.query.teacherId || req.userId;

  // Find classrooms where user is teacher OR where user is enrolled as student
  const classrooms = await Classroom.find({
    $or: [
      { teacherId, isActive: true },           // Classrooms user created
      { students: teacherId, isActive: true }  // Classrooms user is enrolled in
    ]
  })
    .select('name handle subject description students tests createdAt teacherId')
    .populate('tests', 'title status')
    .sort({ createdAt: -1 });

  // Calculate stats for each classroom
  const classroomsWithStats = await Promise.all(
    classrooms.map(async (classroom) => {
      // Count students from the students array (which stores User IDs)
      const studentsCount = classroom.students?.length || 0;
      const testsCount = classroom.tests?.length || 0;
      const isTeacher = classroom.teacherId.toString() === teacherId;

      return {
        id: classroom._id,
        _id: classroom._id,
        name: classroom.name,
        handle: classroom.handle,
        subject: classroom.subject,
        description: classroom.description,
        totalStudents: studentsCount,
        totalTests: testsCount,
        avgScore: 92, // TODO: Calculate from actual student results
        createdAt: classroom.createdAt,
        isTeacher: isTeacher, // Indicate if user is teacher or student
        role: isTeacher ? 'teacher' : 'student'
      };
    })
  );

  res.status(200).json({
    success: true,
    data: classroomsWithStats
  });
});

/**
 * @desc    Get classroom details by ID
 * @route   GET /api/classrooms/:id
 * @access  Private
 */
export const getClassroomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const classroom = await Classroom.findById(id)
    .populate('teacherId', 'name email')
    .populate({
      path: 'tests',
      select: 'title topic difficulty status isPublished totalQuestions testCode avgScore'
    });

  if (!classroom) {
    return res.status(404).json({
      success: false,
      error: 'Classroom not found'
    });
  }

  // Fetch enrolled users - they are stored as User IDs in the students array
  const enrolledUsers = await User.find({ 
    _id: { $in: classroom.students || [] } 
  }).select('_id name handle username email avatar');

  // Check authorization - teacher or enrolled student
  const isTeacher = classroom.teacherId._id.toString() === userId;
  const isStudent = enrolledUsers.some(u => u._id.toString() === userId);

  if (!isTeacher && !isStudent) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this classroom'
    });
  }

  // Get stats
  // Use the enrolled users array for accurate count
  const totalStudents = enrolledUsers?.length || 0;
  const totalTests = classroom.tests?.length || 0;

  // Calculate average score from actual student test results
  let avgScore = 0;
  if (classroom.tests && classroom.tests.length > 0) {
    try {
      const testIds = classroom.tests.map(t => t._id);
      const results = await Result.aggregate([
        {
          $match: { testId: { $in: testIds } }
        },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$percentage' }
          }
        }
      ]);
      avgScore = results.length > 0 ? Math.round(results[0].avgScore) : 0;
    } catch (error) {
      console.error('Error calculating average score:', error);
      avgScore = 0;
    }
  }

  res.status(200).json({
    success: true,
    data: {
      id: classroom._id,
      _id: classroom._id,
      name: classroom.name,
      handle: classroom.handle,
      subject: classroom.subject,
      description: classroom.description,
      teacherId: classroom.teacherId._id,
      teacherName: classroom.teacherId.name,
      totalStudents,
      totalTests,
      avgScore,
      students: enrolledUsers.map(u => ({
        _id: u._id,
        id: u._id,
        name: u.name,
        handle: u.handle || u.username,
        email: u.email,
        avatar: u.avatar
      })),
      tests: classroom.tests,
      createdAt: classroom.createdAt,
      updatedAt: classroom.updatedAt
    }
  });
});

/**
 * @desc    Update classroom details
 * @route   PUT /api/classrooms/:id
 * @access  Private (Teacher only)
 */
export const updateClassroom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, subject, description, handle } = req.body;
  const userId = req.userId;

  const classroom = await Classroom.findById(id);

  if (!classroom) {
    return res.status(404).json({
      success: false,
      error: 'Classroom not found'
    });
  }

  // Check authorization
  if (classroom.teacherId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this classroom'
    });
  }

  // Update allowed fields
  if (name) {
    classroom.name = name.trim();
    // Regenerate handle if name changes and no custom handle provided
    if (!handle) {
      classroom.handle = await generateClassroomHandle(classroom.name);
    }
  }

  if (subject) {
    classroom.subject = subject;
  }

  if (description !== undefined) {
    classroom.description = description ? description.trim() : '';
  }

  if (handle) {
    // Validate new handle is unique
    const handleUnique = await isHandleUnique(handle, id);
    if (!handleUnique) {
      return res.status(400).json({
        success: false,
        error: 'This classroom handle is already taken'
      });
    }
    classroom.handle = handle;
  }

  classroom.updatedAt = new Date();
  await classroom.save();

  res.status(200).json({
    success: true,
    message: 'Classroom updated successfully',
    data: {
      id: classroom._id,
      _id: classroom._id,
      name: classroom.name,
      handle: classroom.handle,
      subject: classroom.subject,
      description: classroom.description,
      updatedAt: classroom.updatedAt
    }
  });
});

/**
 * @desc    Delete a classroom
 * @route   DELETE /api/classrooms/:id
 * @access  Private (Teacher only)
 */
export const deleteClassroom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const classroom = await Classroom.findById(id);

  if (!classroom) {
    return res.status(404).json({
      success: false,
      error: 'Classroom not found'
    });
  }

  // Check authorization
  if (classroom.teacherId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this classroom'
    });
  }

  // Soft delete - mark as inactive instead of removing
  classroom.isActive = false;
  await classroom.save();

  // Remove classroom from teacher's profile
  await User.findByIdAndUpdate(
    userId,
    { $pull: { classrooms: id } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Classroom deleted successfully'
  });
});

/**
 * @desc    Get classroom statistics
 * @route   GET /api/classrooms/:id/stats
 * @access  Private
 * @future  Implement detailed analytics
 */
export const getClassroomStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const classroom = await Classroom.findById(id);

  if (!classroom) {
    return res.status(404).json({
      success: false,
      error: 'Classroom not found'
    });
  }

  // TODO: Implement comprehensive analytics
  // - Topic-wise performance
  // - Student strengths/weaknesses
  // - Heatmap data
  // - Engagement metrics

  res.status(200).json({
    success: true,
    data: {
      id: classroom._id,
      totalStudents: classroom.students.length,
      totalTests: classroom.tests.length,
      message: 'Analytics endpoint placeholder - implement in next phase'
    }
  });
});

/**
 * @desc    Enroll a student into a classroom by handle or userId
 * @route   POST /api/classrooms/:id/enroll
 * @route   POST /api/classrooms/:id/students
 * @access  Private (Teacher only)
 */
export const enrollStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, userHandle, studentId } = req.body;
  const teacherId = req.userId;

  // Validate classroom exists and teacher owns it
  const classroom = await Classroom.findById(id);
  if (!classroom) {
    return res.status(404).json({ success: false, error: 'Classroom not found' });
  }

  if (classroom.teacherId.toString() !== teacherId) {
    console.warn(`⚠️ Unauthorized enrollment attempt: user ${teacherId} tried to enroll in classroom ${id}`);
    return res.status(403).json({ success: false, error: 'Not authorized to enroll students in this classroom' });
  }

  // Lookup user by multiple possible identifiers: studentId (could be _id or handle), userHandle, or userId
  let user = null;
  const lookup = async (val) => {
    if (!val) return null;
    // Try ObjectId lookup
    if (/^[0-9a-fA-F]{24}$/.test(val)) {
      const byId = await User.findById(val);
      if (byId) return byId;
    }
    // Try by handle (lowercase)
    const byHandle = await User.findOne({ handle: val.toLowerCase().trim() });
    if (byHandle) return byHandle;
    // Try by username field (if exists)
    const byUsername = await User.findOne({ username: val });
    if (byUsername) return byUsername;
    return null;
  };

  if (studentId) {
    user = await lookup(studentId);
    if (!user) {
      console.warn(`⚠️ User not found by studentId: ${studentId}`);
      return res.status(404).json({ success: false, error: 'Student ID does not exist' });
    }
  } else if (userHandle) {
    user = await lookup(userHandle);
    if (!user) {
      console.warn(`⚠️ User not found by handle: ${userHandle}`);
      return res.status(404).json({ success: false, error: 'Student ID does not exist' });
    }
  } else if (userId) {
    user = await User.findById(userId);
    if (!user) {
      console.warn(`⚠️ User not found by ID: ${userId}`);
      return res.status(404).json({ success: false, error: 'Student ID does not exist' });
    }
  } else {
    return res.status(400).json({ success: false, error: 'studentId or userHandle or userId is required' });
  }

  // Allow any user to be added to classroom (teachers can be students in other classrooms)
  // Removed strict role check - users can have multiple roles

  // Prevent duplicate enrollment (handle ObjectId array)
  const already = (classroom.students || []).some((s) => s.toString() === user._id.toString());
  if (already) {
    console.warn(`⚠️ Duplicate enrollment: student ${user._id} already in classroom ${id}`);
    return res.status(400).json({ success: false, error: 'This user is already added' });
  }

  // Add user to classroom students array
  classroom.students = classroom.students || [];
  classroom.students.push(user._id);
  await classroom.save();

  // Update user's classrooms (avoid duplicate push with $addToSet)
  await User.findByIdAndUpdate(
    user._id,
    { $addToSet: { classrooms: classroom._id } },
    { new: true }
  );

  console.log(`✅ Student enrolled: ${user.handle || user._id} (${user._id}) in classroom ${id}`);

  // Populate the classroom students for return
  const populated = await Classroom.findById(id).populate('students', 'name handle username email avatar');

  res.status(201).json({
    success: true,
    message: 'Student enrolled successfully',
    data: {
      classroom: {
        id: populated._id,
        _id: populated._id,
        name: populated.name,
        students: (populated.students || []).map((u) => ({
          id: u._id,
          _id: u._id,
          name: u.name,
          handle: u.handle || u.username,
          email: u.email,
          avatar: u.avatar
        }))
      },
      addedStudent: {
        id: user._id,
        _id: user._id,
        name: user.name,
        handle: user.handle || user.username,
        email: user.email,
        avatar: user.avatar
      }
    }
  });
});

/**
 * @desc    Get classroom tests (placeholder)
 * @route   GET /api/classrooms/:id/tests
 * @access  Private
 */
export const getClassroomTests = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const classroom = await Classroom.findById(id);
  if (!classroom) {
    return res.status(404).json({ success: false, error: 'Classroom not found' });
  }

  // Fetch tests linked to this classroom
  const tests = await Test.find({ classroomId: id }).select('topic title difficulty totalQuestions duration status isPublished testCode createdAt avgScore');

  // Normalize to include `title` expected by frontend (fallback to topic)
  const normalized = tests.map((t) => ({
    _id: t._id,
    id: t._id,
    title: t.title || t.topic || 'Untitled Test',
    topic: t.topic,
    difficulty: t.difficulty,
    totalQuestions: t.totalQuestions,
    duration: t.duration,
    status: t.status,
    isPublished: t.isPublished || t.status === 'published',
    testCode: t.testCode,
    createdAt: t.createdAt,
    avgScore: t.avgScore || 0
  }));

  res.status(200).json({ success: true, data: normalized });
});

/**
 * @desc Create a test for a classroom
 * @route POST /api/classrooms/:id/tests
 * @access Private (Teacher only)
 */
export const createClassroomTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { topic, difficulty, questions, duration, totalQuestions, testType, isPublic } = req.body;

  // Basic validation
  if (!topic || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ success: false, error: 'Test must include a topic and at least one question' });
  }

  const classroom = await Classroom.findById(id);
  if (!classroom) {
    return res.status(404).json({ success: false, error: 'Classroom not found' });
  }

  // Only teacher can create tests for the classroom
  if (classroom.teacherId.toString() !== userId) {
    console.warn(`⚠️ Unauthorized test creation: user ${userId} tried to create test in classroom ${id}`);
    return res.status(403).json({ success: false, error: 'Not authorized to create tests for this classroom' });
  }

  // Create test with both createdBy and teacherId set
  const test = await Test.create({
    topic: topic.trim(),
    difficulty: difficulty || 'medium',
    questions,
    duration: duration || 15,
    createdBy: userId,
    teacherId: userId,
    classroomId: classroom._id,
    testType: testType || 'mcq',
    isPublic: !!isPublic,
    totalQuestions: totalQuestions || questions.length
  });

  // Add to classroom tests array
  classroom.tests = classroom.tests || [];
  classroom.tests.push(test._id);
  await classroom.save();

  // Add test to user's createdTests array
  await User.findByIdAndUpdate(
    userId,
    { $push: { createdTests: test._id } },
    { new: true }
  );

  console.log(`✅ Test created: ${test._id} (${test.testCode}) in classroom ${id} by teacher ${userId}`);

  const out = {
    id: test._id,
    _id: test._id,
    title: test.title || test.topic || 'Untitled Test',
    topic: test.topic,
    difficulty: test.difficulty,
    totalQuestions: test.totalQuestions,
    duration: test.duration,
    status: test.status,
    testCode: test.testCode,
    createdAt: test.createdAt
  };

  res.status(201).json({ success: true, data: out });
});

/**
 * @desc    Get students for a classroom
 * @route   GET /api/classrooms/:id/students
 * @access  Private
 */
export const getClassroomStudents = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const classroom = await Classroom.findById(id).populate('teacherId', 'name');
  if (!classroom) {
    return res.status(404).json({ success: false, error: 'Classroom not found' });
  }

  // Only teacher can view students in their classroom
  const isTeacher = classroom.teacherId && classroom.teacherId._id.toString() === userId;
  if (!isTeacher) {
    return res.status(403).json({ success: false, error: 'Not authorized to view students' });
  }

  // Fetch enrolled users from User collection
  const enrolledUsers = await User.find({ 
    _id: { $in: classroom.students || [] } 
  }).select('_id name handle username email avatar createdAt');

  // Normalize response
  const students = enrolledUsers.map((u) => ({
    id: u._id,
    _id: u._id,
    name: u.name,
    handle: u.handle || u.username,
    email: u.email,
    avatar: u.avatar,
    enrolledDate: u.createdAt,
    testsCompleted: 0,
    avgScore: 0
  }));

  res.status(200).json({ success: true, data: students });
});

/**
 * @desc    Remove a student from a classroom
 * @route   DELETE /api/classrooms/:id/students/:userId
 * @access  Private (Teacher only)
 */
export const removeStudent = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  const teacherId = req.userId;

  const classroom = await Classroom.findById(id);
  if (!classroom) {
    return res.status(404).json({ success: false, error: 'Classroom not found' });
  }

  // Only teacher can remove students
  if (classroom.teacherId.toString() !== teacherId) {
    return res.status(403).json({ success: false, error: 'Not authorized to remove students' });
  }

  // Verify user is enrolled
  if (!classroom.students || !classroom.students.includes(userId)) {
    return res.status(404).json({ success: false, error: 'Student not enrolled in this classroom' });
  }

  // Remove user from classroom students array
  classroom.students = classroom.students.filter(
    (id) => id.toString() !== userId
  );
  await classroom.save();

  res.status(200).json({
    success: true,
    message: 'Student removed from classroom successfully'
  });
});
