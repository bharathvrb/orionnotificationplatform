# Icons Folder

Place your PNG icon files here.

## Recommended Icon Files:

- `onboard.png` - For "New ONP Event Onboarding" card
- `events.png` - For "View Event Details" card  
- `mongodb.png` - For "Check MongoDB Details" card
- `kafka.png` - For "Check Kafka Details" card
- `rocket.png` - For hero icon (optional)

## Icon Specifications:

- **Size:** 64x64px to 128x128px (for action cards)
- **Format:** PNG with transparent background
- **File Size:** Keep under 50KB for fast loading
- **Style:** Simple, clear icons work best

## How to Use:

1. Add your PNG files to this folder
2. Update `src/pages/Home.tsx` actionCards array:
   ```tsx
   icon: '/icons/onboard.png',  // Instead of emoji
   ```
3. The code will automatically detect PNG files and display them

## Example:

If you add `onboard.png` here, use it in Home.tsx like this:
```tsx
{
  title: 'New ONP Event Onboarding',
  icon: '/icons/onboard.png',  // Path from public folder
  // ...
}
```

