import React from 'react';

export default function ComingSoonModal({ isOpen, onClose }) {
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
        zIndex: 2000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          borderRadius: '16px',
          padding: '48px 40px',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          animation: 'slideInUp 0.3s ease-out',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: '64px',
            marginBottom: '24px',
          }}
        >
          ✨
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#f1f5f9',
            margin: '0 0 16px 0',
            letterSpacing: '-0.5px',
          }}
        >
          Light Theme Coming Soon
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: '16px',
            color: '#cbd5e1',
            margin: '0 0 32px 0',
            lineHeight: '1.6',
          }}
        >
          We're polishing up our beautiful light theme to give you the perfect experience. Stay tuned! 🌟
        </p>

        {/* CTA Button */}
        <button
          onClick={onClose}
          style={{
            padding: '12px 32px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            letterSpacing: '0.3px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Got It! 👍
        </button>

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
    </div>
  );
}
