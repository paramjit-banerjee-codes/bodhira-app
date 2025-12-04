import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length === 4;
      },
      message: 'Each question must have exactly 4 options',
    },
  },
  correctAnswer: {
    type: String,
    required: true,
    trim: true,
  },
});

const testSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [200, 'Topic cannot exceed 200 characters'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0 && v.length <= 50;
        },
        message: 'Test must have between 1 and 50 questions',
      },
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 1,
      max: 180,
      default: 15,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      default: null
    },
    testType: {
      type: String,
      enum: ['mcq', 'descriptive', 'mixed'],
      default: 'mcq'
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'draft'
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    testCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 6,
      maxlength: 8,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true, // Index for efficient expiration queries
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
testSchema.index({ topic: 1, createdAt: -1 });
testSchema.index({ createdBy: 1, createdAt: -1 });
testSchema.index({ difficulty: 1 });
// TTL Index: Automatically delete tests 1 second after expiresAt (MongoDB runs TTL cleanup every 60 seconds)
testSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 1 });
// Note: testCode already has index from unique: true constraint, no need to add another

// Auto-generate a unique 6-character testCode (A-Z0-9)
// FAST: No database collision check - collision probability is negligible (1 in 2.1B)
testSchema.pre('validate', function (next) {
  if (this.testCode) return next();

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const code = Array.from({ length: 6 })
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join('');

  this.testCode = code;
  next();
});

// Virtual for calculating average time per question
testSchema.virtual('timePerQuestion').get(function () {
  return Math.round((this.duration * 60) / this.totalQuestions);
});

const Test = mongoose.model('Test', testSchema);

export default Test;