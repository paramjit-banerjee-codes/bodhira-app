/**
 * GateExamResult Model
 * 
 * Stores complete GATE exam results with scoring data
 * Includes: section scores, negative marks, weak topics, per-question details
 */

import mongoose from 'mongoose';

const perQuestionSchema = new mongoose.Schema(
  {
    qid: String,
    qno: Number,
    sectionId: String,
    marks: Number,
    type: String, // MCQ, MSQ, NAT
    topic: String,
    difficulty: String,
    status: String, // correct, incorrect, unattempted
    awardedMarks: Number,
    correctAnswers: mongoose.Schema.Types.Mixed // Can be number, array, or string
  },
  { _id: false }
);

const weakTopicSchema = new mongoose.Schema(
  {
    topic: String,
    missedMarks: Number,
    totalMarks: Number,
    accuracy: Number // percentage
  },
  { _id: false }
);

const sectionScoreSchema = new mongoose.Schema(
  {
    score: Number,
    maxMarks: Number,
    totalQuestions: Number
  },
  { _id: false }
);

const gateExamResultSchema = new mongoose.Schema(
  {
    // Result ID
    resultId: {
      type: String,
      unique: true,
      sparse: true
    },

    // User and exam info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    examId: {
      type: String,
      required: true
    },
    examType: {
      type: String,
      default: 'GATE',
      enum: ['GATE']
    },
    subject: {
      type: String,
      required: true,
      index: true
    },

    // Overall scores
    totalScore: {
      type: Number,
      required: true,
      min: 0
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    totalNegativeMarks: {
      type: Number,
      default: 0,
      min: 0
    },

    // Section-wise scores
    sectionScores: {
      A: sectionScoreSchema,
      B: sectionScoreSchema
    },

    // Weak topics
    weakTopics: [weakTopicSchema],

    // Per-question details
    perQuestion: [perQuestionSchema],

    // Timing info
    startedAt: {
      type: Date,
      required: true
    },
    submittedAt: {
      type: Date,
      required: true
    },
    timeTakenSeconds: {
      type: Number,
      default: 0
    },

    // Status and metadata
    status: {
      type: String,
      enum: ['submitted', 'reviewed'],
      default: 'submitted'
    },
    notes: String,
    
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'gate_exam_results'
  }
);

// Indexes for querying
gateExamResultSchema.index({ userId: 1, submittedAt: -1 });
gateExamResultSchema.index({ userId: 1, subject: 1 });
gateExamResultSchema.index({ examId: 1 });
gateExamResultSchema.index({ submittedAt: -1 });

// Pre-save hook to generate resultId if not exists
gateExamResultSchema.pre('save', function (next) {
  if (!this.resultId) {
    this.resultId = `GATE_${this.subject}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  this.updatedAt = new Date();
  next();
});

const GateExamResult = mongoose.model('GateExamResult', gateExamResultSchema);

export default GateExamResult;
