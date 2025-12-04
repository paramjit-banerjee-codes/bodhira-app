import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    avatar: {
      type: String,
      default: null
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'Classroom ID is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    stats: {
      totalTests: {
        type: Number,
        default: 0
      },
      completedTests: {
        type: Number,
        default: 0
      },
      avgScore: {
        type: Number,
        default: 0
      },
      totalAttempts: {
        type: Number,
        default: 0
      }
    },
    weaknesses: [
      {
        skill: String,
        score: Number
      }
    ],
    strengths: [
      {
        skill: String,
        score: Number
      }
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending'
    },
    inviteAcceptedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for quick lookups
studentSchema.index({ classroomId: 1, email: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
