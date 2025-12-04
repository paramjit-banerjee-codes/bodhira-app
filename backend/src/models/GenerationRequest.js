import mongoose from 'mongoose';

const generationRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      default: null,
    },
    type: {
      type: String,
      enum: ['ai', 'manual'],
      required: true,
    },
    promptOptions: {
      topic: String,
      numberOfQuestions: Number,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed'],
      default: 'pending',
      index: true,
    },
    result: {
      testId: mongoose.Schema.Types.ObjectId,
      title: String,
      topic: String,
      questions: [Object],
      totalQuestions: Number,
      difficulty: String,
      duration: Number,
      testCode: String,
    },
    error: {
      code: String,
      message: String,
      details: Object,
    },
    retries: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 2,
    },
    startedAt: Date,
    completedAt: Date,
    duration: Number, // milliseconds
  },
  { timestamps: true }
);

// Cleanup old completed requests (keep for 7 days)
generationRequestSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 604800 } // 7 days
);

export default mongoose.model('GenerationRequest', generationRequestSchema);
