import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    plan: {
      type: String,
      enum: ['single', 'monthly', '6months', 'yearly'],
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    lastPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for querying active subscriptions
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ expiryDate: 1, status: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
