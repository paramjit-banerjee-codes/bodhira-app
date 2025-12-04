import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  selectedAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    testCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    answers: {
      type: [answerSchema],
      required: true,
    },
    timeTaken: {
      type: Number, // in seconds
      required: true,
      min: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    rank: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for leaderboard and user history
resultSchema.index({ topic: 1, score: -1, timeTaken: 1 });
resultSchema.index({ userId: 1, createdAt: -1 });
resultSchema.index({ testId: 1 });
resultSchema.index({ topic: 1, percentage: -1 });

// Pre-save hook to calculate percentage and passed status
resultSchema.pre('save', function (next) {
  this.percentage = Math.round((this.score / this.totalQuestions) * 100);
  this.passed = this.percentage >= 60; // Pass mark is 60%
  next();
});

const Result = mongoose.model('Result', resultSchema);

export default Result;