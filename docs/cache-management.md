# Cache Management Guide

This document explains the cache-busting mechanisms implemented in your website to ensure users always see the latest content.

## 🎯 Problem Solved

Previously, users on different devices were seeing different versions of your website due to browser caching. This implementation ensures all users see the most up-to-date content.

## 🛠️ Features Implemented

### 1. **HTTP Cache Headers**
- Added cache-control headers via Next.js config
- HTML pages: No caching (always fresh)
- Static assets: Cached with immutable tags (using Next.js versioned URLs)
- API routes: Never cached

### 2. **Service Worker Management**
- Automatic version updates with timestamps
- Old cache cleanup on activation
- Periodic update checks (every 5 minutes)
- Automatic page reload when new version detected

### 3. **Meta Tags**
- Added cache-control meta tags in HTML head
- Version timestamp for tracking

### 4. **CacheManager Component**
- Checks for service worker updates every 5 minutes
- Clears old caches (older than 24 hours)
- Reloads page if hidden for more than 30 minutes
- Version tracking in localStorage

### 5. **Middleware Headers**
- Adds cache-busting headers to all responses
- Includes version timestamp in custom header

## 📝 How to Use

### For Regular Updates

When you make changes to your website:

1. **Before deploying**, run:
   ```bash
   npm run cache:clear
   ```
   This updates the service worker version.

2. **Build and deploy**:
   ```bash
   npm run deploy
   ```
   This runs cache:clear + build automatically.

### For Development

- Use `npm run dev` as usual
- Cache busting is less aggressive in development
- Service worker updates on page refresh

### Manual Cache Clearing

If needed, users can manually clear cache:
- **Chrome/Edge**: Press `Ctrl + Shift + Delete`
- **Safari**: `Cmd + Option + E`
- **Firefox**: `Ctrl + Shift + Delete`

## 🔍 How It Works

### Automatic Updates

1. **On Page Load**:
   - CacheManager checks service worker for updates
   - Old caches are cleaned up
   - Version is tracked in localStorage

2. **Every 5 Minutes**:
   - Service worker checks for updates
   - If new version found, page reloads automatically

3. **On Page Focus**:
   - Checks if version is outdated (>1 hour old)
   - Logs suggestion to refresh

4. **After Long Absence**:
   - If page hidden for >30 minutes, reloads on return

### Service Worker Caching Strategy

```javascript
CACHE_NAME = 'blog-cache-v' + Date.now()
CACHE_VERSION = '3.0'
```

- Cache name includes timestamp (unique per build)
- Version number tracks major updates
- Old caches automatically deleted on activation

## 🚀 Deployment Checklist

Before each deployment:

- [ ] Run `npm run cache:clear` to update versions
- [ ] Test changes locally with `npm run dev`
- [ ] Build with `npm run build`
- [ ] Deploy to hosting platform
- [ ] Verify service worker updates in DevTools

## 🧪 Testing Cache Updates

1. **Open DevTools** (F12)
2. Go to **Application** tab
3. Check **Service Workers** section
4. Click "Update" to force check
5. Check **Cache Storage** to see versions

## 📊 Monitoring

Check these in browser DevTools console:
- `Service worker checked for updates`
- `New service worker activated, reloading page...`
- `Deleted old cache: [name]`

## ⚙️ Configuration

### Adjust Update Frequency

In `components/CacheManager.tsx`:
```typescript
const interval = setInterval(checkForUpdates, 5 * 60 * 1000) // Change 5 to desired minutes
```

### Adjust Cache Lifetime

In `components/CacheManager.tsx`:
```typescript
if (currentTime - cacheTime > 24 * 60 * 60 * 1000) // Change 24 to desired hours
```

### Adjust Hidden Time Threshold

In `components/CacheManager.tsx`:
```typescript
if (timeHidden > 30 * 60 * 1000) // Change 30 to desired minutes
```

## 🐛 Troubleshooting

### Users Still See Old Content

1. Check if service worker is registered:
   ```javascript
   navigator.serviceWorker.getRegistrations()
   ```

2. Force unregister and reload:
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(reg => reg.unregister())
   })
   ```

3. Clear all caches:
   ```javascript
   caches.keys().then(keys => {
     keys.forEach(key => caches.delete(key))
   })
   ```

### Service Worker Not Updating

1. Increment `CACHE_VERSION` manually in `public/sw.js`
2. Run `npm run cache:clear`
3. Rebuild and deploy

### Development Issues

If cache causes issues during development:
1. Open DevTools → Application → Service Workers
2. Check "Update on reload"
3. Or click "Unregister"

## 📚 Additional Resources

- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

## 🔄 Version History

- **v3.0** - Comprehensive cache-busting implementation
  - HTTP headers for all routes
  - Service worker auto-updates
  - CacheManager component
  - Automatic version tracking
  - Old cache cleanup
