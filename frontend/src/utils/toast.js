/**
 * Simple toast notification utility
 * Creates temporary notification messages
 */

const createToast = (message, type = 'info', duration = 3000) => {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  const bgColor = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  }[type] || '#3b82f6';

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  }[type] || 'ℹ️';

  toast.style.cssText = `
    background-color: ${bgColor};
    color: white;
    padding: 14px 20px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
    pointer-events: auto;
    cursor: pointer;
  `;
  
  toast.textContent = `${icon} ${message}`;
  toastContainer.appendChild(toast);

  // Auto remove after duration
  const timeoutId = setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => {
      toast.remove();
      if (toastContainer.children.length === 0) {
        toastContainer.remove();
        document.getElementById('toast-container')?.remove();
      }
    }, 300);
  }, duration);

  // Allow manual dismiss
  toast.addEventListener('click', () => {
    clearTimeout(timeoutId);
    toast.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => {
      toast.remove();
      if (toastContainer.children.length === 0) {
        toastContainer.remove();
        document.getElementById('toast-container')?.remove();
      }
    }, 300);
  });
};

// Add CSS animations to document if not present
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export const toast = {
  success: (message, duration = 3000) => createToast(message, 'success', duration),
  error: (message, duration = 4000) => createToast(message, 'error', duration),
  info: (message, duration = 3000) => createToast(message, 'info', duration),
  warning: (message, duration = 3500) => createToast(message, 'warning', duration)
};

export default toast;
