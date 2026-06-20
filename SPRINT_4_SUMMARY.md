# Sprint 4 — Profile Persistence, Achievement Grid & Activity Completion

**Status:** ✅ COMPLETE  
**Date:** 2026-06-20  
**Build:** Backend 23/23 — Frontend builds clean  

---

## 🔍 Pre-Sprint Audit: What Was Actually Missing

Before Sprint 4, the Profile, Achievement, and Cycling features *looked* finished but had critical gaps:

| Feature | Appearance | Reality |
|---------|-----------|---------|
| **Profile Page** | Full UI with sliders, gender, goal | ❌ **No save button** — changes vanish on refresh |
| **Achievement Grid** | Displays earned badges | ❌ Shows **only** backend results — empty state if API unavailable |
| **Activity Tracking** | Start/pause/stop works | ❌ **No post-activity summary** — user sees nothing after stopping |
| **Cycling Cadence** | `useStepCounter` detects cadence | ❌ cadenceRpm calculated but **never displayed in UI** |
| **Profile Mutation** | `useUpdateProfileMutation` exists | ❌ **Never called** from ProfilePage |

---

## 📋 What Was Implemented

### 1. Profile Persistence (Save Button)

**Before:** Sliders changed local React state. Refreshing the page lost all changes.

**After:** A `Save Profile` button at the bottom of the form:

```
ProfilePage
  ├─ BmiCard             (live preview)
  ├─ BodySliders          (weight, height, age)
  ├─ GenderToggle         (male / female / other)
  ├─ GoalSlider           (daily step goal)
  ├─ AchievementGrid      (all 10 badges with progress)
  └─ Save Profile Button  ← NEW
       └─ useUpdateProfileMutation
            └─ PATCH /api/users/me/profile
                 └─ On success: toast "Profile saved" + cache update
                 └─ On error: toast "Failed to save profile"
```

**UX flow:**
- User adjusts sliders → values update locally in real time
- Clicks "Save Profile" → calls API
- On success: green toast, optimistic cache update
- Button shows loading spinner during save
- Button disabled when no changes or already saving

### 2. All 10 Badges Always Visible

**Before:** `AchievementGrid` only rendered badges returned by the backend API. If the API returned 3 earned badges, only 3 showed up. Progress bars only appeared for returned badges.

**After:** The grid now renders **all 10 badge types** using the static badge definitions:

```
Badge Definition (hardcoded frontend)
  ├─ All 10 badges with displayName, description, emoji
  └─ Merge with backend results
       ├─ If earnedAt exists → show as "Earned" (green, emoji)
       ├─ If progressPercent > 0 → show progress bar + locked
       └─ If no progress → show locked, "Complete activities..."
```

This means:
- The grid always shows 10 slots (even on first load)
- Empty state text removed (replaced by filled grid)
- Progress percentages sync from backend
- Achievements always visible regardless of API state

### 3. Post-Activity Summary Modal

**Before:** After stopping an activity, the tracking page reset to ready state with no feedback.

**After:** A full-screen summary modal appears on activity stop:

```
ActivitySummaryModal
  ├─ Backdrop blur overlay
  ├─ Activity type icon + name
  ├─ Duration (formatted h:mm:ss)
  ├─ Distance (km, 2 decimals)
  ├─ Calories (kcal)
  ├─ Avg Speed (km/h)
  ├─ Steps
  ├─ Cycling-specific: Power (avg/max), Cadence (RPM)
  └─ "Done" button → navigates to history page
```

**Implementation:**
- `useState<SessionMetrics | null>` in TrackingPage
- Set on successful stop + save
- Modal renders on top of tracking UI
- "Done" → navigates to `/history`
- Toast notification on successful save

### 4. Cadence RPM Display (Cycling)

**Before:** `avgCadenceRpm` was calculated in `useStepCounter` and stored in session metrics, but never rendered in the tracking UI.

**After:** Added cadence RPM to the cycling metrics grid:

```
TrackingPage (cycling mode)
  ├─ Power (avg, max, zone)
  ├─ Cadence (RPM)              ← WAS MISSING
  └─ 1km Segments
```

The cadence value reads from `session.getMetrics().avgCadenceRpm` which is fed by `stepCounter.onCadenceChanged`.

---

## ✅ Verification

### Build
```bash
npm run build     → ✅ 0 errors, 0 warnings
npm run lint      → ✅ No ESLint violations
```

### Backend Tests
```bash
PASS src/modules/auth/auth.service.spec.ts          (6 tests)
PASS src/modules/activities/activities.service.spec.ts (11 tests)
PASS src/modules/stats/stats.service.spec.ts         (6 tests)

Test Suites: 3 passed, 3 total
Tests:       23 passed, 23 total
```

---

## 📁 Files Modified

### Profile Persistence
```
frontend/src/pages/ProfilePage.tsx
  ├─ +useUpdateProfileMutation import
  ├─ +useEffect to track dirty state
  ├─ +handleSave function
  ├─ +Save/Unsaved state indicator
  └─ +Save button with loading
```

### All Badges Display
```
frontend/src/components/profile/AchievementGrid.tsx
  ├─ +ALL_BADGES constant (10 badge definitions)
  ├─ +mergeAchievements() to combine static + API data
  └─ -removed empty state (always shows 10 slots)
```

### Post-Activity Summary
```
frontend/src/pages/TrackingPage.tsx
  ├─ +ActivitySummaryModal component (inline)
  ├─ +completedMetrics state
  ├─ +handleStop → sets completedMetrics
  └─ +modal render condition
```

### Cadence Display
```
frontend/src/pages/TrackingPage.tsx
  └─ +Cadence RPM row in cycling metrics grid + emoji
```

---

## 🎯 Key Design Decisions

### 1. **Save button pattern over auto-save**
- Auto-save would fire PATCH requests on every slider change (spam)
- Save button gives users control and batches changes
- Loading state prevents double-submit
- Dirty state indicator shows "(Unsaved changes)"

### 2. **10 hardcoded badge definitions**
- Achievement definitions are static by design
- Backend only returns earned status + progress
- Frontend owns the canonical list of all possible badges
- Merge strategy: spread earned data over static definitions

### 3. **Modal over page navigation for summary**
- User should see their results immediately
- Modal overlays the tracking page context
- "Done" navigates away cleanly
- Backdrop blur keeps focus on results

### 4. **Toast feedback on save**
- Immediate user feedback without page transition
- Error toasts for API failures
- Success toast confirms persistence
- 4-second auto-dismiss (standard UX pattern)

---

## 📊 Sprint 4 Data Flow

### Profile Save
```
Slider Change → local state → [Save] click
  → useUpdateProfileMutation
    → PATCH /api/users/me/profile
      → Backend: update profile fields
    → onSuccess:
      → invalidateQueries('profile')
      → setQueryData (optimistic)
      → addToast('success', 'Profile saved')
```

### Activity Complete
```
[Stop] click → activityApiService.stopActivity(id, metrics)
  → PATCH /api/activities/:id/stop
    → Backend: finalize + evaluate achievements
  → session.stop()
  → setCompletedMetrics(metrics)
  → render ActivitySummaryModal
  → [Done] → navigate('/history')
```

---

## 🚀 Ready for Next Sprint

### Sprint 5 Suggestions

| Item | Priority | Notes |
|------|----------|-------|
| PWA Service Worker | High | manifest.json, offline page, cache strategy |
| Redis Rate Limiting | Medium | Replace memory ThrottlerModule |
| Security Audit | Medium | Helmet config, CSP headers, CSRF |
| WCAG 2.1 AA | Low | aria labels, focus management, contrast |
| i18n Completion | Low | Translate profile + achievement strings |

---

## 📋 Checklist

| Item | Status | Notes |
|------|--------|-------|
| Profile save to backend | ✅ | PATCH /api/users/me/profile wired |
| Save button UX | ✅ | Loading, dirty state, disabled states |
| All 10 badges always visible | ✅ | Static definitions + API merge |
| Post-activity summary modal | ✅ | Full metrics display + navigation |
| Cadence RPM in tracking UI | ✅ | Cycling mode metrics grid |
| Toast feedback | ✅ | Success on save, error on API fail |
| Build verification | ✅ | tsc + vite build clean |
| Backend tests | ✅ | 23/23 passing |
| task.md updated | ✅ | Sprint 4 checklist finalized |
