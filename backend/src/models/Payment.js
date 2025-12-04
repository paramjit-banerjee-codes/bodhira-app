import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
    },
    plan: {
      type: String,
      enum: ['single', 'monthly', '6months', 'yearly'],
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
      sparse: true,
    },
    description: {
      type: String,
      default: 'Payment for premium features',
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      sparse: true,
    },
    failureReason: {
      type: String,
      sparse: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Index for querying user payments
paymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
