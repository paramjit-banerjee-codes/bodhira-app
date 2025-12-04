import { useState } from 'react';
import { X, User } from 'lucide-react';
import toast from '../utils/toast';

export default function AddStudentModal({ onClose, onSave, onError }) {
  const [userHandle, setUserHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userHandle.trim()) {
      setError('Student ID is required');
      return;
    }

    // Remove @ prefix if user includes it
    const handle = userHandle.trim().replace(/^@/, '');

    setLoading(true);
    setError('');
    
    try {
      await onSave({ userHandle: handle });
      setUserHandle('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to add student';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        style={{
          animation: 'fadeIn 0.2s ease-out',
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <div 
          className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            border: '1px solid rgba(148, 163, 184, 0.15)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={20} color="white" />
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#f1f5f9',
                margin: 0
              }}>Add Student</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Close"
              style={{ fontSize: '24px' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '32px 28px' }}>
            {/* Input Group */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Student Handle or ID
              </label>
              <input
                type="text"
                value={userHandle}
                onChange={(e) => {
                  setUserHandle(e.target.value);
                  setError('');
                }}
                placeholder="@john_1234 or john_1234"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  border: error ? '2px solid #ef4444' : '1px solid rgba(148, 163, 184, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#f1f5f9',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? '#ef4444' : 'rgba(148, 163, 184, 0.2)';
                  e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2)';
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#94a3b8',
                marginTop: '8px',
                margin: '8px 0 0 0'
              }}>
                Ask the student to share their unique handle from their profile (e.g., @john_1234).
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '13px',
                animation: 'slideDown 0.2s ease-out'
              }}>
                ❌ {error}
              </div>
            )}

            {/* Info Box */}
            <div style={{
              marginBottom: '28px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                fontSize: '12px',
                color: '#93c5fd',
                lineHeight: '1.5'
              }}>
              💡 The student will be added to your classroom and can access tests you publish.
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  background: 'rgba(30, 41, 59, 0.6)',
                  color: '#cbd5e1',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.4)';
                    e.target.style.background = 'rgba(30, 41, 59, 0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                    e.target.style.background = 'rgba(30, 41, 59, 0.6)';
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !userHandle.trim()}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: 'none',
                  background: (loading || !userHandle.trim()) ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  cursor: (loading || !userHandle.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: (loading || !userHandle.trim()) ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)',
                  opacity: (loading || !userHandle.trim()) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading && userHandle.trim()) {
                    e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                    e.target.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && userHandle.trim()) {
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {loading ? '⏳ Adding...' : '➕ Add Student'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
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
    </>
  );
}
