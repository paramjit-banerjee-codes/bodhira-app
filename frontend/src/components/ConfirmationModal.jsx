import React from 'react';

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '420px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          animation: 'slideInUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#f1f5f9',
            margin: '0 0 12px 0',
            letterSpacing: '-0.3px',
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: '14px',
            color: '#a0aec0',
            margin: '0 0 28px 0',
            lineHeight: '1.6',
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          {/* Cancel Button */}
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              background: 'rgba(59, 130, 246, 0.05)',
              color: '#cbd5e1',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.6 : 1,
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.2)';
            }}
          >
            {cancelText}
          </button>

          {/* Confirm Button */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: isDangerous
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.6 : 1,
              boxShadow: isDangerous
                ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                : '0 4px 12px rgba(59, 130, 246, 0.3)',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.boxShadow = isDangerous
                  ? '0 6px 20px rgba(239, 68, 68, 0.4)'
                  : '0 6px 20px rgba(59, 130, 246, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isDangerous
                ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                : '0 4px 12px rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLoading ? '⏳ Processing...' : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
