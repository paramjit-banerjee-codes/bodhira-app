import express from 'express';
import {
  createClassroom,
  getClassroomsForTeacher,
  getClassroomById,
  updateClassroom,
  deleteClassroom,
  getClassroomStats,
  enrollStudent,
  getClassroomTests,
  createClassroomTest,
  getClassroomStudents,
  removeStudent
} from '../controllers/classroomController.js';
import { getStudentProgress } from '../controllers/studentController.js';
import { generateClassroomTestRequest } from '../controllers/generationController.js';
import requireAuth from '../middleware/authMiddleware.js';
import { requireOwnership, loadResource } from '../middleware/authorizationMiddleware.js';
import Classroom from '../models/Classroom.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

/**
 * Classroom Management Routes
 */

// Create classroom
router.post('/', createClassroom);

// Get all classrooms for teacher
router.get('/', getClassroomsForTeacher);

// Get classroom details (check if teacher or enrolled student)
router.get('/:id', getClassroomById);

// Enroll a student (supports both /:id/enroll and /:id/students)
router.post('/:id/enroll', loadResource(Classroom, 'id'), enrollStudent);
router.post('/:id/students', loadResource(Classroom, 'id'), enrollStudent);
// Alternate add-student path for compatibility: POST /api/classrooms/:id/add-student
router.post('/:id/add-student', loadResource(Classroom, 'id'), enrollStudent);

// List students in a classroom (requires teacher ownership)
router.get('/:id/students', loadResource(Classroom, 'id'), requireOwnership('teacherId'), getClassroomStudents);

// Get individual student progress (requires teacher ownership or student themselves)
router.get('/:id/students/:studentId', getStudentProgress);

// Remove student from classroom (requires teacher ownership)
router.delete('/:id/students/:userId', loadResource(Classroom, 'id'), requireOwnership('teacherId'), removeStudent);

// Get classroom tests (teacher or enrolled student only)
router.get('/:id/tests', loadResource(Classroom, 'id'), getClassroomTests);

// Generate test in a classroom (requires teacher ownership)
router.post('/:id/tests/generate', loadResource(Classroom, 'id'), requireOwnership('teacherId'), generateClassroomTestRequest);

// Create a test in a classroom (requires teacher ownership)
router.post('/:id/tests', loadResource(Classroom, 'id'), requireOwnership('teacherId'), createClassroomTest);

// Update classroom (requires teacher ownership)
router.put('/:id', loadResource(Classroom, 'id'), requireOwnership('teacherId'), updateClassroom);

// Delete classroom (requires teacher ownership)
router.delete('/:id', loadResource(Classroom, 'id'), requireOwnership('teacherId'), deleteClassroom);

// Get classroom statistics (requires teacher ownership)
router.get('/:id/stats', loadResource(Classroom, 'id'), requireOwnership('teacherId'), getClassroomStats);

// TODO: Add additional routes
// POST /api/classrooms/:id/students - Add student to classroom
// GET /api/classrooms/:id/students - List classroom students
// DELETE /api/classrooms/:id/students/:studentId - Remove student
// POST /api/classrooms/:id/invite-link - Generate invite link
// POST /api/classrooms/:id/tests - Create test in classroom
// GET /api/classrooms/:id/tests - List classroom tests
// POST /api/classrooms/:id/lesson-plans - Generate lesson plan
// GET /api/classrooms/:id/analytics - Get detailed analytics

export default router;
