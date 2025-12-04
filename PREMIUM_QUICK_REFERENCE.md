# Quick Reference - Premium Layout Enhancements

## Color Palette Quick Reference

| Component | Color | Usage |
|-----------|-------|-------|
| Primary Accent | `#60a5fa` (Blue) | Stats, buttons, titles |
| Secondary Accent | `#a855f7` (Purple) | Tests, classroom identity |
| Success Accent | `#10b981` (Green) | Scores, active states |
| Info Accent | `#06b6d4` (Cyan) | Information, details |

## Component Quick Guide

### Hero Card
```jsx
// Already styled in component
// Top border: 4px blue accent
// Padding: 40px 48px
// Features: Gradient background, backdrop filter
```

### Stat Cards (3-column grid)
```jsx
// Blue - Students: #60a5fa
// Purple - Tests: #a855f7
// Green - Score: #10b981

// Each has:
// - Left border: 4px accent
// - Icon background: accent color (10% opacity)
// - Value color: accent color (bright)
// - Hover: accent background + enhanced shadow
```

### About Section
```jsx
// Cyan accent: #06b6d4
// - Left border: 4px
// - Title: Accent color
// - Bottom border: Accent color
// - Spacing: 28px gap between items
```

## CSS Classes Available

```css
.classroom-section
.classroom-section-title
.stat-card
.stat-icon
.stat-value
.premium-card
.premium-card-title
.btn-premium-primary
```

## Spacing Values

| Element | Padding/Gap |
|---------|------------|
| Main container | 48px 80px |
| Stat cards | 32px |
| Premium cards | 24px |
| Summary card | 40px |
| Grid gaps | 24px (stats), 28px (info) |
| Section margins | 48px |

## Adding New Accent Sections

To add a new section with a different accent color:

```jsx
<div style={{
  background: 'rgba(30, 41, 59, 0.25)',
  border: '1px solid rgba(148, 163, 184, 0.08)',
  borderRadius: '16px',
  borderLeft: '4px solid #ACCENT_COLOR',
  padding: '32px',
}}>
  <h3 style={{
    color: '#ACCENT_COLOR',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #ACCENT_COLOR',
  }}>
    Section Title
  </h3>
</div>
```

## Common Hover Pattern

```jsx
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-4px)';
  e.currentTarget.style.background = 'rgba(ACCENT_R, ACCENT_G, ACCENT_B, 0.1)';
  e.currentTarget.style.boxShadow = '0 8px 24px rgba(ACCENT_R, ACCENT_G, ACCENT_B, 0.15)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.25)';
  e.currentTarget.style.boxShadow = 'none';
}}
```

## CSS Variables in Root

```css
:root {
  /* Accents */
  --accent-blue: #60a5fa;
  --accent-blue-dark: rgba(96, 165, 250, 0.1);
  --accent-purple: #a855f7;
  --accent-purple-dark: rgba(168, 85, 247, 0.1);
  --accent-green: #10b981;
  --accent-green-dark: rgba(16, 185, 129, 0.1);
  --accent-cyan: #06b6d4;
  --accent-cyan-dark: rgba(6, 182, 212, 0.1);
  
  /* Text Colors */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
}
```

## Files to Reference

1. **ClassroomPremium.css** - All styling and CSS variables
2. **OverviewTabPremium.jsx** - Component with accent implementations
3. **PREMIUM_DESIGN_REFERENCE.md** - Design system details
4. **PREMIUM_LAYOUT_ENHANCEMENT.md** - Complete change documentation

## Quick Fixes

### Remove accent from a section
Replace `borderLeft: '4px solid var(--accent-blue)'` with `border: '1px solid rgba(148, 163, 184, 0.08)'`

### Change accent color
Update CSS variable or inline color code (e.g., `#60a5fa` → `#a855f7`)

### Adjust hover shadow
Modify `boxShadow: '0 8px 24px rgba(96, 165, 250, 0.15)'` opacity or color values

### Change spacing
Modify `padding`, `gap`, or `margin` values in the component

## Performance Tips

- ✅ Use CSS variables for easy color updates
- ✅ Hover effects use GPU-accelerated transforms
- ✅ No animation lag with 0.3s ease timing
- ✅ Minimal repaints with proper z-index

## Testing Quick Checklist

- [ ] Hero card has top blue border
- [ ] Stat cards have correct left borders (blue, purple, green)
- [ ] Icons have colored backgrounds
- [ ] Values are in accent colors
- [ ] Badges have accent styling
- [ ] Hover effects work smoothly
- [ ] About section has cyan accent
- [ ] Spacing looks balanced
- [ ] Colors render correctly
- [ ] No console errors

## Support Accent Colors Reference

| Name | Hex | RGB | Used In |
|------|-----|-----|---------|
| Blue | #60a5fa | 96, 165, 250 | Students, Primary, Buttons |
| Purple | #a855f7 | 168, 85, 247 | Tests, Classroom Handle |
| Green | #10b981 | 16, 185, 129 | Scores, Active Status |
| Cyan | #06b6d4 | 6, 182, 212 | Information, Details |

---

**Last Updated**: 2025-12-02
**Status**: Production Ready
**Maintenance Level**: Low (CSS-based design system)
