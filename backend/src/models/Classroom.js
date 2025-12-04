import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Classroom name is required'],
      trim: true,
      maxlength: [100, 'Classroom name cannot exceed 100 characters']
    },
    handle: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    subject: {
      type: String,
      enum: ['Programming', 'Web Development', 'Data Science', 'Mobile Development', 'Cloud Computing', 'DevOps', 'Other'],
      default: 'Programming'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required']
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
      }
    ],
    lessonPlans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LessonPlan'
      }
    ],
    inviteCode: {
      type: String,
      unique: true,
      sparse: true
    },
    isActive: {
      type: Boolean,
      default: true
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

// Pre-save hook to generate handle if not provided
classroomSchema.pre('save', async function (next) {
  if (!this.handle) {
    const handle = await generateUniqueHandle(this.name);
    this.handle = handle;
  }
  next();
});

// Function to generate unique handle
async function generateUniqueHandle(name) {
  const Classroom = mongoose.model('Classroom', classroomSchema);
  const baseHandle = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let handle = `${baseHandle}-${Math.floor(Math.random() * 10000)}`;
  let exists = await Classroom.findOne({ handle });

  // Ensure uniqueness
  while (exists) {
    handle = `${baseHandle}-${Math.floor(Math.random() * 10000)}`;
    exists = await Classroom.findOne({ handle });
  }

  return handle;
}

const Classroom = mongoose.model('Classroom', classroomSchema);

export default Classroom;
