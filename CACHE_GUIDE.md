# Quick Cache-Busting Reference

## 🚀 Before Each Deployment

```bash
# Option 1: Run cache clear + build together
npm run deploy

# Option 2: Run separately
npm run cache:clear
npm run build
```

## ✅ What Was Implemented

1. **HTTP Headers** - Prevents browser caching of dynamic content
2. **Service Worker Updates** - Auto-checks for updates every 5 minutes
3. **CacheManager** - Cleans old caches and manages version tracking
4. **UpdateNotification** - Shows users when updates are available
5. **Middleware Headers** - Adds version tracking to all responses
6. **Build ID** - Unique build ID per deployment

## 🔄 How Updates Work

**User Experience:**
1. User visits site → CacheManager runs
2. Checks for updates every 5 minutes
3. If update found → Shows notification
4. User clicks "Refresh Now" → Gets latest version

**Behind the Scenes:**
- Service worker cache invalidated on activation
- Old caches (>24 hours) automatically deleted
- Version tracked in localStorage
- HTTP headers prevent stale content

## 📱 Device Consistency

All devices will now:
- Get fresh content on first visit after update
- Auto-detect updates within 5-10 minutes
- See update notification prompting refresh
- Clear old caches automatically

## 🛠️ Manual Version Update

If you need to force a cache clear:

1. **Edit** `public/sw.js`:
   ```javascript
   const CACHE_VERSION = '3.1' // Increment this
   ```

2. **Or run**:
   ```bash
   npm run cache:clear
   ```

## 📊 Testing Cache Updates

1. Open DevTools (F12)
2. Application → Service Workers
3. Click "Update"
4. Check Console for logs:
   - "Service worker checked for updates"
   - "Deleted old cache: ..."

## ⚙️ Configuration Files

- **next.config.mjs** - HTTP headers
- **middleware.ts** - Request-level headers
- **app/layout.tsx** - Meta tags + Components
- **public/sw.js** - Service worker
- **components/CacheManager.tsx** - Auto-update logic
- **components/UpdateNotification.tsx** - User notifications

## 🎯 Problem Solved

✅ Different devices showing different versions  
✅ Updates not appearing after deployment  
✅ Cached content staying too long  
✅ No user notification of updates  
✅ Manual cache clearing required

## 💡 Best Practices

- Run `npm run deploy` before every deployment
- Monitor DevTools console for cache logs
- Test on multiple devices after deployment
- Keep CACHE_VERSION updated in sw.js
- Check version.json updates properly

## 🆘 Emergency Cache Clear

If users report issues:

1. Increment cache version:
   ```bash
   npm run cache:clear
   ```

2. Deploy immediately:
   ```bash
   npm run build
   ```

3. Users will auto-update within 5-10 minutes

## 📞 Support

Check [docs/cache-management.md](./cache-management.md) for detailed documentation.
