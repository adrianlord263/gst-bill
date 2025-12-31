# 📱 Distribution Guide - GST Billing System (PWA)

This app is now a Progressive Web App (PWA) ready for cross-platform distribution.

## 🚀 Prerequisites

Before distributing to app stores, you MUST host the app on **HTTPS**. Free options:
- **GitHub Pages**: https://pages.github.com (Free, easy)
- **Vercel**: https://vercel.com (Free, instant deploy)
- **Netlify**: https://netlify.com (Free, drag & drop)

---

## 🖥️ Windows Store (Microsoft Store)

### Step 1: Host on HTTPS
Push your code to a hosting service and note the URL.

### Step 2: Use PWABuilder
1. Go to **https://www.pwabuilder.com**
2. Enter your app URL (e.g., `https://yourusername.github.io/gst-bill`)
3. Click **"Start"**
4. Review your PWA score (should be 90+)
5. Click **"Package for stores"** → **Windows**
6. Download the `.msix` package

### Step 3: Submit to Microsoft Store
1. Go to **https://partner.microsoft.com/dashboard**
2. Create a developer account ($19 one-time fee)
3. Create new app submission
4. Upload the `.msix` package
5. Fill app details, screenshots, description
6. Submit for review (takes 1-3 days)

---

## 📱 Google Play Store

### Step 1: Host on HTTPS
Same as above - app must be hosted on HTTPS.

### Step 2: Digital Asset Links (Important!)
Create a file at `/.well-known/assetlinks.json` with your signing key:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yourdomain.gstbilling",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

### Step 3: Use Bubblewrap (CLI)
```bash
# Install Bubblewrap
npm install -g @nicksheffield/nicksheffield.github.io

# Or use PWABuilder (easier)
# Go to https://www.pwabuilder.com → Package for stores → Android
```

### Step 4: Using PWABuilder (Recommended)
1. Go to **https://www.pwabuilder.com**
2. Enter your HTTPS app URL
3. Click **"Package for stores"** → **Android**
4. Download the signed APK/AAB bundle
5. Note: Keep the signing key safe!

### Step 5: Submit to Play Store
1. Go to **https://play.google.com/console**
2. Create developer account ($25 one-time fee)
3. Create new app
4. Upload the AAB file
5. Fill store listing, screenshots, content rating
6. Submit for review (takes 1-7 days)

---

## 🐧 Linux Distribution

### Option A: PWABuilder (Easiest)
1. Go to **https://www.pwabuilder.com**
2. Enter your app URL
3. Click **"Package for stores"** → **Linux**
4. Download the AppImage/Snap package

### Option B: Manual with Electron
```bash
# Clone your app
git clone your-repo

# Install Electron
npm install electron electron-builder --save-dev

# Add to package.json
{
  "main": "main.js",
  "scripts": {
    "build:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.yourdomain.gstbilling",
    "linux": {
      "target": ["AppImage", "snap", "deb"]
    }
  }
}

# Build
npm run build:linux
```

---

## 📋 Store Submission Checklist

| Item | Windows | Play Store | Linux |
|------|---------|------------|-------|
| HTTPS hosting | ✅ Required | ✅ Required | ⚠️ Recommended |
| App icons | ✅ 512x512 | ✅ 512x512 | ✅ 512x512 |
| Screenshots | 1-8 images | 2-8 images | Optional |
| Description | 1000 chars | 4000 chars | Varies |
| Privacy policy | ✅ Required | ✅ Required | Optional |
| Developer fee | $19 once | $25 once | Free |

---

## 🔧 Testing Your PWA Locally

```bash
# Start a local HTTPS server
npx serve -s . -l 5000

# Or use Python
python -m http.server 8000
```

Then open Chrome DevTools → Application → check:
- ✅ Manifest detected
- ✅ Service Worker registered
- ✅ Icons loading correctly

---

## 💡 Tips

1. **Test on real devices** before submitting
2. **Create compelling screenshots** - they affect downloads
3. **Write a good description** with keywords (GST, invoice, billing, India)
4. **Add a privacy policy** - even a simple one (required for stores)
5. **Update app version** in manifest.json before each submission
