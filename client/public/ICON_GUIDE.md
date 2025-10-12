# Icon Generation Guide for Speak Bee

## Required Icon Sizes for PWA

To make Speak Bee a fully compliant PWA, you need these icon sizes:

### Android/Chrome
- **192x192** - Standard app icon
- **512x512** - High-resolution icon for splash screens

### iOS/Safari
- **180x180** - iOS home screen icon
- **120x120** - iPhone retina icon
- **152x152** - iPad retina icon

### Other
- **144x144** - Windows tile
- **96x96** - Standard favicon
- **72x72** - Legacy devices

---

## How to Generate Icons

### Option 1: Online Tool (Easiest)
1. Go to https://realfavicongenerator.net/
2. Upload your logo (`logo01.png`)
3. Download the generated icons
4. Place them in the `/public` folder

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Then run these commands:

# From logo01.png, generate all sizes:
magick logo01.png -resize 192x192 icon-192.png
magick logo01.png -resize 512x512 icon-512.png
magick logo01.png -resize 180x180 apple-touch-icon.png
magick logo01.png -resize 120x120 icon-120.png
magick logo01.png -resize 152x152 icon-152.png
magick logo01.png -resize 144x144 icon-144.png
magick logo01.png -resize 96x96 icon-96.png
magick logo01.png -resize 72x72 icon-72.png
```

### Option 3: Online Batch Resizer
1. Go to https://www.iloveimg.com/resize-image/resize-png
2. Upload logo01.png
3. Resize to each dimension listed above
4. Download and rename appropriately

---

## Current Status

Your current logo is: `logo01.png`

**Action Required:** 
Generate the icons using one of the methods above, or use the current logo as-is (it will be stretched/shrunk automatically, but quality may not be optimal).

---

## File Naming Convention

After generation, rename files as follows:
- `icon-192.png` → 192x192 icon
- `icon-512.png` → 512x512 icon
- `apple-touch-icon.png` → 180x180 iOS icon
- `icon-144.png` → 144x144 Windows tile
- `favicon.ico` → Browser favicon

Then update `/public/manifest.json` with the correct paths.

