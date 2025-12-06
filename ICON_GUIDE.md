# Icon Change Guide

This guide shows you where to change all icons in the application.

## 📍 Icon Locations

### 1. **Favicon (Browser Tab Icon)**

**Location:** `index.html` (line 5) and `public/vite.svg`

**To change:**
1. Replace the file `public/vite.svg` with your icon file (SVG, PNG, or ICO)
2. Update `index.html` line 5:
   ```html
   <link rel="icon" type="image/svg+xml" href="/your-icon.svg" />
   ```
   - For PNG: `type="image/png"` and `href="/your-icon.png"`
   - For ICO: `type="image/x-icon"` and `href="/favicon.ico"`

**Example:**
```html
<link rel="icon" type="image/png" href="/onp-logo.png" />
```

---

### 2. **Home Page Hero Icon** 🚀

**Location:** `src/pages/Home.tsx` (line 106)

**Current code:**
```tsx
🚀
```

**To change:**
- Replace the emoji with another emoji, or
- Replace with an image:
  ```tsx
  <img src="/icons/rocket.svg" alt="ONP" style={{ width: '4rem', height: '4rem' }} />
  ```

---

### 3. **Action Card Icons** (Home Page)

**Location:** `src/pages/Home.tsx` (lines 11, 18, 25, 32)

**Current icons:**
- 🚀 - New ONP Event Onboarding (line 11)
- 📋 - View Event Details (line 18)
- 🍃 - Check MongoDB Details (line 25)
- ⚡ - Check Kafka Details (line 32)

**To change emoji icons:**
Edit the `actionCards` array in `Home.tsx`:
```tsx
const actionCards = [
  {
    title: 'New ONP Event Onboarding',
    description: 'Configure and onboard new events to the platform with ease',
    icon: '🚀',  // ← Change this emoji
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    onClick: () => navigate('/onboard'),
  },
  // ... other cards
];
```

**To use image files instead:**
1. Add your icon images to `public/icons/` folder
2. Modify the card rendering in `Home.tsx` (around line 240-262):
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
   }}>
     <img src={card.icon} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
   </div>
   ```
3. Update the `actionCards` array to use image paths:
   ```tsx
   icon: '/icons/rocket.svg',  // Instead of emoji
   ```

---

### 4. **Page Icons** (Other Pages)

#### **Kafka Details Page**
**Location:** `src/pages/KafkaDetails.tsx` (line 30)
```tsx
<div className="text-6xl mb-4">⚡</div>
```

#### **MongoDB Details Page**
**Location:** `src/pages/MongoDBDetails.tsx` (line 30)
```tsx
<div className="text-6xl mb-4">🍃</div>
```

#### **View Events Page**
**Location:** `src/pages/ViewEvents.tsx` (line 30)
```tsx
<div className="text-6xl mb-4">📋</div>
```

**To change:**
- Replace the emoji with another emoji, or
- Replace with an image:
  ```tsx
  <img src="/icons/kafka.svg" alt="Kafka" className="w-16 h-16 mb-4 mx-auto" />
  ```

---

## 🖼️ Using Image Files Instead of Emojis

### Step 1: Add Icon Images
Create a folder structure:
```
public/
  icons/
    rocket.svg (or .png)
    clipboard.svg
    mongodb.svg
    kafka.svg
    onp-logo.svg
```

### Step 2: Update Home.tsx
Replace emoji icons with image paths in the `actionCards` array:
```tsx
const actionCards = [
  {
    title: 'New ONP Event Onboarding',
    description: 'Configure and onboard new events to the platform with ease',
    icon: '/icons/rocket.svg',  // Image path instead of emoji
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    onClick: () => navigate('/onboard'),
  },
  // ... update other cards similarly
];
```

### Step 3: Update Icon Rendering
Modify the icon rendering section (around line 240) to handle both emojis and images:
```tsx
{card.icon.startsWith('/') ? (
  <img 
    src={card.icon} 
    alt={card.title}
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
) : (
  <span style={{ fontSize: '2.5rem' }}>{card.icon}</span>
)}
```

---

## 📝 Quick Reference

| Icon Type | File Location | Line Number |
|-----------|--------------|------------|
| Favicon | `index.html` | 5 |
| Hero Icon | `src/pages/Home.tsx` | 106 |
| Action Card Icons | `src/pages/Home.tsx` | 11, 18, 25, 32 |
| Kafka Icon | `src/pages/KafkaDetails.tsx` | 30 |
| MongoDB Icon | `src/pages/MongoDBDetails.tsx` | 30 |
| Events Icon | `src/pages/ViewEvents.tsx` | 30 |

---

## 💡 Tips

1. **SVG icons** are recommended for scalability and small file size
2. **PNG icons** work well for complex images with transparency
3. **Emoji icons** are simple but limited in customization
4. Keep icon sizes consistent (64x64px for cards, larger for hero)
5. Use transparent backgrounds for icons to match gradients
6. Optimize images before adding them (use tools like TinyPNG or SVGO)

---

## 🎨 Icon Resources

Free icon sources:
- [Heroicons](https://heroicons.com/) - SVG icons
- [Feather Icons](https://feathericons.com/) - Simple SVG icons
- [Font Awesome](https://fontawesome.com/) - Icon library
- [Material Icons](https://fonts.google.com/icons) - Google Material icons
- [Flaticon](https://www.flaticon.com/) - Large icon collection

