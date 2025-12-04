// 🎨 CLASSROOM UI - PREMIUM DESIGN PATTERNS & CODE EXAMPLES

/**
 * Pattern 1: Premium Card with Hover Lift Effect
 * Used in: Overview (stat cards), Tests (test cards), Students (student cards)
 */

const PREMIUM_CARD_PATTERN = `
<div style={{
  // Base styling
  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  borderRadius: '16px',
  padding: '28px 24px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  
  // Hover effects
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-8px)';
    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.25)';
  }},
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
    e.currentTarget.style.boxShadow = 'none';
  }}
}}>
  {/* Content */}
</div>
`;

/**
 * Pattern 2: Status Badge with Color Coding
 * Used in: Tests (Published/Draft indicators)
 */

const STATUS_BADGE_PATTERN = `
<span style={{
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  background: test.isPublished ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
  color: test.isPublished ? '#6ee7b7' : '#fcd34d',
}}>
  {test.isPublished ? '✓ Published' : '⏳ Draft'}
</span>
`;

/**
 * Pattern 3: Glass Morphism Search Bar
 * Used in: Tests & Students tabs
 */

const GLASS_SEARCH_PATTERN = `
<input
  type="text"
  placeholder="Search..."
  style={{
    width: '100%',
    padding: '12px 16px 12px 40px',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '14px',
    transition: 'all 0.3s ease',
  }}
  onFocus={(e) => {
    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
  }}
  onBlur={(e) => {
    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)';
  }}
/>
`;

/**
 * Pattern 4: Action Button with Glow Effect
 * Used in: Create Test, Publish, Preview buttons
 */

const ACTION_BUTTON_PATTERN = `
<button
  style={{
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  ✨ Create Test
</button>
`;

/**
 * Pattern 5: Responsive Grid Layout
 * Used in: Test cards, Student cards (auto-fill)
 */

const RESPONSIVE_GRID_PATTERN = `
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '16px',
}}>
  {/* Cards automatically wrap and fill available space */}
  {items.map((item) => <Card key={item.id} />)}
</div>
`;

/**
 * Pattern 6: Staggered Animation Entry
 * Used in: Test cards, Student cards entering
 */

const STAGGERED_ANIMATION_PATTERN = `
<div
  style={{
    animation: \`slide-up 0.4s ease-out \${idx * 0.05}s both\`,
  }}
>
  {/* Each item in the grid delays by 50ms */}
  {/* Creates cascading entrance effect */}
</div>

/* In CSS */
@keyframes slide-up {
  from { 
    transform: translateY(20px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}
`;

/**
 * Pattern 7: Color-Coded Gradient Background
 * Used in: Stat cards with different colors
 */

const COLOR_CODED_GRADIENTS = {
  emerald: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
  amber: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
  blue: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%)',
  rose: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(244, 63, 94, 0.05) 100%)',
};

/**
 * Pattern 8: Modal with Glass Morphism
 * Used in: Add Student modal, Add Test modal (future)
 */

const GLASS_MODAL_PATTERN = `
<div style={{
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}}>
  <div style={{
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  }}>
    {/* Modal content */}
  </div>
</div>
`;

/**
 * Pattern 9: Empty State Illustration
 * Used in: No tests, No students, No results
 */

const EMPTY_STATE_PATTERN = `
<div style={{
  textAlign: 'center',
  padding: '80px 32px',
  background: 'rgba(30, 41, 59, 0.2)',
  borderRadius: '16px',
  border: '2px dashed rgba(148, 163, 184, 0.2)',
}}>
  <div style={{ fontSize: '56px', marginBottom: '16px' }}>📝</div>
  <p style={{ fontSize: '18px', fontWeight: '600', color: '#cbd5e1', margin: '0 0 8px 0' }}>
    No tests yet
  </p>
  <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, marginBottom: '24px' }}>
    Create your first test to get started
  </p>
</div>
`;

/**
 * Pattern 10: Loading Spinner
 * Used in: Fetching data, Processing actions
 */

const LOADING_SPINNER_PATTERN = `
<div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
  <div style={{
    display: 'inline-block',
    width: '40px',
    height: '40px',
    border: '4px solid rgba(59, 130, 246, 0.2)',
    borderTopColor: '#60a5fa',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }} />
</div>

/* In CSS */
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

/**
 * ANIMATION TIMINGS & EASING
 */

const ANIMATION_SPECS = {
  hover: {
    duration: '0.3s',
    easing: 'ease',
    properties: 'all'
  },
  entrance: {
    duration: '0.4s',
    easing: 'ease-out',
    delay: 'staggered (idx * 0.05s)'
  },
  emphasis: {
    duration: '1.5s',
    easing: 'ease-in-out',
    iteration: 'infinite'
  },
  loading: {
    duration: '1s',
    easing: 'linear',
    iteration: 'infinite'
  }
};

/**
 * COLOR SYSTEM
 */

const COLOR_SYSTEM = {
  primary: {
    main: '#60a5fa',
    dark: '#3b82f6',
    light: '#93c5fd',
  },
  success: {
    main: '#10b981',
    light: '#6ee7b7',
    gradient: 'rgba(16, 185, 129, 0.2)',
  },
  warning: {
    main: '#f59e0b',
    light: '#fcd34d',
    gradient: 'rgba(245, 158, 11, 0.2)',
  },
  danger: {
    main: '#f43f5e',
    light: '#fb7185',
    gradient: 'rgba(244, 63, 94, 0.2)',
  },
  neutral: {
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    bg: '#0f172a',
    bgSecondary: '#1e293b',
  }
};

/**
 * SPACING & SIZING CONSTANTS
 */

const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
};

const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '50%',
};

const SHADOWS = {
  none: 'none',
  sm: '0 4px 12px rgba(0, 0, 0, 0.1)',
  md: '0 8px 20px rgba(0, 0, 0, 0.15)',
  lg: '0 12px 30px rgba(0, 0, 0, 0.2)',
  glow: '0 0 20px rgba(96, 165, 250, 0.3)',
};

/**
 * RESPONSIVE BREAKPOINTS
 */

const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
  ultrawide: '1600px',
};

// ═════════════════════════════════════════════════════════════════

// 🎯 IMPLEMENTATION GUIDE

/**
 * To add a new premium card:
 * 1. Copy PREMIUM_CARD_PATTERN
 * 2. Update gradient colors for your theme
 * 3. Customize onMouseEnter/onMouseLeave for different effects
 * 4. Use COLOR_CODED_GRADIENTS for consistency
 * 5. Test on different breakpoints
 * 
 * To add animations:
 * 1. Define in ClassroomPremium.css @keyframes
 * 2. Reference by name in style.animation property
 * 3. Use staggered timing for grid items: ${idx * 0.05}s
 * 
 * To add responsive behavior:
 * 1. Use CSS Grid with auto-fill, minmax
 * 2. Test at all BREAKPOINTS
 * 3. Adjust gridTemplateColumns for each breakpoint
 * 
 * To maintain consistency:
 * 1. Use COLOR_SYSTEM for all colors
 * 2. Use SPACING for all margins/padding
 * 3. Use SHADOWS for all shadow effects
 * 4. Use ANIMATION_SPECS for timing
 */

// ═════════════════════════════════════════════════════════════════
