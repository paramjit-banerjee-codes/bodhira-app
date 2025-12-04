import mongoose from 'mongoose';

const lessonPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson plan title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'Classroom ID is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    generatedFromTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      default: null
    },
    content: {
      sections: [
        {
          title: String,
          description: String,
          duration: Number, // in minutes
          objectives: [String],
          resources: [String]
        }
      ],
      learningObjectives: [String],
      assessmentCriteria: [String],
      additionalNotes: String
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    duration: {
      type: Number, // total duration in minutes
      default: 45
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    numberOfSections: {
      type: Number,
      default: 5
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    metadata: {
      generatedWithAI: {
        type: Boolean,
        default: false
      },
      generationModel: String, // e.g., 'models/gemini-2.0-flash'
      generationPrompt: String
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
lessonPlanSchema.index({ classroomId: 1, createdAt: -1 });
lessonPlanSchema.index({ createdBy: 1 });
lessonPlanSchema.index({ status: 1 });

const LessonPlan = mongoose.model('LessonPlan', lessonPlanSchema);

export default LessonPlan;
