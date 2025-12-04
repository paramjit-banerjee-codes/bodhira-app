import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

/**
 * Check if a user can start a test based on free trial or subscription
 * Returns: { canStart: boolean, reason: string }
 */
export const canStartTest = async (userId) => {
  try {
    const now = new Date();

    // Check if user has active subscription
    const subscription = await Subscription.findOne({
      userId,
      status: 'active',
      expiryDate: { $gt: now },
    });

    if (subscription) {
      return {
        canStart: true,
        reason: 'active_subscription',
        expiryDate: subscription.expiryDate,
      };
    }

    // Check free tests remaining
    const user = await User.findById(userId).select('free_tests_used');
    if (!user) {
      return {
        canStart: false,
        reason: 'user_not_found',
      };
    }

    if (user.free_tests_used < 5) {
      return {
        canStart: true,
        reason: 'free_trial',
        testsRemaining: 5 - user.free_tests_used,
      };
    }

    // No subscription and free tests exhausted
    return {
      canStart: false,
      reason: 'no_entitlement',
      message: 'Free tests exhausted. Please subscribe to continue.',
    };
  } catch (error) {
    console.error('Error checking test entitlement:', error);
    return {
      canStart: false,
      reason: 'error',
      message: error.message,
    };
  }
};

/**
 * Increment free tests used counter
 */
export const incrementFreeTestsUsed = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { free_tests_used: 1 },
      },
      { new: true }
    );
    return user.free_tests_used;
  } catch (error) {
    console.error('Error incrementing free tests:', error);
    throw error;
  }
};

/**
 * Reset free tests at start of month (runs once per month per user)
 */
export const resetMonthlyFreeTests = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { free_tests_used: 0 });
    return true;
  } catch (error) {
    console.error('Error resetting free tests:', error);
    throw error;
  }
};
