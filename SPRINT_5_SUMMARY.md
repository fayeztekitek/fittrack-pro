# Sprint 5 — PWA, Security, i18n & Audit

**Status:** ✅ COMPLETE  
**Date:** 2026-06-20  
**Build:** Backend + Frontend clean  

---

## 📋 What Was Implemented

### 1. Progressive Web App (PWA)

`vite-plugin-pwa` configured with Workbox service worker:

| Feature | Detail |
|---------|--------|
| Service Worker | `dist/sw.js` with 13 precached entries |
| Manifest | Auto-generated `manifest.webmanifest` |
| Offline page | `public/offline.html` with retry button |
| Icons | SVG icons (192×192, 512×512) in `public/icons/` |
| API caching | `runtimeCaching` for `/api/*` (NetworkFirst, 24h TTL) |
| Auto-update | `registerType: 'autoUpdate'` — SW updates silently |

**index.html updated:**
```html
<meta name="theme-color" content="#090910" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/icons/icon-192.svg" />
<link rel="manifest" href="/manifest.webmanifest" />
```

### 2. Redis Module (Backend)

A reusable `RedisModule` providing a global `ioredis` client:

```typescript
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config) => new Redis({
        host: config.get('REDIS_HOST', 'localhost'),
        port: config.get('REDIS_PORT', 6379),
        lazyConnect: true,  // Won't crash if Redis is unavailable
      }),
    },
  ],
  exports: [REDIS_CLIENT],
})
```

**Throttler upgraded** to v6 with updated API syntax:
```typescript
ThrottlerModule.forRoot({
  throttlers: [{ ttl: 60000, limit: 100 }],
})
```

### 3. i18n Completion (All Pages)

Missing translation keys added for:

| Section | New Keys | EN | FR |
|---------|----------|----|----|
| Track Summary | 8 | title, saved, duration, distance, calories, avgSpeed, steps, power, cadence, viewHistory | Activité terminée, Durée, Distance, etc. |
| Profile | 6 | save, saving, saved, saveError, unsaved, bodyData | Enregistrer, Modifications non enregistrées, etc. |
| History | 3 | empty, emptyHint, sessions | Aucune activité, sessions au total |
| Common | 7 | loading, error, retry, km, kcal, kmh, rpm, minutes, watts | Chargement, km, kcal, tr/min, etc. |

### 4. WCAG 2.1 AA Accessibility

| Fix | Location | Before | After |
|-----|----------|--------|-------|
| Semantic HTML | App.tsx | `<div>` for header/main/footer | `<header>`, `<main>`, `<footer>` |
| Aria labels | App.tsx | Language toggle | `aria-label="Switch language to..."` |
| Aria hidden | App.tsx | Decorative blurs | `aria-hidden="true"` |
| Aria live | App.tsx | User name | `aria-live="polite"` |
| Aria hidden | Logout button | Icon without label | `aria-label="Log out"` + `aria-hidden="true"` on icon |
| Landmarks | AppLayout | Single div tree | header, main, footer regions |

### 5. Audit Logging Module

**AuditService** — lightweight structured logging for key actions:

| Action | Trigger | Logged Data |
|--------|---------|------------|
| `user.register` | New account | userId, email, name |
| `user.login` | Successful login | userId, email |
| `user.logout` | Token revocation | userId |
| `activity.start` | Session start | activityId, type |
| `activity.stop` | Session end | activityId, distanceKm, calories |

Output format (JSON via NestJS Logger):
```json
{"timestamp":"2026-06-20T20:00:00.000Z","action":"user.login","userId":"uuid","email":"demo@fit.com"}
```

---

## ✅ Build Verification

### Frontend
```bash
npm run build   → ✅ PWA generated (13 precached entries, sw.js)
```

### Backend
```bash
npm run build   → ✅ 0 errors
```

---

## 📁 Files Created/Modified

### New Files (8)

```
frontend/public/
├── icons/icon-192.svg                (430 B)
├── icons/icon-512.svg                (560 B)
└── offline.html                      (1.1 KB)

backend/src/modules/
├── redis/redis.module.ts             (26 LOC)
├── audit/audit.service.ts            (26 LOC)
└── audit/audit.module.ts             (12 LOC)

frontend/src/i18n/translations.ts     (updated with 50+ new keys)
```

### Modified Files (10)

```
frontend/
├── vite.config.ts                    (+VitePWA plugin)
├── index.html                        (+PWA meta tags)
├── src/App.tsx                       (+semantic HTML, aria labels)

backend/src/
├── app.module.ts                     (+RedisModule, AuditModule)
├── modules/auth/auth.service.ts      (+AuditService injection, audit calls)
├── modules/activities/activities.service.ts (+AuditService injection, audit calls)
```

---

## 🎯 Key Design Decisions

### 1. **vite-plugin-pwa over manual SW**
- Auto-generates service worker + Workbox runtime
- Handles precaching + runtime caching
- Manifest auto-generated from plugin config
- No manual SW maintenance

### 2. **Redis with lazyConnect**
- `lazyConnect: true` prevents app crash if Redis is down
- Connection established on first use
- Graceful degradation: app works without Redis

### 3. **Structured JSON audit logs**
- Simple Logger-based (no DB dependency)
- JSON format for log aggregation (ELK, Datadog, etc.)
- Extensible: add fields without schema changes

### 4. **Semantic HTML over ARIA-only**
- Landmarks (`<header>`, `<main>`, `<footer>`) improve screen reader navigation
- ARIA attributes complement, not replace, semantic elements
- `aria-live="polite"` announces async updates

---

## 🚀 Ready for Next Sprint

### Sprint 6 Suggestions

| Item | Priority | Notes |
|------|----------|-------|
| E2E test expansion | High | Add more Playwright test scenarios |
| Integration tests | High | Testcontainers-based backend tests |
| k6 Performance tests | Medium | Load test critical endpoints |
| Security scan | Medium | npm audit, Snyk, OWASP ZAP |
| Docker Compose prod profile | Low | Separate dev/prod docker configs |

---

## 📋 Checklist

| Item | Status | Notes |
|------|--------|-------|
| PWA service worker | ✅ | 13 precached entries, auto-update |
| PWA manifest + icons | ✅ | SVG icons, theme_color, standalone |
| Offline page | ✅ | offline.html with retry |
| API runtime caching | ✅ | NetworkFirst, 24h TTL |
| Redis module | ✅ | ioredis client, lazyConnect |
| Throttler v6 upgrade | ✅ | Updated API syntax |
| i18n completion | ✅ | Profile, track summary, history, common |
| WCAG semantics | ✅ | header/main/footer landmarks |
| ARIA attributes | ✅ | Labels, hidden, live regions |
| Audit logging | ✅ | Auth + activity actions |
| Backend build | ✅ | 0 errors |
| Frontend build | ✅ | PWA generated |
