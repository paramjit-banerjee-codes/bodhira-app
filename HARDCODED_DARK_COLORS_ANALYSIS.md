# Hardcoded Dark Theme Colors - Comprehensive Analysis

## Summary
This document identifies all CSS files with hardcoded dark theme colors that need light theme equivalents. The analysis focuses on colors that are not using CSS variables and are directly hardcoded into selectors.

---

## Color Mappings Reference

### Dark Theme → Light Theme Color Palettes

**Background Colors:**
- `#0f1728` (Very Dark) → `#ffffff` (White)
- `#0a0e27` (Very Dark) → `#ffffff` (White)
- `#0f1429` (Very Dark) → `#ffffff` (White)
- `#141a2f` (Very Dark) → `#f8fafc` (Off-white)
- `#0f172a` (Very Dark) → `#ffffff` (White)
- `#1a202c` (Very Dark) → `#f8fafc` (Off-white)
- `#1e293b` (Dark Slate) → `#f8fafc` (Off-white)
- `#334155` (Dark Slate) → `#e2e8f0` (Light Slate)

**Text Colors:**
- `#e2e8f0` (Light Slate) → `#1e293b` (Dark Slate)
- `#f1f5f9` (Almost White) → `#0f1728` (Dark)
- `#cbd5e1` (Light Gray) → `#475569` (Medium Gray)
- `#94a3b8` (Medium Gray) → `#64748b` (Medium Gray)
- `#64748b` (Medium Gray) → `#94a3b8` (Light Gray)

**Border Colors:**
- `#334155` → `#cbd5e1` or `#e2e8f0`
- `#e2e8f0` → `#334155` or `#475569`

**Gradient Backgrounds:**
- `#0f172a 0%, #1e293b 100%` → `#ffffff 0%, #f8fafc 100%`
- `#1e3a8a 0%, #1e293b 100%` → `#e0e7ff 0%, #f8fafc 100%`
- `#1e3a8a 0%, #1e40af 100%` → `#dbeafe 0%, #e0e7ff 100%`
- `#64748b 0%, #475569 100%` → `#cbd5e1 0%, #e2e8f0 100%`
- `#f1f5f9 0%, #cbd5e1 100%` → `#475569 0%, #1e293b 100%`

---

## Files with Hardcoded Dark Colors

### 1. **frontend/src/pages/Profile.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 10-13 | `.profile-container` | `#0a0e27`, `#0f1429`, `#141a2f` | Background Gradient | `#ffffff`, `#f8fafc`, `#f1f5f9` |
| 201 | `.profile-header h1` | `#f1f5f9` | Text Color | `#0f1728` |
| 204 | `.profile-header h1` | Linear gradient `#f1f5f9 0%, #cbd5e1 100%` | Gradient Text | `#475569 0%, #1e293b 100%` |
| 212 | `.profile-subtitle` | `#94a3b8` | Text Color | `#64748b` |
| 250 | `.profile-stat-label` | `#cbd5e1` | Text Color | `#475569` |
| 278 | `.profile-stat-value` | `#94a3b8` | Text Color | `#64748b` |
| 286 | `.profile-section-header h2` | `#f1f5f9` | Text Color | `#0f1728` |
| 361 | `.profile-section-title` | `#94a3b8` | Text Color | `#64748b` |
| 369 | `.profile-content` | `#f1f5f9` | Text Color | `#0f1728` |
| 391 | `.profile-item-label` | `#94a3b8` | Text Color | `#64748b` |
| 460 | `.profile-card h3` | `#f1f5f9` | Text Color | `#0f1728` |
| 470 | `.profile-card-subtitle` | `#94a3b8` | Text Color | `#64748b` |
| 481 | `.profile-description h4` | `#f1f5f9` | Text Color | `#0f1728` |
| 493 | `.profile-description p` | `#cbd5e1` | Text Color | `#475569` |
| 504 | `.profile-badges h4` | `#f1f5f9` | Text Color | `#0f1728` |
| 525 | `.badge-text` | `#64748b` | Text Color | `#94a3b8` |
| 535 | `.badge-count` | `#94a3b8` | Text Color | `#64748b` |
| 559 | `.achievement-item p` | `#cbd5e1` | Text Color | `#475569` |
| 607 | `.achievement-meta` | `#64748b` | Text Color | `#94a3b8` |
| 780 | `.verification-item-title` | `#94a3b8` | Text Color | `#64748b` |
| 812 | `.verification-item-value` | `#f1f5f9` | Text Color | `#0f1728` |
| 839 | `.verification-item-desc` | `#e2e8f0` | Text Color | `#1e293b` |
| 865 | `.stats-grid-item-value` | `#e2e8f0` | Text Color | `#1e293b` |
| 872 | `.stats-grid-item-label` | `#94a3b8` | Text Color | `#64748b` |
| 881 | `.stats-grid-item-meta` | `#94a3b8` | Text Color | `#64748b` |
| 930 | `.activity-item-title` | `#94a3b8` | Text Color | `#64748b` |
| 938 | `.activity-item-value` | `#f1f5f9` | Text Color | `#0f1728` |

---

### 2. **frontend/src/pages/Dashboard.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 6-9 | `.dashboard-container` | `#0a0e27`, `#0f1429`, `#141a2f` | Background Gradient | `#ffffff`, `#f8fafc`, `#f1f5f9` |
| 40 | `.dashboard-header h1` | `#f1f5f9` | Text Color | `#0f1728` |
| 43 | `.dashboard-header h1` | Linear gradient `#f1f5f9 0%, #cbd5e1 100%` | Gradient Text | `#475569 0%, #1e293b 100%` |
| 51 | `.header-subtitle` | `#94a3b8` | Text Color | `#64748b` |
| 133 | `.stat-item-value` | `#94a3b8` | Text Color | `#64748b` |
| 159 | `.stat-item-label` | `#64748b` | Text Color | `#94a3b8` |
| 295 | `.upcoming-test-title` | `#f1f5f9` | Text Color | `#0f1728` |
| 305 | `.upcoming-test-date` | `#cbd5e1` | Text Color | `#475569` |
| 399 | `.recent-activity-item-title` | `#f1f5f9` | Text Color | `#0f1728` |
| 407 | `.recent-activity-subtitle` | `#94a3b8` | Text Color | `#64748b` |
| 457 | `.performance-metric-label` | `#94a3b8` | Text Color | `#64748b` |
| 465 | `.performance-metric-value` | `#e2e8f0` | Text Color | `#1e293b` |
| 518 | `.recommendations-title` | `#cbd5e1` | Text Color | `#475569` |
| 525 | `.recommendation-item-text` | `#f1f5f9` | Text Color | `#0f1728` |

---

### 3. **frontend/src/pages/Home.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 7-10 | `.home-container` | `#0a0e27`, `#0f1429`, `#141a2f` | Background Gradient | `#ffffff`, `#f8fafc`, `#f1f5f9` |
| 71 | `.badge-text` | `#e2e8f0` | Text Color | `#1e293b` |
| 86 | `.hero-title` | `#f1f5f9` | Text Color | `#0f1728` |
| 102 | `.hero-subtitle` | `#cbd5e1` | Text Color | `#475569` |
| 149 | `.cta-secondary` | `#e2e8f0` | Text Color | `#1e293b` |
| 156 | `.hero-title (in section)` | `#f1f5f9` | Text Color | `#0f1728` |
| 166 | `.section-subtitle` | `#94a3b8` | Text Color | `#64748b` |
| 264 | `.feature-card-title` | `#f1f5f9` | Text Color | `#0f1728` |
| 271 | `.feature-card-description` | `#cbd5e1` | Text Color | `#475569` |
| 358 | `.benefit-item-title` | `#f1f5f9` | Text Color | `#0f1728` |
| 365 | `.benefit-item-desc` | `#cbd5e1` | Text Color | `#475569` |
| 381 | `.testimonial-text` | `#f1f5f9` | Text Color | `#0f1728` |
| 405 | `.testimonial-author` | `#cbd5e1` | Text Color | `#475569` |
| 418 | `.testimonial-role` | `#cbd5e1` | Text Color | `#475569` |
| 505 | `.cta-section` | Linear gradient `#0f172a 0%, #1e293b 100%` | Background Gradient | `#ffffff 0%, #f8fafc 100%` |
| 613 | `.footer-title` | `#e2e8f0` | Text Color | `#1e293b` |
| 637 | `.footer-link-title` | `#f1f5f9` | Text Color | `#0f1728` |
| 644 | `.footer-link` | `#94a3b8` | Text Color | `#64748b` |
| 680 | `.footer-contact-title` | `#f1f5f9` | Text Color | `#0f1728` |
| 687 | `.footer-contact-desc` | `#cbd5e1` | Text Color | `#475569` |
| 726 | `.footer-bottom-text` | `#94a3b8` | Text Color | `#64748b` |
| 745 | `.footer-logo-text` | `#f1f5f9` | Text Color | `#0f1728` |
| 753 | `.footer-tagline` | `#cbd5e1` | Text Color | `#475569` |
| 1215 | `.light-section-title` | `#e2e8f0` | Text Color | `#1e293b` |
| 1264 | `.light-section-desc` | `#cbd5e1` | Text Color | `#475569` |
| 1282 | `.benefit-card-title` | `#e2e8f0` | Text Color | `#1e293b` |
| 1313 | `.cta-heading` | `#e2e8f0` | Text Color | `#1e293b` |
| 1320 | `.cta-description` | `#cbd5e1` | Text Color | `#475569` |
| 1337 | `.cta-final-text` | `#cbd5e1` | Text Color | `#475569` |
| 1356 | `.footer-final-title` | `#e2e8f0` | Text Color | `#1e293b` |
| 1375 | `.light-text-primary` | `#1e293b` | Text Color (already light) | KEEP AS IS |
| 1379 | `.light-text-secondary` | `#475569` | Text Color (already light) | KEEP AS IS |
| 1392 | `.light-text-secondary` | `#475569` | Text Color (already light) | KEEP AS IS |
| 1400 | `.dark-text-on-light` | `#1e293b` | Text Color (already light) | KEEP AS IS |
| 1416 | `.dark-title` | `#1e293b` | Text Color (already light) | KEEP AS IS |
| 1420 | `.dark-subtitle` | `#475569` | Text Color (already light) | KEEP AS IS |
| 1429 | `.dark-description` | `#475569` | Text Color (already light) | KEEP AS IS |
| 1437 | `.dark-footer-text` | `#1e293b` | Text Color (already light) | KEEP AS IS |

---

### 4. **frontend/src/pages/TakeTest.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 8 | `.test-container` | `#0f172a`, `#1a202c` gradient | Background Gradient | `#ffffff`, `#f8fafc` gradient |
| 17 | `.test-header` | Linear gradient `#1e3a8a 0%, #1e293b 100%` | Background Gradient | `#dbeafe 0%, #f8fafc 100%` |
| 45 | `.test-header p` | `#cbd5e1` | Text Color | `#475569` |
| 72 | `.question-card` | Linear gradient `#1e293b 0%, #0f172a 100%` | Background Gradient | `#f8fafc 0%, #ffffff 100%` |
| 97 | `.question-card h2` | `#f1f5f9` | Text Color | `#0f1728` |
| 110 | `.option-button` | Border `#334155` | Border Color | `#cbd5e1` |
| 115 | `.option-button` | `#cbd5e1` | Text Color | `#475569` |
| 151 | `.info-box` | Linear gradient `#1e293b 0%, #0f172a 100%` | Background Gradient | `#f8fafc 0%, #ffffff 100%` |
| 175 | `.info-box h3` | `#f1f5f9` | Text Color | `#0f1728` |
| 185 | `.info-box-section` | Border `#334155` | Border Color | `#cbd5e1` |
| 187 | `.info-box-section h4` | `#cbd5e1` | Text Color | `#475569` |
| 219 | `.timer-value` | `#e2e8f0` | Text Color | `#1e293b` |
| 257 | `.progress-bar-bg` | Linear gradient `#64748b 0%, #475569 100%` | Background Gradient | `#cbd5e1 0%, #e2e8f0 100%` |
| 297 | `.question-review-card` | Linear gradient `#1e293b 0%, #0f172a 100%` | Background Gradient | `#f8fafc 0%, #ffffff 100%` |
| 319 | `.review-item-title` | `#f1f5f9` | Text Color | `#0f1728` |
| 326 | `.review-item-status` | `#cbd5e1` | Text Color | `#475569` |

---

### 5. **frontend/src/pages/Results.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 4 | `.results-container` | Linear gradient `#0f172a 0%, #1a202c 100%` | Background Gradient | `#ffffff 0%, #f8fafc 100%` |
| 12 | `.results-hero` | Linear gradient `#1e293b 0%, #0f172a 100%` | Background Gradient | `#f8fafc 0%, #ffffff 100%` |
| 91 | `.score-fraction` | `#cbd5e1` | Text Color | `#475569` |
| 142 | `.stat-value` | `#94a3b8` | Text Color | `#64748b` |
| 152 | `.stat-label` | `#f1f5f9` | Text Color | `#0f1728` |
| 163 | `.stat-box` | Border `#334155` | Border Color | `#cbd5e1` |
| 211 | `.analysis-section h2` | `#f1f5f9` | Text Color | `#0f1728` |
| 236 | `.analysis-item` | `#cbd5e1` | Text Color | `#475569` |
| 282 | `.action-button` | Linear gradient `#64748b 0%, #475569 100%` | Background Gradient | `#cbd5e1 0%, #e2e8f0 100%` |

---

### 6. **frontend/src/pages/Register.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 65 | `.form-label` | `#94a3b8` | Text Color | `#64748b` |
| 101 | `.form-field-description` | `#cbd5e1` | Text Color | `#475569` |
| 132 | `.form-error` | `#94a3b8` | Text Color | `#64748b` |
| 167 | `.input-hint` | `#94a3b8` | Text Color | `#64748b` |
| 193 | `.input-field` | `#e2e8f0` | Text Color | `#1e293b` |
| 203 | `.input-field` | Border `#334155` | Border Color | `#cbd5e1` |
| 206 | `.input-field` | `#e2e8f0` | Text Color | `#1e293b` |
| 226 | `.password-requirement-text` | `#64748b` | Text Color | `#94a3b8` |
| 231 | `.password-requirement-desc` | `#94a3b8` | Text Color | `#64748b` |
| 250 | `.checkbox-input + label` | Border `#334155` | Border Color | `#cbd5e1` |
| 291 | `.register-footer-text` | `#e2e8f0` | Text Color | `#1e293b` |
| 296 | `.register-footer-link-label` | `#94a3b8` | Text Color | `#64748b` |
| 390 | `.terms-link` | `#64748b` | Text Color | `#94a3b8` |
| 420 | `.oauth-divider-text` | `#cbd5e1` | Text Color | `#475569` |
| 549 | `.register-header` | Linear gradient `#1e293b 0%, #0f172a 100%` | Background Gradient | `#f8fafc 0%, #ffffff 100%` |

---

### 7. **frontend/src/pages/Auth.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 7 | `.auth-title` | `#e2e8f0` | Text Color | `#1e293b` |
| 12 | `.auth-subtitle` | `#94a3b8` | Text Color | `#64748b` |
| 18 | `.auth-footer` | `#94a3b8` | Text Color | `#64748b` |

---

### 8. **frontend/src/pages/VerifyOTP.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 61 | `.otp-header` | `#f1f5f9` | Text Color | `#0f1728` |
| 67 | `.otp-subtitle` | `#cbd5e1` | Text Color | `#475569` |
| 79 | `.otp-title` | `#f1f5f9` | Text Color | `#0f1728` |
| 86 | `.otp-description` | `#cbd5e1` | Text Color | `#475569` |
| 120 | `.resend-code-text` | `#f1f5f9` | Text Color | `#0f1728` |
| 136 | `.verification-code-input` | `#64748b` | Text Color | `#94a3b8` |
| 314 | `.success-message` | `#94a3b8` | Text Color | `#64748b` |

---

### 9. **frontend/src/pages/TestPreview.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 7 | `.preview-header` | `#f1f5f9` | Text Color | `#0f1728` |
| 21 | `.preview-title` | `#f1f5f9` | Text Color | `#0f1728` |
| 44 | `.info-badge` | `#94a3b8` | Text Color | `#64748b` |
| 52 | `.info-text` | `#e2e8f0` | Text Color | `#1e293b` |
| 133 | `.question-preview-item` | `#cbd5e1` | Text Color | `#475569` |
| 179 | `.section-header` | `#f1f5f9` | Text Color | `#0f1728` |
| 217 | `.duration-info` | `#cbd5e1` | Text Color | `#475569` |
| 235 | `.difficulty-badge` | `#e2e8f0` | Text Color | `#1e293b` |
| 274 | `.test-format-item` | `#cbd5e1` | Text Color | `#475569` |
| 331 | `.instruction-item` | `#cbd5e1` | Text Color | `#475569` |

---

### 10. **frontend/src/pages/JoinTest.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 22 | `.join-title` | `#e2e8f0` | Text Color | `#1e293b` |
| 27 | `.join-subtitle` | `#94a3b8` | Text Color | `#64748b` |
| 34 | `.divider` | Border `#334155` | Border Color | `#cbd5e1` |
| 38 | `.info-section-title` | `#e2e8f0` | Text Color | `#1e293b` |
| 49 | `.info-section-text` | `#94a3b8` | Text Color | `#64748b` |

---

### 11. **frontend/src/pages/Leaderboard.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 28 | `.leaderboard-header` | Border `#e2e8f0` | Border Color | `#334155` or `#475569` |
| 83 | `.leaderboard-section-header` | Border-bottom `#e2e8f0` | Border Color | `#334155` or `#475569` |
| 88 | `.leaderboard-row` | Border-bottom `#e2e8f0` | Border Color | `#334155` or `#475569` |

---

### 12. **frontend/src/pages/GenerateTest.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 13 | `.form-header` | `#e2e8f0` | Text Color | `#1e293b` |
| 18 | `.form-subheader` | `#94a3b8` | Text Color | `#64748b` |
| 34 | `.section-title` | `#64748b` | Text Color | `#94a3b8` |
| 51 | `.option-text` | `#f1f5f9` | Text Color | `#0f1728` |
| 65 | `.label-text` | `#e2e8f0` | Text Color | `#1e293b` |
| 75 | `.hint-text` | `#64748b` | Text Color | `#94a3b8` |
| 99 | `.requirement-text` | `#94a3b8` | Text Color | `#64748b` |
| 111 | `.code-block` | Background `#1e293b` | Background Color | `#f8fafc` |
| 117 | `.code-text` | `#e2e8f0` | Text Color | `#1e293b` |
| 133 | `.code-comment` | `#cbd5e1` | Text Color | `#475569` |
| 138 | `.code-keyword` | `#e2e8f0` | Text Color | `#1e293b` |
| 160 | `.loading-text` | `#94a3b8` | Text Color | `#64748b` |
| 380 | `.text-slate-400` | `#94a3b8` | Text Color | `#64748b` |
| 408 | `.preview-subtitle` | `#f1f5f9` | Text Color | `#0f1728` |
| 441 | `.preview-content-title` | `#e2e8f0` | Text Color | `#1e293b` |
| 451 | `.preview-content-text` | `#64748b` | Text Color | `#94a3b8` |
| 495 | `.button-helper-text` | `#94a3b8` | Text Color | `#64748b` |
| 503 | `.info-text-secondary` | `#cbd5e1` | Text Color | `#475569` |

---

### 13. **frontend/src/pages/CreateClassroomModal.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 42 | `.modal-header` | Border `#334155` | Border Color | `#cbd5e1` |
| 48 | `.modal-title` | `#e2e8f0` | Text Color | `#1e293b` |
| 55 | `.modal-description` | `#94a3b8` | Text Color | `#64748b` |
| 66 | `.form-label` | `#e2e8f0` | Text Color | `#1e293b` |
| 67 | `.form-label` | Background `#334155` | Background Color | `#cbd5e1` or `#e2e8f0` |
| 86 | `.form-input` | `#cbd5e1` | Text Color | `#475569` |
| 95 | `.form-input` | Border `#334155` | Border Color | `#cbd5e1` |
| 97 | `.form-input` | `#e2e8f0` | Text Color | `#1e293b` |
| 114 | `.required-field` | Background `#1e293b` | Background Color | `#f8fafc` |
| 115 | `.required-field` | `#e2e8f0` | Text Color | `#1e293b` |
| 126 | `.input-helper-text` | `#64748b` | Text Color | `#94a3b8` |
| 151 | `.validation-message` | `#64748b` | Text Color | `#94a3b8` |
| 182 | `.button-base` | Background `#334155` | Background Color | `#cbd5e1` |
| 183 | `.button-base` | `#cbd5e1` | Text Color | `#475569` |
| 187 | `.button-hover` | Background `#475569` | Background Color | `#e2e8f0` |

---

### 14. **frontend/src/pages/ClassroomPremium.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 7 | `--primary-gradient` | Linear gradient `#64748b 0%, #475569 100%` | Gradient Variable | `#cbd5e1 0%, #e2e8f0 100%` |
| 9 | `--rose-gradient` | Linear gradient `#64748b 0%, #475569 100%` | Gradient Variable | `#cbd5e1 0%, #e2e8f0 100%` |
| 10 | `--amber-gradient` | Linear gradient `#64748b 0%, #475569 100%` | Gradient Variable | `#cbd5e1 0%, #e2e8f0 100%` |
| 14 | `--text-primary` | `#f1f5f9` | Text Color Variable | `#0f1728` |
| 15 | `--text-secondary` | `#cbd5e1` | Text Color Variable | `#475569` |

---

### 15. **frontend/src/pages/ClassroomCard.css** (if exists - check file)

### 16. **frontend/src/pages/Classroom.css** (if exists - check file)

---

### 17. **frontend/src/theme.css**

| Line | Selector | Hardcoded Color | Type | Light Theme Equivalent |
|------|----------|-----------------|------|------------------------|
| 96 | `::-webkit-scrollbar-thumb (light)` | `#cbd5e1` | Scrollbar Color | `#cbd5e1` (keep) |
| 101 | `::-webkit-scrollbar-thumb:hover (light)` | `#94a3b8` | Scrollbar Color | `#94a3b8` (keep) |
| 109 | `::-webkit-scrollbar-thumb (dark)` | `#475569` | Scrollbar Color | `#64748b` |
| 114 | `::-webkit-scrollbar-thumb:hover (dark)` | `#64748b` | Scrollbar Color | `#475569` |

---

## Color Usage Statistics

### By Category

**Background Gradients (Very Dark):**
- Files affected: Profile.css, Dashboard.css, Home.css, TakeTest.css, Results.css
- Total instances: 15+
- Impact: Highest priority - affects main page backgrounds

**Text Colors (Light Colors):**
- Files affected: All CSS files
- Total instances: 50+
- Impact: High priority - affects all text readability

**Border Colors (Dark Grays):**
- Files affected: TakeTest.css, Register.css, JoinTest.css, Leaderboard.css, CreateClassroomModal.css
- Total instances: 10+
- Impact: Medium priority - affects component separations

**Gradient Backgrounds:**
- Files affected: Profile.css, Dashboard.css, Home.css, TakeTest.css, Results.css
- Total instances: 8+
- Impact: High priority - affects visual hierarchy

---

## Implementation Strategy

### Phase 1: Create Light Theme Media Queries
Add light theme variants to `theme.css` with proper CSS variable overrides for all hardcoded colors.

### Phase 2: Global Color Replacement
Replace hardcoded colors in each file with CSS variables or media queries:

```css
/* Example pattern */
@media (prefers-color-scheme: light) {
  .selector {
    color: #1e293b; /* Light theme equivalent */
    background: #ffffff;
  }
}
```

### Phase 3: Test & Validation
- Test all pages in light theme mode
- Verify contrast ratios meet WCAG standards
- Ensure animations/transitions work properly

---

## Critical Files to Update (by priority)

1. **Profile.css** (27 instances)
2. **Dashboard.css** (14 instances)
3. **Home.css** (31 instances)
4. **TakeTest.css** (16 instances)
5. **Results.css** (9 instances)
6. **Register.css** (14 instances)
7. **GenerateTest.css** (18 instances)
8. **CreateClassroomModal.css** (13 instances)
9. **VerifyOTP.css** (7 instances)
10. **TestPreview.css** (10 instances)
11. **JoinTest.css** (5 instances)
12. **Leaderboard.css** (3 instances)
13. **Auth.css** (3 instances)
14. **ClassroomPremium.css** (5 instances)
15. **theme.css** (4 instances)

