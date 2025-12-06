# How to Use PNG Files for Icons

## Step 1: Add PNG Files to Public Folder

Create the folder structure and add your PNG files:

```
public/
  icons/
    rocket.png          (for hero icon)
    onboard.png         (for New ONP Event Onboarding)
    events.png          (for View Event Details)
    mongodb.png         (for MongoDB Details)
    kafka.png           (for Kafka Details)
```

**Note:** Files in the `public` folder are served from the root path, so `/icons/rocket.png` will work.

---

## Step 2: Update Home.tsx to Use PNG Files

### Option A: Update Action Cards to Use PNG Paths

In `src/pages/Home.tsx`, update the `actionCards` array (around line 7-36):

**Before (using emojis):**
```tsx
const actionCards = [
  {
    title: 'New ONP Event Onboarding',
    description: 'Configure and onboard new events to the platform with ease',
    icon: '🚀',  // Emoji
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    onClick: () => navigate('/onboard'),
  },
  // ...
];
```

**After (using PNG paths):**
```tsx
const actionCards = [
  {
    title: 'New ONP Event Onboarding',
    description: 'Configure and onboard new events to the platform with ease',
    icon: '/icons/onboard.png',  // PNG file path
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    onClick: () => navigate('/onboard'),
  },
  {
    title: 'View Event Details',
    description: 'Browse and search existing event configurations',
    icon: '/icons/events.png',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    onClick: () => navigate('/events'),
  },
  {
    title: 'Check MongoDB Details',
    description: 'View MongoDB connection and data details',
    icon: '/icons/mongodb.png',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    onClick: () => navigate('/mongodb'),
  },
  {
    title: 'Check Kafka Details',
    description: 'Monitor Kafka topics and consumer groups',
    icon: '/icons/kafka.png',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    onClick: () => navigate('/kafka'),
  },
];
```

### Step 3: Update Icon Rendering Code

Update the icon rendering section (around line 241-262) to handle PNG images:

**Replace this:**
```tsx
<div style={{ 
  fontSize: '2.5rem',
  width: '64px',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: card.gradient,
  padding: '0.75rem',
  borderRadius: '0.75rem',
  boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2)',
  flexShrink: 0,
  transition: 'transform 0.3s ease'
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'rotate(5deg) scale(1.1)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'rotate(0) scale(1)';
}}
>
  {card.icon}
</div>
```

**With this (supports both emojis and PNG):**
```tsx
<div style={{ 
  width: '64px',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: card.gradient,
  padding: '0.75rem',
  borderRadius: '0.75rem',
  boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2)',
  flexShrink: 0,
  transition: 'transform 0.3s ease'
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'rotate(5deg) scale(1.1)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'rotate(0) scale(1)';
}}
>
  {card.icon.startsWith('/') ? (
    <img 
      src={card.icon} 
      alt={card.title}
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'contain',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
      }}
    />
  ) : (
    <span style={{ fontSize: '2.5rem' }}>{card.icon}</span>
  )}
</div>
```

### Step 4: Update Hero Icon (Optional)

Update the hero icon (around line 97-107) to use PNG:

**Before:**
```tsx
<div style={{
  display: 'inline-block',
  fontSize: '4rem',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
}}>
  🚀
</div>
```

**After:**
```tsx
<div style={{
  display: 'inline-block',
  width: '4rem',
  height: '4rem',
  animation: 'float 3s ease-in-out infinite'
}}>
  <img 
    src="/icons/rocket.png" 
    alt="ONP"
    style={{ 
      width: '100%', 
      height: '100%', 
      objectFit: 'contain',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
    }}
  />
</div>
```

---

## Complete Example: Updated Home.tsx Section

Here's a complete example of the updated sections:

```tsx
// Update actionCards array
const actionCards = [
  {
    title: 'New ONP Event Onboarding',
    description: 'Configure and onboard new events to the platform with ease',
    icon: '/icons/onboard.png',  // PNG instead of emoji
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    onClick: () => navigate('/onboard'),
  },
  // ... other cards with PNG paths
];

// In the render section, update icon rendering:
{card.icon.startsWith('/') ? (
  <img 
    src={card.icon} 
    alt={card.title}
    style={{ 
      width: '100%', 
      height: '100%', 
      objectFit: 'contain',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
    }}
  />
) : (
  <span style={{ fontSize: '2.5rem' }}>{card.icon}</span>
)}
```

---

## Tips for PNG Icons

1. **Recommended Size:**
   - Action card icons: 64x64px or 128x128px
   - Hero icon: 128x128px or 256x256px

2. **Transparent Background:**
   - Use PNG with transparent background for best results
   - Icons will show the gradient background behind them

3. **File Optimization:**
   - Compress PNG files to reduce size (use TinyPNG or similar)
   - Keep file sizes under 50KB for fast loading

4. **Naming Convention:**
   - Use lowercase with hyphens: `onboard-icon.png`
   - Or simple names: `onboard.png`

5. **Testing:**
   - After adding PNG files, restart the dev server
   - Check browser console for 404 errors if images don't load

---

## Quick Checklist

- [ ] Create `public/icons/` folder
- [ ] Add PNG files to `public/icons/`
- [ ] Update `actionCards` array with PNG paths
- [ ] Update icon rendering code to handle images
- [ ] (Optional) Update hero icon
- [ ] Test in browser

