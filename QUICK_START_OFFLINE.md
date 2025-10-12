# Quick Start - Offline Mode

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies (optional for offline)
cd ../server
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt
```

### Step 2: Run the Application

**Option A: Client Only (Full Offline)**
```bash
cd client
npm run dev
```
Visit: http://localhost:5173

**Option B: Client + Server (Online Sync)**
```bash
# Terminal 1
cd server
python manage.py runserver

# Terminal 2
cd client
npm run dev
```

### Step 3: Test Offline Mode

1. Open the app in your browser
2. Navigate through a few pages
3. Open DevTools (F12) → Network tab
4. Select "Offline" mode
5. Refresh - everything still works! ✅

---

## 🎯 What Works Offline

✅ All pages and navigation  
✅ User login/signup (local storage)  
✅ Learning lessons and exercises  
✅ Speech recognition (Web API)  
✅ Text-to-speech  
✅ Progress tracking  
✅ Data persistence  
✅ PWA installation  

---

## 📱 Install as App

### Desktop (Chrome/Edge)
Click the install icon (⊕) in the address bar

### Mobile (Android)
Menu → "Add to Home screen"

### Mobile (iOS/Safari)
Share → "Add to Home Screen"

---

## 🔧 Troubleshooting

**App not updating?**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

**Service Worker issues?**
- DevTools → Application → Service Workers → Unregister

**Storage full?**
- Clear old data from browser settings

---

## 📚 More Information

- Full guide: [OFFLINE_GUIDE.md](./OFFLINE_GUIDE.md)
- Technical details: [OFFLINE_IMPROVEMENTS_SUMMARY.md](./OFFLINE_IMPROVEMENTS_SUMMARY.md)

---

**That's it! Your app now works completely offline! 🎉**

