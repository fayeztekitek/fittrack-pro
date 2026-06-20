# FitTrack Pro — User Guide

## Getting Started

### Creating an Account

1. Open the app in your browser.
2. On the login page, click **Sign Up**.
3. Fill in your details:
   - **Full Name** — your display name
   - **Email Address** — used for login
   - **Password** — minimum 6 characters
   - **Weight, Height, Age, Gender** — used for calorie and BMI calculations
   - **Daily Step Goal** — your target (3,000–20,000)
4. Click **Sign Up**. You're logged in automatically.

### Demo Account

For quick testing, use:
- **Email:** `demo@fit.com`
- **Password:** `demo123`

---

## Navigation

The bottom navigation bar gives access to 5 sections:

| Tab | Page | Description |
|-----|------|-------------|
| Dashboard | `/` | Daily overview, weekly summary, KPIs |
| Track | `/track` | Live GPS activity tracking |
| Stats | `/stats` | Charts and analytics |
| History | `/history` | Past activity sessions |
| Profile | `/profile` | Personal data, achievements, settings |

---

## Dashboard

The dashboard shows your daily and weekly fitness summary:

- **Step Ring** — Circular progress toward your daily step goal
- **Daily KPIs** — Steps, distance, calories, active time for today
- **Weekly Chart** — Steps per day for the current week
- **Weekly Summary** — Totals and averages across the week

---

## Tracking an Activity

### Start a Session

1. Tap the **Track** tab in the bottom navigation.
2. Select your activity type: **Running**, **Walking**, **Fast Walk**, or **Cycling**.
3. Toggle **Simulation Mode** if you want to test without GPS (uses virtual sensor data).
4. Tap **Start**.

### During the Session

The tracking screen displays live metrics:

| Metric | Description |
|--------|-------------|
| Elapsed Time | Duration since start |
| Distance | Distance covered (GPS) |
| Calories | Estimated calories burned |
| Steps | Step count (accelerometer) |
| Avg Speed | Average speed in km/h |
| GPS Status | Satellite connection indicator |

**Cycling-specific metrics:**

| Metric | Description |
|--------|-------------|
| Power | Estimated watts (physical model) |
| Power Zone | Training zone (Z1 Recovery – Z6 Anaerobic) |
| Cadence | Pedaling cadence in RPM (accelerometer) |

A live GPS map traces your route. Cycling sessions also show **1 km split segments** with pace per kilometer.

### Control Buttons

| Button | Action |
|--------|--------|
| Pause | Pause the session (metrics freeze) |
| Resume | Continue after pause |
| Stop | End the session and view summary |

### Post-Activity Summary

After stopping, a summary modal displays:
- Duration, distance, calories
- Average speed, steps taken
- Power and cadence (cycling only)

Tap **View in History** to see it in your activity log.

---

## Statistics

The Stats page shows your performance over time:

- **Period Selector** — Toggle between **Week** and **Month** views
- **Summary Cards** — Steps, distance, calories, active time totals
- **Steps Trend** — Line chart of daily steps
- **Calories Burned** — Bar chart of daily calories
- **Activity Breakdown** — Pie-style breakdown by activity type

---

## History

The History page lists all completed activity sessions:

- Each card shows: activity type, date, duration, distance, calories, speed
- Cycling sessions display average power and elevation
- Pagination for browsing many sessions
- Empty state guidance when no activities exist

---

## Profile

### Body Data

Adjust your physical metrics with sliders:
- **Weight** (30–200 kg)
- **Height** (100–230 cm)
- **Age** (5–100 years)

Changes are not saved until you click **Save Profile**. An **Unsaved changes** indicator appears when edits are pending.

### Gender

Select **Male**, **Female**, or **Other**.

### Daily Step Goal

Set your target between 3,000 and 20,000 steps using the slider.

### BMI Card

Your Body Mass Index is calculated in real time and categorized as Underweight, Normal, Overweight, or Obese.

### Achievements (Badges)

Earn badges by completing fitness milestones:

| Badge | Requirement |
|-------|-------------|
| First Run | Complete your first activity |
| 5K Runner | Run 5 km total |
| 10K Runner | Run 10 km total |
| Marathon Trainer | Run 42.2 km total |
| Century Rider | Cycle 100 km total |
| Speed Demon | Reach 15 km/h max speed |
| Power Beast | Reach 250 W max power |
| Weekly Warrior | Complete 5 activities in a week |
| Calorie Torcher | Burn 5,000 kcal total |
| Cycling Master | Complete 10 cycling sessions |

Locked badges show a 🔒 icon. Progress bars appear for badges in progress.

---

## Language & Accessibility

### Switching Language

Tap the language button in the top-right corner of any page to toggle between:
- **English** (EN)
- **Français** (FR)

All pages, navigation, and metrics are fully translated.

### Accessibility

- Screen readers are supported via semantic HTML landmarks (`<header>`, `<main>`, `<footer>`)
- All interactive elements have ARIA labels
- Dynamic content updates are announced via `aria-live` regions
- Decorative elements are hidden from assistive technology

---

## PWA — Install as App

FitTrack Pro is a Progressive Web App. You can install it on your device:

### Android (Chrome)
1. Open the app in Chrome.
2. Tap the menu (⋮) → **Add to Home screen**.
3. The app installs with its own icon and runs in standalone mode.

### iOS (Safari)
1. Open the app in Safari.
2. Tap the Share button → **Add to Home Screen**.
3. The app opens in full-screen mode without browser chrome.

### Offline Support

The app caches static assets and API responses:
- Previously visited pages work offline
- API calls use NetworkFirst strategy (fall back to cache when offline)

---

## Logging Out

Tap the logout icon (right side of the header) to end your session. Your refresh token is revoked server-side.

---

## API Documentation

Interactive API documentation is available via Swagger UI at:
```
http://localhost:3000/api/docs
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/activities/start` | Start activity session |
| PATCH | `/api/activities/:id/stop` | Stop and finalize activity |
| GET | `/api/activities` | List user activities |
| GET | `/api/activities/:id` | Get activity details |
| GET | `/api/stats/daily` | Daily statistics |
| GET | `/api/stats/weekly` | Weekly statistics |
| GET | `/api/stats/monthly` | Monthly statistics |
| GET | `/api/stats/activity-breakdown` | Activity type breakdown |
| GET | `/api/activities/achievements/list` | Badges and progress |
| PATCH | `/api/profile` | Update user profile |

All endpoints except `register` and `login` require a Bearer JWT token in the `Authorization` header.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| GPS not connecting | Ensure location permissions are granted. Try enabling **Simulation Mode** for testing. |
| Steps not counting | App needs accelerometer access. On iOS, ensure motion permissions are granted. |
| Login fails | Check your credentials. Use the demo account if you haven't registered. |
| Page won't load offline | Visit the page at least once while online. Workbox caches it for offline use. |
| Language not changing | The change applies immediately. Navigate to a different tab to see translated content. |
