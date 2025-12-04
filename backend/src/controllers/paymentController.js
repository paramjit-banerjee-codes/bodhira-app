import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

// Lazy initialize Razorpay instance to ensure environment variables are loaded
let razorpay;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Missing Razorpay credentials in environment variables');
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// Subscription pricing and duration
const SUBSCRIPTION_PLANS = {
  single: {
    amount: 29,
    validity: 1,
    description: 'Single Test - ₹29',
  },
  monthly: {
    amount: 299,
    validity: 30,
    description: 'Monthly subscription - ₹299',
  },
  '6months': {
    amount: 1499,
    validity: 180,
    description: '6 Months subscription - ₹1499',
  },
  yearly: {
    amount: 2499,
    validity: 365,
    description: 'Yearly subscription - ₹2499',
  },
};

/**
 * Create a Razorpay order for subscription plan
 * POST /api/payments/create-order
 * Body: { plan: "single" | "monthly" | "6months" | "yearly" }
 */
export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user._id;

    // Validate plan
    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        error: 'Invalid plan. Must be: single, monthly, 6months, or yearly',
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[plan];

    // Get user email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Razorpay order
    // Generate short receipt ID (max 40 chars for Razorpay)
    const shortId = userId.toString().substring(0, 12);
    const timestamp = Date.now().toString().substring(7); // Last 6 digits
    const receipt = `rcpt_${shortId}_${timestamp}`.substring(0, 40);
    
    const options = {
      amount: Math.round(planDetails.amount * 100), // Convert to paise
      currency: 'INR',
      receipt,
      description: planDetails.description,
    };

    const order = await getRazorpayInstance().orders.create(options);

    // Save payment record with pending status
    const payment = new Payment({
      userId,
      amount: planDetails.amount,
      currency: 'INR',
      plan,
      status: 'pending',
      razorpayOrderId: order.id,
      description: planDetails.description,
      email: user.email,
    });

    await payment.save();

    return res.status(201).json({
      success: true,
      orderId: order.id,
      amount: planDetails.amount,
      currency: 'INR',
      plan,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      error: 'Failed to create payment order',
      message: error.message,
    });
  }
};

/**
 * Verify Razorpay payment signature and create/extend subscription
 * POST /api/payments/verify-payment
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId,
      userId,
      status: 'pending',
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Verify HMAC signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValidSignature = expectedSignature === razorpaySignature;

    if (!isValidSignature) {
      payment.status = 'failed';
      payment.failureReason = 'Invalid signature';
      await payment.save();

      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
      });
    }

    // Verify payment with Razorpay
    const razorpayPayment = await getRazorpayInstance().payments.fetch(razorpayPaymentId);

    if (razorpayPayment.status !== 'captured') {
      payment.status = 'failed';
      payment.failureReason = `Payment status: ${razorpayPayment.status}`;
      await payment.save();

      return res.status(400).json({
        success: false,
        error: 'Payment not captured by Razorpay',
      });
    }

    // Update payment to success
    payment.status = 'success';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.completedAt = new Date();
    await payment.save();

    // Create or extend subscription
    const planDetails = SUBSCRIPTION_PLANS[payment.plan];
    const now = new Date();
    const expiryDate = new Date(now.getTime() + planDetails.validity * 24 * 60 * 60 * 1000);

    // Check if user has existing active subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      status: 'active',
      expiryDate: { $gt: now },
    });

    let subscription;
    if (existingSubscription) {
      // Extend existing subscription
      existingSubscription.expiryDate = new Date(
        existingSubscription.expiryDate.getTime() +
          planDetails.validity * 24 * 60 * 60 * 1000
      );
      existingSubscription.plan = payment.plan;
      existingSubscription.lastPaymentId = payment._id;
      subscription = await existingSubscription.save();
    } else {
      // Create new subscription
      subscription = new Subscription({
        userId,
        status: 'active',
        plan: payment.plan,
        startDate: now,
        expiryDate,
        lastPaymentId: payment._id,
      });
      await subscription.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated',
      payment: {
        _id: payment._id,
        amount: payment.amount,
        plan: payment.plan,
        status: payment.status,
      },
      subscription: {
        _id: subscription._id,
        plan: subscription.plan,
        expiryDate: subscription.expiryDate,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      error: 'Failed to verify payment',
      message: error.message,
    });
  }
};

/**
 * Get user's subscription status
 * GET /api/payments/subscription
 */
export const getSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const subscription = await Subscription.findOne({ userId }).populate(
      'lastPaymentId'
    );

    if (!subscription) {
      return res.status(200).json({
        success: true,
        subscription: null,
        status: 'no_subscription',
      });
    }

    // Check if subscription is still active
    const isActive = subscription.status === 'active' && subscription.expiryDate > now;

    return res.status(200).json({
      success: true,
      subscription: {
        _id: subscription._id,
        plan: subscription.plan,
        status: isActive ? 'active' : 'expired',
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        daysRemaining: isActive
          ? Math.ceil((subscription.expiryDate - now) / (24 * 60 * 60 * 1000))
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({
      error: 'Failed to fetch subscription',
      message: error.message,
    });
  }
};

/**
 * Get payment history
 * GET /api/payments/history
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, skip = 0 } = req.query;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-razorpaySignature');

    const total = await Payment.countDocuments({ userId });

    return res.status(200).json({
      success: true,
      payments,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({
      error: 'Failed to fetch payment history',
      message: error.message,
    });
  }
};

/**
 * Get user's free tests remaining
 * GET /api/payments/free-tests
 */
export const getFreeTests = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('free_tests_used');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const remaining = 5 - user.free_tests_used;

    return res.status(200).json({
      success: true,
      freeTestsUsed: user.free_tests_used,
      freeTestsRemaining: Math.max(0, remaining),
      freeTestsTotal: 5,
    });
  } catch (error) {
    console.error('Error fetching free tests:', error);
    return res.status(500).json({
      error: 'Failed to fetch free tests info',
      message: error.message,
    });
  }
};
