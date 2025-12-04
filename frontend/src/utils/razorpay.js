import { paymentAPI } from '../services/api';

// Subscription plans
export const PLANS = {
  single: {
    name: 'Single Test',
    price: 29,
    originalPrice: 39,
    validity: 1,
    description: '₹29 per test - Pay as you go',
    discount: 26,
  },
  monthly: {
    name: 'Monthly',
    price: 299,
    originalPrice: 349,
    validity: 30,
    description: '₹299 for 30 days - Unlimited tests',
    discount: 14,
  },
  '6months': {
    name: '6 Months',
    price: 1499,
    originalPrice: 1799,
    validity: 180,
    description: '₹1499 for 180 days - Unlimited tests',
    discount: 17,
  },
  yearly: {
    name: 'Yearly',
    price: 2499,
    originalPrice: 3999,
    validity: 365,
    description: '₹2499 for 365 days - Unlimited tests',
    discount: 38,
  },
};

/**
 * Load Razorpay script from CDN
 */
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Razorpay script'));
    };

    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay Standard Checkout with all payment methods
 * @param {string} orderId - Razorpay order ID
 * @param {object} options - Additional options (email, contact, plan, amount)
 * @param {function} onSuccess - Callback on successful payment
 * @param {function} onFailure - Callback on failed payment
 */
export const openRazorpayCheckout = async (
  orderId,
  options = {},
  onSuccess,
  onFailure
) => {
  try {
    // Load Razorpay script
    await loadRazorpayScript();

    const plan = PLANS[options.plan] || PLANS.monthly;

    // Razorpay Standard Checkout options with all payment methods enabled
    const razorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: orderId,
      amount: options.amount * 100, // Amount in paise
      currency: 'INR',
      description: plan.description,
      receipt: `receipt_${Date.now()}`,
      
      // Payment capture enabled
      payment_capture: 1,

      // Enable all payment methods
      method: {
        upi: true,          // UPI (GPay, PhonePe, Paytm UPI, etc.)
        card: true,         // Cards (Debit, Credit, RuPay)
        wallet: true,       // Wallets (Paytm, PhonePe, etc.)
        netbanking: true,   // Netbanking
      },

      // User prefill for faster checkout
      prefill: {
        name: options.name || '',
        email: options.email || '',
        contact: options.contact || '',
      },

      // Theme colors
      theme: {
        color: '#60a5fa',
        backdrop_color: 'rgba(15, 23, 42, 0.5)',
      },

      // Success callback
      handler: async (response) => {
        try {
          console.log('Payment response:', response);

          // Verify payment on backend
          const result = await paymentAPI.verifyPayment({
            razorpayOrderId: orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (result.data.success) {
            console.log('Payment verified successfully');
            onSuccess(result.data);
          } else {
            console.error('Verification failed:', result.data);
            onFailure(result.data.error || 'Payment verification failed');
          }
        } catch (error) {
          console.error('Verification error:', error);
          onFailure(error.response?.data?.error || 'Payment verification failed');
        }
      },

      // Modal callbacks
      modal: {
        ondismiss: () => {
          console.log('Payment modal closed');
          onFailure('Payment cancelled by user');
        },
        onclose: () => {
          console.log('Payment modal closed');
        },
      },

      // Notes for additional data
      notes: {
        plan: options.plan || 'monthly',
        note: 'Subscription payment for mock test app',
      },

      // Retry settings
      retry: {
        enabled: true,
        max_count: 2,
      },
    };

    // Open Razorpay Standard Checkout
    console.log('Opening Razorpay checkout with options:', razorpayOptions);
    const rzp = new window.Razorpay(razorpayOptions);

    // Handle modal close events
    rzp.on('payment.failed', (response) => {
      console.error('Payment failed:', response);
      onFailure(
        response.error?.description ||
          'Payment failed. Please try again.'
      );
    });

    rzp.open();
  } catch (error) {
    console.error('Error opening Razorpay checkout:', error);
    onFailure(error.message || 'Error opening payment gateway');
  }
};

/**
 * Process subscription payment - create order and open checkout
 * @param {string} plan - Subscription plan ("monthly", "6months", "yearly")
 * @param {object} userData - User data for prefill
 * @param {function} onSuccess - Callback on success
 * @param {function} onFailure - Callback on failure
 */
export const processSubscriptionPayment = async (
  plan,
  userData,
  onSuccess,
  onFailure
) => {
  try {
    if (!plan || !PLANS[plan]) {
      onFailure('Invalid subscription plan');
      return;
    }

    // Step 1: Create order on backend
    const orderResponse = await paymentAPI.createOrder({
      plan,
    });

    if (!orderResponse.data.success) {
      onFailure('Failed to create payment order');
      return;
    }

    console.log('Order created:', orderResponse.data);

    // Step 2: Open Razorpay Standard Checkout
    openRazorpayCheckout(
      orderResponse.data.orderId,
      {
        ...userData,
        plan,
        amount: orderResponse.data.amount,
      },
      onSuccess,
      onFailure
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    onFailure(error.response?.data?.error || 'Payment processing failed');
  }
};
