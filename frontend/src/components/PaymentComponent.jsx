import { useState, useEffect } from 'react';
import { processSubscriptionPayment, PLANS } from '../utils/razorpay';
import { paymentAPI } from '../services/api';

export default function PaymentComponent() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [freeTests, setFreeTests] = useState(null);
  const [message, setMessage] = useState(null);

  // Fetch current subscription and free tests status on mount
  useEffect(() => {
    fetchEntitlementStatus();
  }, []);

  const fetchEntitlementStatus = async () => {
    try {
      const [subRes, freeRes] = await Promise.all([
        paymentAPI.getSubscription(),
        paymentAPI.getFreeTests(),
      ]);

      setSubscription(subRes.data.subscription);
      setFreeTests(freeRes.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await processSubscriptionPayment(
        selectedPlan,
        {
          name: 'User', // Replace with actual user name from auth context
          email: 'user@example.com', // Replace with actual user email
          contact: '9876543210',
        },
        (response) => {
          // Success callback
          setMessage({
            type: 'success',
            text: `✅ Payment successful! ${PLANS[selectedPlan].name} subscription activated.`,
          });
          setSelectedPlan('monthly');
          setTimeout(fetchEntitlementStatus, 1000);
        },
        (error) => {
          // Failure callback
          setMessage({
            type: 'error',
            text: `❌ Payment failed: ${error}`,
          });
        }
      );
    } catch (error) {
      console.error('Payment error:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred during payment',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
      {/* Subscription Status */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.25)',
          border: '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2 style={{ margin: '0 0 20px', color: '#f1f5f9' }}>Your Entitlement</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Subscription Info */}
          <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
              Subscription
            </p>
            {subscription ? (
              <>
                <p style={{ margin: '0 0 4px', color: '#f1f5f9', fontSize: '18px', fontWeight: '600' }}>
                  {subscription.status === 'active' ? '✅ Active' : '❌ Expired'}
                </p>
                {subscription.status === 'active' && (
                  <p style={{ margin: '0', color: '#10b981', fontSize: '13px' }}>
                    {subscription.plan?.toUpperCase()} - Expires in {subscription.daysRemaining} days
                  </p>
                )}
              </>
            ) : (
              <p style={{ margin: '0', color: '#f43f5e', fontSize: '13px' }}>No active subscription</p>
            )}
          </div>

          {/* Free Tests Info */}
          <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
              Free Tests
            </p>
            {freeTests && (
              <>
                <p style={{ margin: '0 0 4px', color: '#f1f5f9', fontSize: '18px', fontWeight: '600' }}>
                  {freeTests.freeTestsRemaining} / {freeTests.freeTestsTotal}
                </p>
                <p style={{ margin: '0', color: '#60a5fa', fontSize: '13px' }}>
                  Tests remaining this month
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Plans Selection */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.25)',
          border: '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2 style={{ margin: '0 0 24px', color: '#f1f5f9' }}>Choose a Plan</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key)}
              style={{
                padding: '20px',
                border: selectedPlan === key ? '2px solid #60a5fa' : '1px solid rgba(148, 163, 184, 0.12)',
                borderRadius: '12px',
                background: selectedPlan === key ? 'rgba(96, 165, 250, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <h3 style={{ margin: '0 0 12px', color: '#f1f5f9', fontSize: '16px', fontWeight: '600' }}>
                {plan.name}
              </h3>
              <p style={{ margin: '0 0 4px', color: '#60a5fa', fontSize: '24px', fontWeight: '700' }}>
                ₹{plan.price}
              </p>
              <p style={{ margin: '0', color: '#94a3b8', fontSize: '12px' }}>
                {plan.validity} days access
              </p>
            </div>
          ))}
        </div>

        {/* Supported Payment Methods */}
        <div
          style={{
            background: 'rgba(96, 165, 250, 0.05)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <p style={{ margin: '0 0 12px', color: '#60a5fa', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
            ✓ Supported Payment Methods
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: '#cbd5e1' }}>
            <div>🏦 <strong>UPI:</strong> GPay, PhonePe, Paytm UPI</div>
            <div>📱 <strong>Wallets:</strong> Paytm, PhonePe Wallet</div>
            <div>💳 <strong>Cards:</strong> Debit, Credit, RuPay</div>
            <div>🏛️ <strong>Netbanking:</strong> All major banks</div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: loading ? '#64748b' : 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? 'Processing...' : `Subscribe to ${PLANS[selectedPlan].name} - ₹${PLANS[selectedPlan].price}`}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${message.type === 'success' ? '#10b981' : '#f43f5e'}`,
            color: message.type === 'success' ? '#10b981' : '#f43f5e',
            fontSize: '14px',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          {message.text}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
