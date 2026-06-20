# FitTrackPro — Enterprise Reverse Engineering Analysis

> **Source:** `FitTrackPro.html` — 1,273 lines · 77 KB · Single-file mobile PWA (French)
> **Date:** 2026-06-19
> **Roles applied:** Enterprise Architect · Solution Architect · Tech Lead · Senior Full-Stack · DB Architect · Product Owner · BA · DevOps · QA Manager · Security Architect · Reverse Engineering Expert

---

## Executive Summary

FitTrackPro is a **mobile-first fitness tracking Progressive Web Application** written as a single monolithic HTML file. It provides real-time activity tracking (walking, fast walking, running, cycling) using native device APIs (Geolocation, DeviceMotion), custom calorie and power computation engines, an achievement system, multi-user authentication via localStorage, and rich data visualisation (SVG line charts, Canvas GPS route map, bar charts).

The application is fully client-side; all state is stored in `localStorage`. There is no backend, no database, and no network calls beyond Google Fonts. Despite this, the business logic is non-trivial and production-worthy once properly lifted into a server-backed architecture.

**Estimation at a glance:**

| Dimension | Count |
|---|---|
| PostgreSQL tables | 8 |
| REST API endpoints | 27 |
| React components | 38 |
| Zustand stores | 4 |
| React Query hooks | 12 |
| NestJS modules | 6 |
| Development effort | ~42 person-days |
| Risk level | **Medium** |

---

## PHASE 1 — Source Code Inventory

### Source Code Inventory

| Élément | Type | Description | Importance |
|---|---|---|---|
| `<!DOCTYPE html>` structure | HTML | Single-page app, max-width 430px (mobile-first) | Critical |
| `#auth-wrap` | HTML/CSS | Authentication overlay (login + signup forms) | Critical |
| `#page-dashboard` | HTML | Dashboard page with step ring, weekly chart, KPIs | Critical |
| `#page-track` | HTML | Activity tracking page (selector + live sessions) | Critical |
| `#page-stats` | HTML | Statistics page (week/month period selector, charts) | High |
| `#page-history` | HTML | Activity history list | High |
| `#page-profile` | HTML | User profile + BMI + goal slider + achievements | High |
| `#nav` | HTML | Bottom navigation bar (5 tabs) | Critical |
| Google Fonts | External CDN | Bebas Neue, Barlow, Barlow Condensed | Low |
| CSS Variables (`:root`) | CSS | 7 color tokens: `--g` green, `--o` orange, `--b` blue, `--p` purple, `--y` yellow, `--r` red, `--cy` cyan | Medium |
| Responsive grid utilities | CSS | `.g2`, `.g3` — 2 and 3 column grids | Low |
| Animation classes | CSS | `.pulse` (2s infinite), `.su` (slide-up 0.3s) | Low |
| Bar chart CSS | CSS | `.bar-chart`, `.bar-col`, `.bar-fill`, `.bar-lbl` | Low |
| `ACTS` constant | JS | Activity definitions: walking, fastWalk, running, cycling with MET, calorie factor, speed range | Critical |
| `LS` helper | JS | localStorage CRUD wrapper with JSON parse/stringify | High |
| `simpleHash()` | JS | djb2-inspired 32-bit integer hash for password storage | Critical (security risk) |
| `doLogin()` | JS | Email + hashed password authentication | Critical |
| `doSignup()` | JS | Registration with email uniqueness validation | Critical |
| `loginSuccess()` | JS | Session creation via `ft_current` key | Critical |
| `doLogout()` | JS | Session teardown | High |
| Auto-login IIFE | JS | Checks `ft_current` on load | High |
| `S` session state object | JS | Live session: tracking state, GPS route, steps, speed, elevation, cycling buffers | Critical |
| `fmtT()` | JS | Formats seconds → HH:MM:SS | Medium |
| `haversine()` | JS | Geodesic distance between GPS coordinates (km) | Critical |
| `genHistory()` | JS | Generates 7-day random seed history | Low |
| Step counter algorithm | JS | Low-pass gravity filter + peak detection + 250ms debounce on `devicemotion` | Critical |
| `onMotion()` | JS | DeviceMotion event handler; also computes cycling cadence (RPM) | Critical |
| `reqMotionPerm()` | JS | iOS 13+ DeviceMotionEvent.requestPermission() | High |
| `startGPS()` / `onGPS()` | JS | Geolocation.watchPosition with high accuracy; speed, distance, elevation | Critical |
| `onGPSErr()` | JS | GPS error handler (denied / unavailable / timeout) | High |
| `calcPower()` | JS | Cycling power: `P = (F_roll + F_aero) × v` physics formula | Critical |
| `powerZone()` | JS | 6-zone FTP-based power classification | High |
| `calcCals()` | JS | MET-based calories for cycling; step×weight factor for others | Critical |
| `startTimer()` / `stopTimer()` | JS | 1-second interval for elapsed time + speed accumulation | Critical |
| `startSim()` / `stopSim()` | JS | Simulation fallback when no real sensors | Medium |
| `startActivity()` | JS | Resets session state, fires GPS + timer + sim | Critical |
| `togglePause()` | JS | Pause/resume with UI state sync | High |
| `stopActivity()` | JS | Computes final entry, persists to history | Critical |
| `updateLiveUI()` | JS | Real-time DOM updates every second | Critical |
| `drawRoute()` | JS | Canvas-based GPS route rendering with scale normalization | High |
| `renderCySegs()` | JS | Renders 1km cycling segments list | Medium |
| `goTab()` | JS | Single-page navigation with page show/hide | Critical |
| `renderDashboard()` | JS | Aggregates today stats + weekly chart | Critical |
| `updateRing()` | JS | SVG circular progress ring animation | High |
| `renderTrack()` | JS | Shows/hides live vs selector panels | Critical |
| `buildActGrid()` | JS | Dynamically renders activity selection buttons | High |
| `selectAct()` | JS | Updates selected activity with visual feedback | Medium |
| `renderStats()` | JS | Period-filtered SVG line chart + bar chart + activity breakdown | High |
| `renderHistory()` | JS | Renders activity history cards | High |
| `renderProfilePage()` | JS | Profile form + BMI card + achievements | High |
| `updateBMI()` | JS | BMI calculation with 4-class categorization | High |
| `renderAchs()` | JS | 9 achievement badge evaluations | Medium |
| `saveProfile()` / `getProfile()` | JS | User profile persistence to localStorage | Critical |
| `setGender()` | JS | Gender toggle with visual button state | Low |
| `saveHistory()` / `loadHistory()` | JS | Per-user history persistence keyed by email | Critical |
| `updateClock()` | JS | Live clock in status bar (10s interval) | Low |
| `initApp()` | JS | App bootstrap: loads history, renders all pages, pre-warms GPS | Critical |
| `localStorage` — `ft_users` | Storage | Map of email → user object (all users) | Critical |
| `localStorage` — `ft_current` | Storage | Email of logged-in user (session token) | Critical |
| `localStorage` — `ft_hist_{email}` | Storage | Array of activity history entries per user | Critical |
| `navigator.geolocation` | Web API | GPS position tracking | Critical |
| `DeviceMotionEvent` | Web API | Accelerometer for step counting | Critical |
| `<canvas id="route-canvas">` | Web API | GPS route visualisation | High |
| `<svg id="steps-svg">` | HTML/JS | Steps line chart (inline SVG, dynamically built) | Medium |

---

## PHASE 2 — Screen Mapping

### Screen 1 — Authentication (`#auth-wrap`)

| Property | Value |
|---|---|
| **Objective** | Authenticate or register users |
| **Data displayed** | Email, password, optional: first name, weight |
| **Actions** | Switch Login/Signup tab, submit login, submit signup |
| **Dependencies** | `ft_users` localStorage, `ft_current` localStorage |
| **Business rules** | Email format validation, password ≥ 6 chars, email uniqueness, simple hash password check |

### Screen 2 — Dashboard (`#page-dashboard`)

| Property | Value |
|---|---|
| **Objective** | Daily summary + weekly overview + one-tap activity start |
| **Data displayed** | Greeting + date, step ring (steps / goal / %), today's calories / distance / speed / active time, weekly bar chart (steps), weekly distance, weekly calories, goals met count, streak count |
| **Actions** | Start activity (navigates to Track), navigate tabs |
| **Dependencies** | `currentUser.stepGoal`, `S.history` (last 7), `S.totalStepsToday`, `S.isTracking` |

### Screen 3 — Activity Tracking (`#page-track`)

| Property | Value |
|---|---|
| **Objective** | Select, start, monitor and stop activities |
| **Sub-screens** | Activity selector, Generic live session (walking/running), Cycling live session |
| **Data displayed** | Sensor status (GPS + accelerometer dots), 4 activity cards, live timer, steps, distance, calories, speed, pace, SPM, goal%, GPS canvas route |
| **Actions** | Select activity, Start, Pause/Resume, Stop |
| **Dependencies** | `navigator.geolocation`, `DeviceMotionEvent`, `ACTS`, `S` session state |
| **Special** | Cycling mode shows power widget (0-400W), zone label, cadence (RPM), 1km segments, Vmax/Vmoy/elevation/avg-power bar |

### Screen 4 — Statistics (`#page-stats`)

| Property | Value |
|---|---|
| **Objective** | Aggregated performance analytics |
| **Period toggle** | Week (7 sessions) / Month (up to 30 sessions) |
| **Data displayed** | Total steps / distance / calories summary cards, SVG area line chart (steps evolution), bar chart (calories), activity type breakdown with proportional bars |
| **Actions** | Toggle week/month period |
| **Dependencies** | `S.history` |

### Screen 5 — History (`#page-history`)

| Property | Value |
|---|---|
| **Objective** | Chronological list of past activities |
| **Data displayed** | Activity icon, type, day, duration, steps, distance, calories, Vmax, avg power, elevation gain |
| **Actions** | Scroll (read-only) |
| **Dependencies** | `S.history` |

### Screen 6 — Profile (`#page-profile`)

| Property | Value |
|---|---|
| **Objective** | User data management + personal analytics + achievements |
| **Data displayed** | Avatar, editable name, height/weight/age summary, BMI card (value + category + color), daily step goal slider, body data sliders (weight 30-200kg, height 100-230cm, age 5-100), gender toggle, 9 achievement badges |
| **Actions** | Edit name (inline), slide weight/height/age/goal, toggle gender, logout |
| **Dependencies** | `currentUser`, `S.history` |

---

## PHASE 3 — Functional Cartography

| Fonctionnalité | Description | Entrées | Traitements | Sorties |
|---|---|---|---|---|
| **User Registration** | Create new account | name, email, password, weight | Validate fields, check email uniqueness, hash password, persist | User record in `ft_users`, auto-login |
| **User Login** | Authenticate existing user | email, password | Lookup user, compare hash, create session | `ft_current` set, app initialized |
| **Auto-Login** | Resume session on reload | `ft_current` localStorage key | Load user record | App initializes without auth screen |
| **Logout** | End session | Button click | Stop active activity, clear `ft_current` | Auth screen shown |
| **Activity Selection** | Choose activity type | Click on card | Set `S.actKey`, highlight selected card | UI reflects selection |
| **Activity Start** | Begin tracking session | Button click | Reset session state, request GPS + motion permissions, start timer + simulation | Live UI visible, sensors active |
| **Real-Time Step Counting** | Count steps via accelerometer | `devicemotion` events | Low-pass filter (α=0.8) → linear acceleration → moving avg (window=4) → peak detection (threshold=2.2 m/s²) + debounce (250ms) | `S.steps` incremented |
| **Cycling Cadence Detection** | Estimate pedaling cadence | `devicemotion` events | 4s sliding window peak counting → RPM = peaks × 15 | `S.cadRPM` updated |
| **GPS Distance Tracking** | Compute distance from GPS | `watchPosition` updates | Haversine distance between consecutive points accumulated | `S.dist` in km |
| **GPS Speed Capture** | Record instantaneous speed | `watchPosition` speed field | If GPS speed > 0.5 km/h, override simulation speed | `S.speed` in km/h |
| **Elevation Tracking** | Track altitude gain/loss | `watchPosition` altitude | Track min/max altitude during session | `S.gpsMinAlt`, `S.gpsMaxAlt` |
| **Activity Auto-Detection** | Detect walk/fast-walk/run from speed | `S.speed` value | If ≥7 km/h → running; ≥4 → fastWalk; else → walking | Live badge label + color updated |
| **Calorie Calculation** | Estimate energy expenditure | activity type, distance/duration, weight | Cycling: MET×weight×hours; Others: dist×weight×cal-factor | `calories` in kcal |
| **Cycling Power Estimation** | Estimate watt output | speed (m/s), weight | P = (Crr×m×g + 0.5×Cd×A×ρ×v²) × v | Watts + power zone label |
| **Power Zone Classification** | Map watts to training zone | watts, weight (FTP=3.5W/kg) | % of FTP → 6 zones (Recovery → Anaerobic) | Zone 1–6 string label |
| **Pace Calculation** | Minutes per kilometer | speed (km/h) | pace = 60 / speed | `mm.f'` string |
| **Steps-per-Minute** | Cadence in SPM | steps, elapsed seconds | SPM = steps / (elapsed_sec / 60) | Integer SPM |
| **Goal Progress** | % of daily step goal achieved | total steps today, stepGoal | pct = min(totalSteps/stepGoal, 1) | Ring animation + % label |
| **Pause / Resume** | Suspend/continue session | Button click | Toggle `S.isPaused`; timer still ticks but metrics frozen | Button label + live indicator updated |
| **Activity Stop + Save** | End session and persist | Button click | Compute final entry (dist fallback: steps×0.00075 km), push to `S.history`, persist | History updated, dashboard refreshed |
| **GPS Route Rendering** | Draw route on canvas | GPS route array | Normalize lat/lng to canvas coords, draw polyline with start/end dots | Canvas rendered |
| **Cycling 1km Segments** | Record split times every km | GPS updates for cycling | Accumulate distance, trigger at ≥1km threshold | Segment card appended |
| **Weekly Dashboard Chart** | Visualize 7-day steps | `S.history` last 7 | Map steps to bar heights relative to max | Bar chart HTML |
| **Steps Line Chart (Stats)** | SVG area chart of steps | filtered history | Compute SVG path `M…L…Z` with gradient fill | SVG injected |
| **Calories Bar Chart** | Bar chart calories | filtered history | Map calories to bar heights | Bar chart HTML |
| **Activity Breakdown** | % share per activity type | full history | Group by activity key, compute percentage | Progress bars + counts |
| **BMI Calculation** | Body Mass Index | weight (kg), height (cm) | BMI = weight / (height/100)² | Value + category (4 classes) + color |
| **Profile Save** | Persist body/goal changes | slider/input changes | Update `currentUser` object, persist to `ft_users` | Profile sub-line + BMI refreshed |
| **Achievement Evaluation** | Evaluate 9 badges | history, today totals | Condition checks on history aggregates | Badge earned/locked rendering |
| **Streak Calculation** | Days with recorded activity | `S.history.length` | min(history.length, 7) — **⚠ simplified** | Streak count label |
| **Sensor Status Display** | Show GPS + accel status | DOM state | Toggle `.on`/`.off` CSS classes | Colored sensor dots |
| **GPS Pre-warm** | Get initial position on app init | `getCurrentPosition` | One-shot position fetch to warm GPS cache | GPS label = "Prêt" |
| **Activity Simulation** | Fallback when no real sensors | Timer interval | Drift speed randomly ±0.8, accumulate distance, simulate steps + cadence | `S.speed`, `S.dist`, `S.cadRPM` updated |
| **Clock Display** | Status bar clock | `setInterval` 10s | `Date()` → HH:MM | `#clock` text |

---

## PHASE 4 — Business Rules Catalog

### BR-01 — Password Minimum Length
- **Logic:** `pwd.length < 6` → error
- **Impact:** Security gate for account creation
- **Criticality:** High
- **⚠ Risk:** Password stored as a weak non-cryptographic hash (djb2 modular)

### BR-02 — Email Format Validation
- **Logic:** `/\S+@\S+\.\S+/.test(email)`
- **Impact:** Prevents malformed accounts
- **Criticality:** Medium

### BR-03 — Email Uniqueness
- **Logic:** `if(users[email])` → error "Cet email est déjà utilisé"
- **Impact:** One account per email
- **Criticality:** High

### BR-04 — Demo Account Seeding
- **Logic:** On every login/auto-login, if `users['demo@fit.com']` is missing, it is created with `demo123`
- **Impact:** Always-available demo account
- **Criticality:** Low (remove in production)

### BR-05 — Step Detection Threshold
- **Logic:** Smoothed magnitude > 2.2 m/s² AND time since last step > 250ms
- **Impact:** Determines step accuracy; too low → over-count, too high → under-count
- **Criticality:** Critical

### BR-06 — Low-Pass Gravity Filter
- **Logic:** `gx = 0.8*gx + 0.2*acc.x` (α=0.8 for all 3 axes)
- **Impact:** Separates gravity from linear acceleration
- **Criticality:** Critical

### BR-07 — Moving Average Smoothing
- **Logic:** 4-sample sliding window average of magnitude
- **Impact:** Reduces noise spikes in step detection
- **Criticality:** High

### BR-08 — Cycling Cadence Algorithm
- **Logic:** 4-second buffer, count peaks > 1.5 in buffer, RPM = peaks × 15
- **Impact:** Estimates pedaling cadence without dedicated sensor
- **Criticality:** High

### BR-09 — GPS Speed Override
- **Logic:** If GPS speed > 0.5 km/h, use GPS speed; otherwise use simulation
- **Impact:** GPS takes priority; 0.5 km/h threshold prevents jitter adoption
- **Criticality:** High

### BR-10 — Distance Fallback Calculation
- **Logic:** On stop: if `S.dist < 0.01` and not cycling → use `steps × 0.00075 km` (≈ 0.75m per step)
- **Impact:** Provides a usable distance estimate when GPS unavailable
- **Criticality:** Medium
- **Confidence:** High (explicit in code)

### BR-11 — Cycling Calorie Formula (MET)
- **Logic:** `Cal = MET(7.5) × weight_kg × (duration_sec / 3600)`
- **Impact:** Energy expenditure for cycling sessions
- **Criticality:** High

### BR-12 — Walking/Running Calorie Formula
- **Logic:** `Cal = distance_km × weight_kg × cal_factor` (0.57 walking, 0.72 fast-walk, 1.0 running)
- **Impact:** Energy expenditure for step-based activities
- **Criticality:** High

### BR-13 — Cycling Power Model
- **Logic:** `P = (Crr×m×g + 0.5×Cd×A×ρ×v²) × v`
  - Crr=0.004, g=9.81, Cd=0.7, A=0.5, ρ=1.2
- **Impact:** Estimates instantaneous cycling power output
- **Criticality:** High

### BR-14 — FTP-Based Power Zones
- **Logic:** FTP = weight × 3.5 W/kg; % of FTP maps to 6 zones:
  - <56% Zone 1 Recovery, <76% Zone 2 Endurance, <91% Zone 3 Tempo, <106% Zone 4 Threshold, <121% Zone 5 VO2max, ≥121% Zone 6 Anaerobic
- **Impact:** Training guidance
- **Criticality:** Medium

### BR-15 — Activity Auto-Detection from Speed
- **Logic:** speed ≥ 7 km/h → running; ≥ 4 km/h → fast walk; else → walking
- **Impact:** Dynamic badge display during non-cycling sessions
- **Criticality:** Medium

### BR-16 — Elevation Gain Calculation
- **Logic:** `elevGain = max(0, gpsMaxAlt - gpsMinAlt)` (simplified — not true cumulative gain)
- **Impact:** Shows altitude delta; does not accumulate ascending meters separately
- **Criticality:** Medium
- **⚠ Hypothesis:** True cumulative elevation (sum of positive deltas) would be more accurate. Confidence: High that current is simplified.

### BR-17 — Daily Goal Progress Ring
- **Logic:** `pct = min((totalStepsToday + sessionSteps) / stepGoal, 1)` → SVG stroke-dashoffset
- **Impact:** Core motivation mechanic
- **Criticality:** High

### BR-18 — BMI Classification
- **Logic:** BMI = weight / (height_m)²; <18.5 underweight (blue), <25 normal (green), <30 overweight (yellow), ≥30 obese (red)
- **Impact:** Health indicator
- **Criticality:** Medium

### BR-19 — Streak Calculation (Simplified)
- **Logic:** `min(S.history.length, 7)` — does NOT check date continuity
- **Impact:** Streak counter is not date-aware; any 7+ entries = full streak
- **Criticality:** Medium
- **⚠ Gap:** Real production should compute consecutive-day streaks from timestamps

### BR-20 — Step Goal Range
- **Logic:** Slider min=3,000, max=20,000, step=500
- **Impact:** User-defined daily target
- **Criticality:** Medium

### BR-21 — 1km Cycling Segment Trigger
- **Logic:** Accumulate `cySegDist`; when ≥1.0km, record segment {km, spd, time}
- **Impact:** Per-kilometer split analysis for cyclists
- **Criticality:** Medium

### BR-22 — Achievement Conditions
| Badge | Condition |
|---|---|
| 🥇 10K steps | todayTotal ≥ 10,000 OR any session ≥ 10,000 steps |
| 🔥 7-day streak | history.length ≥ 7 |
| 🚀 5km session | any session distance ≥ 5km |
| ⚡ Sprinter | any running session with maxSpeed > 10 km/h |
| 🚴 Cyclist | any cycling session ≥ 10km |
| 💪 200W | any cycling session avgPow ≥ 200W |
| 🌟 Regular | history.length ≥ 10 |
| 🏔 Elevation | cumulative elevGain ≥ 500m |
| 🎯 Goal master | 5+ sessions meeting stepGoal |

---

## PHASE 5 — Domain Driven Design

### Bounded Contexts

```
┌────────────────────────────────────────────────────────┐
│  IDENTITY & ACCESS CONTEXT                             │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │  User (Agg.) │  │  Session     │                   │
│  │  - id        │  │  - userId    │                   │
│  │  - email     │  │  - token     │                   │
│  │  - name      │  │  - expiresAt │                   │
│  │  - hash      │  └──────────────┘                   │
│  └──────────────┘                                      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  USER PROFILE CONTEXT                                  │
│  ┌──────────────────────────────┐                      │
│  │  UserProfile (Agg.)          │                      │
│  │  - userId                    │                      │
│  │  - weight (VO: BodyMetric)   │                      │
│  │  - height (VO: BodyMetric)   │                      │
│  │  - age                       │                      │
│  │  - gender                    │                      │
│  │  - stepGoal (VO: StepGoal)   │                      │
│  │  + bmi(): BMI (VO)           │                      │
│  └──────────────────────────────┘                      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  ACTIVITY TRACKING CONTEXT                             │
│  ┌──────────────────────────────┐                      │
│  │  ActivitySession (Agg.)      │                      │
│  │  - id                        │                      │
│  │  - userId                    │                      │
│  │  - type (Enum)               │                      │
│  │  - status (Enum)             │                      │
│  │  - startedAt                 │                      │
│  │  - endedAt                   │                      │
│  │  - steps                     │                      │
│  │  - distance (VO: Distance)   │                      │
│  │  - calories (VO: Energy)     │                      │
│  │  - maxSpeed                  │                      │
│  │  - avgSpeed                  │                      │
│  │  - elevationGain             │                      │
│  │  - avgPower (nullable)       │                      │
│  ├──────────────────────────────┤                      │
│  │  GpsPoint (Entity)           │                      │
│  │  - lat, lng, altitude, ts    │                      │
│  ├──────────────────────────────┤                      │
│  │  CyclingSegment (Entity)     │                      │
│  │  - km, speed, splitTime      │                      │
│  ├──────────────────────────────┤                      │
│  │  PowerSample (VO)            │                      │
│  │  - watts, zone, recordedAt   │                      │
│  └──────────────────────────────┘                      │
│                                                        │
│  Domain Services:                                      │
│  - CalorieCalculationService                           │
│  - PowerEstimationService                              │
│  - StepDetectionService                                │
│  - ElevationService                                    │
│                                                        │
│  Domain Events:                                        │
│  - ActivityStarted                                     │
│  - ActivityPaused                                      │
│  - ActivityResumed                                     │
│  - ActivityCompleted                                   │
│  - MilestoneReached (1km segment)                      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  ACHIEVEMENT CONTEXT                                   │
│  ┌──────────────────────────────┐                      │
│  │  AchievementProfile (Agg.)   │                      │
│  │  - userId                    │                      │
│  │  - earnedBadges []           │                      │
│  ├──────────────────────────────┤                      │
│  │  Badge (Entity)              │                      │
│  │  - id (Enum key)             │                      │
│  │  - name, description         │                      │
│  │  - condition (fn)            │                      │
│  │  - earnedAt (nullable)       │                      │
│  └──────────────────────────────┘                      │
│                                                        │
│  Domain Events:                                        │
│  - BadgeEarned                                         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  ANALYTICS CONTEXT                                     │
│  Read-only projections from ActivityTracking context   │
│  - DailyStepSummary                                    │
│  - WeeklyReport                                        │
│  - MonthlyReport                                       │
│  - ActivityBreakdown                                   │
│  - StreakCalculation (date-aware)                       │
└────────────────────────────────────────────────────────┘
```

---

## PHASE 6 — Data Model

### Logical Data Model

**Users** ← owns → **UserProfiles** ← has → **ActivitySessions** ← contains → **GpsPoints**, **CyclingSegments**
**Users** ← has → **AchievementRecords**
**ActivitySessions** ← references → **ActivityTypes** (lookup)

### Physical Data Model

#### Table: `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK, default gen_random_uuid() |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL |
| `password_hash` | `VARCHAR(255)` | NOT NULL (bcrypt) |
| `name` | `VARCHAR(100)` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default now() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default now() |
| `last_login_at` | `TIMESTAMPTZ` | nullable |
| `is_active` | `BOOLEAN` | NOT NULL, default true |

Indexes: `users_email_idx` UNIQUE on `email`

---

#### Table: `user_profiles`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `user_id` | `UUID` | FK → users.id, UNIQUE, NOT NULL |
| `weight_kg` | `DECIMAL(5,1)` | NOT NULL, CHECK 30–200 |
| `height_cm` | `SMALLINT` | NOT NULL, CHECK 100–230 |
| `age` | `SMALLINT` | NOT NULL, CHECK 5–100 |
| `gender` | `ENUM('male','female','other')` | NOT NULL |
| `step_goal` | `INTEGER` | NOT NULL, default 10000, CHECK 3000–20000 |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default now() |

---

#### Table: `activity_types` (lookup / seed)

| Column | Type | Constraints |
|---|---|---|
| `key` | `VARCHAR(20)` | PK |
| `label` | `VARCHAR(50)` | NOT NULL |
| `icon` | `VARCHAR(10)` | NOT NULL |
| `color_hex` | `CHAR(7)` | NOT NULL |
| `mets` | `DECIMAL(4,2)` | NOT NULL |
| `cal_factor` | `DECIMAL(4,3)` | nullable |
| `speed_min_kmh` | `DECIMAL(5,2)` | nullable |
| `speed_max_kmh` | `DECIMAL(5,2)` | nullable |

Seed: walking, fastWalk, running, cycling

---

#### Table: `activity_sessions`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `user_id` | `UUID` | FK → users.id, NOT NULL |
| `activity_type` | `VARCHAR(20)` | FK → activity_types.key, NOT NULL |
| `status` | `ENUM('active','paused','completed','abandoned')` | NOT NULL |
| `started_at` | `TIMESTAMPTZ` | NOT NULL |
| `ended_at` | `TIMESTAMPTZ` | nullable |
| `duration_sec` | `INTEGER` | nullable, CHECK ≥0 |
| `steps` | `INTEGER` | NOT NULL, default 0 |
| `distance_km` | `DECIMAL(8,3)` | NOT NULL, default 0 |
| `calories_kcal` | `INTEGER` | NOT NULL, default 0 |
| `max_speed_kmh` | `DECIMAL(5,2)` | nullable |
| `avg_speed_kmh` | `DECIMAL(5,2)` | nullable |
| `elevation_gain_m` | `INTEGER` | nullable |
| `avg_power_watts` | `INTEGER` | nullable |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default now() |

Indexes: `sessions_user_id_idx`, `sessions_started_at_idx`

---

#### Table: `gps_points`

| Column | Type | Constraints |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `session_id` | `UUID` | FK → activity_sessions.id, NOT NULL |
| `latitude` | `DECIMAL(10,7)` | NOT NULL |
| `longitude` | `DECIMAL(10,7)` | NOT NULL |
| `altitude_m` | `DECIMAL(8,2)` | nullable |
| `speed_ms` | `DECIMAL(6,3)` | nullable |
| `accuracy_m` | `DECIMAL(7,2)` | nullable |
| `recorded_at` | `TIMESTAMPTZ` | NOT NULL |

Indexes: `gps_session_id_idx`, `gps_recorded_at_idx`

---

#### Table: `cycling_segments`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `session_id` | `UUID` | FK → activity_sessions.id, NOT NULL |
| `km_marker` | `SMALLINT` | NOT NULL |
| `speed_kmh` | `DECIMAL(5,2)` | NOT NULL |
| `split_time_sec` | `INTEGER` | NOT NULL |
| `recorded_at` | `TIMESTAMPTZ` | NOT NULL |

---

#### Table: `power_samples` (cycling power timeseries)

| Column | Type | Constraints |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `session_id` | `UUID` | FK → activity_sessions.id, NOT NULL |
| `watts` | `INTEGER` | NOT NULL |
| `zone` | `SMALLINT` | NOT NULL, 1–6 |
| `cadence_rpm` | `SMALLINT` | nullable |
| `recorded_at` | `TIMESTAMPTZ` | NOT NULL |

---

#### Table: `achievements`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `user_id` | `UUID` | FK → users.id, NOT NULL |
| `badge_key` | `VARCHAR(30)` | NOT NULL |
| `earned_at` | `TIMESTAMPTZ` | NOT NULL |
| UNIQUE | | `(user_id, badge_key)` |

---

#### Table: `refresh_tokens` (auth)

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `user_id` | `UUID` | FK → users.id, NOT NULL |
| `token_hash` | `VARCHAR(255)` | NOT NULL |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL |
| `revoked_at` | `TIMESTAMPTZ` | nullable |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |

---

## PHASE 7 — State Machine

### Application-Level State

```
┌─────────────────┐
│  UNAUTHENTICATED│ ←─────────────────────────────────┐
└────────┬────────┘                                    │
         │ doLogin() / doSignup()                      │
         ▼                                             │
┌─────────────────┐                                    │
│  AUTHENTICATED  │──── doLogout() ────────────────────┘
│  (tab: dashboard│
└────────┬────────┘
         │
         │ goTab('track') → startActivity()
         ▼
┌─────────────────┐
│  SESSION_ACTIVE │
│  isTracking=true│
│  isPaused=false │
└────┬───────┬────┘
     │       │
 togglePause()│
     │       │ stopActivity()
     ▼       │
┌──────────┐ │
│  PAUSED  │ │
│isPaused=T│ │
└────┬─────┘ │
     │       │
 togglePause()│
     │       │
     └───────┘
             │
             ▼
┌─────────────────┐
│  SESSION_SAVED  │
│  entry in hist. │
│  isTracking=F   │
│  → renders dash │
└─────────────────┘
```

### GPS Sensor State

```
IDLE → ACQUIRING → ACTIVE → ERROR (denied | unavailable | timeout)
                       ↓
                   TRACKING (during active session)
```

### Accelerometer State

```
IDLE → PERMISSION_REQUESTED (iOS) → ACTIVE → STEP_DETECTED (debounced peak)
```

---

## PHASE 8 — Target Architecture

### Frontend Architecture

```
src/
├── main.tsx
├── App.tsx (React Router + QueryClient + Zustand)
│
├── pages/
│   ├── AuthPage.tsx
│   ├── DashboardPage.tsx
│   ├── TrackPage.tsx
│   ├── StatsPage.tsx
│   ├── HistoryPage.tsx
│   └── ProfilePage.tsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── dashboard/
│   │   ├── StepRing.tsx
│   │   ├── DailyMetricsGrid.tsx
│   │   ├── WeeklyChart.tsx
│   │   └── WeeklySummaryCards.tsx
│   ├── track/
│   │   ├── SensorStatus.tsx
│   │   ├── ActivitySelector.tsx
│   │   ├── ActivityCard.tsx
│   │   ├── LiveSessionGeneric.tsx
│   │   ├── LiveSessionCycling.tsx
│   │   ├── PowerWidget.tsx
│   │   ├── CyclingSegments.tsx
│   │   ├── GpsMap.tsx
│   │   └── SessionControls.tsx
│   ├── stats/
│   │   ├── PeriodSelector.tsx
│   │   ├── StatsSummaryCards.tsx
│   │   ├── StepsLineChart.tsx  (Recharts)
│   │   ├── CaloriesBarChart.tsx (Recharts)
│   │   └── ActivityBreakdown.tsx
│   ├── history/
│   │   └── HistoryItem.tsx
│   ├── profile/
│   │   ├── AvatarCard.tsx
│   │   ├── BmiCard.tsx
│   │   ├── BodyDataSliders.tsx
│   │   ├── GoalSlider.tsx
│   │   ├── GenderToggle.tsx
│   │   └── AchievementGrid.tsx
│   └── shared/
│       ├── BottomNav.tsx
│       ├── StatusBar.tsx
│       ├── Card.tsx
│       ├── BigButton.tsx
│       ├── Badge.tsx
│       ├── ProgressBar.tsx
│       └── StatCard.tsx
│
├── hooks/
│   ├── useStepCounter.ts     (DeviceMotion)
│   ├── useGpsTracker.ts      (Geolocation)
│   ├── useCadenceDetector.ts (DeviceMotion cycling)
│   ├── useSessionTimer.ts
│   ├── useActivitySim.ts
│   ├── usePowerCalculator.ts
│   └── useClock.ts
│
├── stores/ (Zustand)
│   ├── authStore.ts         (currentUser, token)
│   ├── sessionStore.ts      (S state object lifted)
│   ├── profileStore.ts      (profile + step goal)
│   └── uiStore.ts           (activeTab, period)
│
├── services/
│   ├── authService.ts       (login, signup, refresh)
│   ├── activityService.ts   (CRUD sessions)
│   ├── profileService.ts    (CRUD profile)
│   ├── statsService.ts      (aggregated analytics)
│   └── achievementService.ts
│
├── domain/
│   ├── calorie.ts           (calcCals, MET formulas)
│   ├── power.ts             (calcPower, powerZone)
│   ├── stepDetector.ts      (lowpass, peakDetect)
│   ├── haversine.ts
│   └── bmi.ts
│
└── types/
    ├── activity.ts
    ├── user.ts
    ├── session.ts
    └── achievement.ts
```

### Backend Architecture (NestJS)

```
src/
├── main.ts (Swagger, global pipes, helmet)
├── app.module.ts
│
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts   (POST /auth/login, /register, /refresh, /logout)
│   │   ├── auth.service.ts      (bcrypt, JWT sign/verify)
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-refresh.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   └── entities/user.entity.ts
│   │
│   ├── profile/
│   │   ├── profile.module.ts
│   │   ├── profile.controller.ts (GET/PATCH /users/me/profile)
│   │   ├── profile.service.ts
│   │   └── dto/update-profile.dto.ts
│   │
│   ├── activities/
│   │   ├── activities.module.ts
│   │   ├── activities.controller.ts
│   │   ├── activities.service.ts
│   │   ├── activities.repository.ts
│   │   └── dto/
│   │       ├── create-session.dto.ts
│   │       ├── update-session.dto.ts
│   │       └── add-gps-point.dto.ts
│   │
│   ├── stats/
│   │   ├── stats.module.ts
│   │   ├── stats.controller.ts  (GET /stats/daily, /weekly, /monthly)
│   │   └── stats.service.ts     (PostgreSQL aggregation queries)
│   │
│   └── achievements/
│       ├── achievements.module.ts
│       ├── achievements.controller.ts
│       ├── achievements.service.ts  (badge evaluation engine)
│       └── entities/achievement.entity.ts
│
└── common/
    ├── guards/jwt-auth.guard.ts
    ├── guards/roles.guard.ts
    ├── decorators/current-user.decorator.ts
    ├── filters/http-exception.filter.ts
    ├── interceptors/logging.interceptor.ts
    └── pipes/validation.pipe.ts
```

### Infrastructure

```
docker-compose.yml
├── postgres:16        (port 5432)
├── redis:7            (port 6379 — rate limiting + session revocation)
├── backend (NestJS)   (port 3000)
├── frontend (Nginx)   (port 80/443)
└── pgadmin            (port 5050, dev only)
```

---

## PHASE 9 — API Design

### Authentication

| Method | URL | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Create account |
| `POST` | `/api/auth/login` | None | Login, returns access+refresh tokens |
| `POST` | `/api/auth/refresh` | Refresh token | Issue new access token |
| `POST` | `/api/auth/logout` | JWT | Revoke refresh token |

**POST /api/auth/register Request:**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "secure123", "weightKg": 65 }
```
**Response 201:**
```json
{ "accessToken": "...", "refreshToken": "...", "user": { "id": "uuid", "name": "Alice", "email": "..." } }
```

---

### User Profile

| Method | URL | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | JWT | Get current user + profile |
| `PATCH` | `/api/users/me/profile` | JWT | Update body metrics, step goal, gender |
| `DELETE` | `/api/users/me` | JWT | Soft-delete account |

---

### Activity Sessions

| Method | URL | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sessions` | JWT | Start a new session |
| `GET` | `/api/sessions` | JWT | List sessions (paginated) |
| `GET` | `/api/sessions/:id` | JWT | Get session detail |
| `PATCH` | `/api/sessions/:id` | JWT | Update session (pause status, live metrics) |
| `POST` | `/api/sessions/:id/complete` | JWT | Finalize session with summary |
| `DELETE` | `/api/sessions/:id` | JWT | Abandon/delete session |

**POST /api/sessions Request:**
```json
{ "activityType": "cycling", "startedAt": "2026-06-19T14:00:00Z" }
```

**POST /api/sessions/:id/complete Request:**
```json
{
  "endedAt": "2026-06-19T15:30:00Z",
  "durationSec": 5400,
  "steps": 0,
  "distanceKm": 42.2,
  "caloriesKcal": 1250,
  "maxSpeedKmh": 38.5,
  "avgSpeedKmh": 28.3,
  "elevationGainM": 320,
  "avgPowerWatts": 185
}
```

---

### GPS Points

| Method | URL | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sessions/:id/gps` | JWT | Batch append GPS points |
| `GET` | `/api/sessions/:id/gps` | JWT | Get full GPS route for a session |

**POST /api/sessions/:id/gps Request:**
```json
{
  "points": [
    { "lat": 48.8566, "lng": 2.3522, "altitudeM": 35.2, "speedMs": 4.2, "accuracyM": 5.0, "recordedAt": "..." }
  ]
}
```

---

### Cycling Segments & Power

| Method | URL | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sessions/:id/segments` | JWT | Record a 1km segment |
| `POST` | `/api/sessions/:id/power` | JWT | Batch append power samples |

---

### Statistics

| Method | URL | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stats/daily` | JWT | Today's summary (steps, dist, cal, time) |
| `GET` | `/api/stats/weekly` | JWT | Last 7 days per-day breakdown |
| `GET` | `/api/stats/monthly` | JWT | Last 30 days aggregation |
| `GET` | `/api/stats/streak` | JWT | Accurate consecutive-day streak |
| `GET` | `/api/stats/activity-breakdown` | JWT | Count + % by activity type |

**GET /api/stats/weekly Response:**
```json
{
  "days": [
    { "date": "2026-06-13", "steps": 8423, "distanceKm": 6.32, "caloriesKcal": 312 }
  ],
  "totals": { "steps": 52000, "distanceKm": 38.5, "caloriesKcal": 1980, "goalsMetCount": 4 }
}
```

---

### Achievements

| Method | URL | Auth | Description |
|---|---|---|---|
| `GET` | `/api/achievements` | JWT | All badges with earned status |
| `POST` | `/api/achievements/evaluate` | JWT | Re-evaluate + award new badges |

---

## PHASE 10 — Database Design

### ERD (textual)

```
users 1──1 user_profiles
users 1──N activity_sessions
users 1──N achievements
users 1──N refresh_tokens
activity_sessions N──1 activity_types
activity_sessions 1──N gps_points
activity_sessions 1──N cycling_segments
activity_sessions 1──N power_samples
```

### Key Indexes

```sql
CREATE INDEX sessions_user_started ON activity_sessions(user_id, started_at DESC);
CREATE INDEX gps_session_time ON gps_points(session_id, recorded_at);
CREATE INDEX power_session_time ON power_samples(session_id, recorded_at);
CREATE UNIQUE INDEX achievements_unique ON achievements(user_id, badge_key);
CREATE INDEX refresh_token_user ON refresh_tokens(user_id, expires_at);
```

### Audit Pattern

All mutable tables include `created_at` and `updated_at` TIMESTAMPTZ. A `pg_audit` extension or application-level `audit_logs` table will capture sensitive mutations (password change, account delete).

---

## PHASE 11 — Security Design

### Authentication

- **Access Token:** JWT, HS256, 15-minute expiry, payload: `{sub: userId, email, iat, exp}`
- **Refresh Token:** UUID stored as bcrypt hash in `refresh_tokens`; 30-day expiry; rotated on each use
- **Password Hashing:** bcrypt, cost factor 12
- **Demo Account:** Remove from production; seed only in dev/staging environments

### Authorization — RBAC

| Role | Permissions |
|---|---|
| `user` | Own data CRUD, own sessions, own profile |
| `admin` | All user data read, analytics aggregation, badge management |

Implemented via NestJS `@Roles()` decorator + `RolesGuard`.

### Security Controls

| Control | Implementation |
|---|---|
| XSS | React's JSX auto-escaping; Content-Security-Policy header |
| CSRF | Stateless JWT (no cookies by default); if cookies used → SameSite=Strict + CSRF token |
| SQL Injection | TypeORM parameterized queries only |
| Rate Limiting | `@nestjs/throttler` — 5 login attempts / 15 min per IP; Redis backend |
| CORS | Allowlist of frontend origins only |
| Helmet | Security headers (HSTS, X-Frame-Options, etc.) |
| Input Validation | `class-validator` on all DTOs; global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true` |
| GPS Data Privacy | GPS points only accessible to owning user; bulk delete on account deletion |
| Audit Logs | Logins, password changes, account deletes recorded with IP + timestamp |
| HTTPS | TLS termination at Nginx reverse proxy; Let's Encrypt |

---

## PHASE 12 — Test Strategy

### Unit Tests (Jest)

**Frontend (React Testing Library):**
- `LoginForm` — renders, validates empty, email format, submits
- `SignupForm` — password length, email uniqueness error display
- `StepRing` — correct % display, ring animation offset
- `PowerWidget` — correct watts display and zone label
- `calcPower()` domain function — known input/output pairs
- `calcCals()` — cycling MET formula, walking formula
- `powerZone()` — all 6 zone boundaries
- `haversine()` — known coordinate pairs
- `bmi()` — all 4 classification boundaries
- `useStepCounter` hook — mock DeviceMotion events, verify debounce
- `achievementService` — all 9 badge conditions

**Backend (Jest + Supertest):**
- `AuthService.register()` — duplicate email throws, bcrypt verified
- `AuthService.login()` — wrong password throws, returns tokens
- `ActivitiesService.complete()` — metrics persisted correctly
- `StatsService.weeklyStats()` — aggregation query correctness
- `AchievementsService.evaluate()` — all 9 badge triggers
- JWT guard — rejects expired/invalid tokens
- Rate limiting guard — blocks after 5 attempts

### Integration Tests (Testcontainers + PostgreSQL)

- Full auth flow: register → login → refresh → logout
- Session lifecycle: create → GPS append → complete → fetch
- Stats aggregation: seed 30 sessions → verify weekly/monthly totals
- Achievement unlock: seed history → evaluate → badge appears

### E2E Tests (Playwright)

- **Scenario 1:** New user registration → profile setup → start walk → stop → see history entry
- **Scenario 2:** Login → start cycling session → verify power widget → stop → verify segment in history
- **Scenario 3:** Profile BMI update → change weight → BMI card updates correctly
- **Scenario 4:** Achievement unlock — mock 10k step day → badge earned

### Coverage Targets

- Global: > 80%
- Business domain functions: > 95%
- API endpoints: 100% (at least one test per endpoint)

---

## PHASE 13 — Gap Analysis (Current vs. Target)

| Gap | Current | Target | Risk | Priority |
|---|---|---|---|---|
| **Password Security** | djb2 hash (non-cryptographic) | bcrypt cost-12 | 🔴 Critical | P0 |
| **Authentication** | localStorage session key | JWT + Refresh Token | 🔴 Critical | P0 |
| **Data Persistence** | Browser localStorage | PostgreSQL | 🔴 Critical | P0 |
| **Data Loss** | Cleared on browser reset | Server-persisted | 🔴 High | P0 |
| **Multi-device Sync** | None | REST API + server DB | 🟠 High | P1 |
| **Streak Calculation** | history.length (not date-aware) | Consecutive calendar days | 🟠 High | P1 |
| **GPS Route Storage** | Session memory only | Persisted to `gps_points` | 🟠 High | P1 |
| **Power Time-Series** | Avg only saved | Per-second `power_samples` | 🟡 Medium | P2 |
| **Elevation Model** | Max-Min delta (inaccurate) | Cumulative positive delta | 🟡 Medium | P2 |
| **Real Step Counter** | Client-side only | Edge-processed or server-validated | 🟡 Medium | P2 |
| **Offline Support** | Full (localStorage) | PWA service worker + sync queue | 🟡 Medium | P2 |
| **Charts** | Custom SVG/Canvas | Recharts (accessible, animated) | 🟢 Low | P3 |
| **Localization** | French hardcoded | i18n (fr + en minimum) | 🟢 Low | P3 |
| **Accessibility** | No ARIA labels | WCAG 2.1 AA compliance | 🟡 Medium | P2 |
| **Social features** | None | Future: challenges, leaderboards | 🟢 Low | P4 |

**Technical Debt:**
- ~850 lines of JavaScript with no separation of concerns
- DOM manipulation mixed with business logic
- Inline styles throughout (1,200+ instances)
- No TypeScript, no tests, no error boundaries
- No input sanitization

---

## PHASE 14 — Migration Roadmap

### Sprint 1 — Foundation (Days 1–6)
**Objectives:** Project setup, auth, DB
- Initialize Vite + React 19 + TypeScript + TailwindCSS
- Initialize NestJS + TypeORM + PostgreSQL
- Docker Compose (postgres, redis, backend, frontend)
- Implement `users`, `user_profiles`, `refresh_tokens` tables + migrations
- Auth module: register, login, refresh, logout
- JWT guards + RBAC guards
- Zustand `authStore` + login/signup forms
- GitHub Actions: lint + test pipeline

**Risk:** JWT/bcrypt integration complexity — Medium

---

### Sprint 2 — Core Activity Tracking (Days 7–14)
**Objectives:** Real-time session management
- `activity_sessions`, `activity_types` tables + migrations
- Sessions API (start, pause, complete, delete)
- GPS points API (batch POST + GET route)
- `useGpsTracker`, `useStepCounter`, `useSessionTimer` hooks
- `sessionStore` (Zustand)
- `TrackPage` + all track sub-components
- `calcPower`, `calcCals`, `haversine` domain functions (pure TS, unit tested)
- GPS Canvas route component (ported from source)
- Simulation fallback hook

**Risk:** iOS DeviceMotion permission flow — Medium

---

### Sprint 3 — Dashboard + Stats + History (Days 15–20)
**Objectives:** Analytics views
- Stats aggregation API (daily, weekly, monthly, streak)
- `StatsPage` with Recharts line + bar charts
- `DashboardPage` with step ring, weekly bar, KPI cards
- `HistoryPage` with paginated list
- `StepRing` component (SVG animated)
- `WeeklyChart` using Recharts
- React Query hooks for all stat endpoints

**Risk:** Recharts integration with dark theme — Low

---

### Sprint 4 — Profile + Achievements + Cycling (Days 21–28)
**Objectives:** Profile management, achievements, cycling-specific features
- `AchievementsService` backend — evaluate all 9 badges
- `achievements` table + API
- `cycling_segments`, `power_samples` tables + APIs
- `ProfilePage` — body sliders, BMI, gender, step goal
- `AchievementGrid` with earned/locked states
- `LiveSessionCycling` with PowerWidget + CyclingSegments
- `useCadenceDetector` hook
- Date-aware streak calculation (correct algorithm)
- Cumulative elevation gain (correct algorithm)

**Risk:** Real-time power streaming — Medium

---

### Sprint 5 — Polish, PWA, Security Hardening (Days 29–35)
**Objectives:** Production-readiness
- PWA service worker + offline sync queue
- Rate limiting (Redis + throttler)
- Helmet, CORS, CSP headers
- Audit logs table + interceptor
- WCAG 2.1 AA audit + ARIA labels
- i18n setup (fr/en)
- Loading states, error boundaries, toast notifications
- Performance optimization (React.memo, lazy routes)

**Risk:** Offline sync conflict resolution — High

---

### Sprint 6 — Testing + CI/CD (Days 36–42)
**Objectives:** Full test coverage, deployment pipeline
- Unit tests (frontend + backend) — target 80%+
- Integration tests (Testcontainers)
- E2E tests (Playwright, 4 scenarios)
- GitHub Actions: test → build → push Docker → deploy
- Staging environment validation
- Performance testing (k6)
- Security scan (npm audit, Snyk)

**Risk:** Testcontainers Windows environment — Low (CI runs Linux)

---

## PHASE 15 — Validation & Risk Assessment

> [!IMPORTANT]
> **CODE GENERATION IS BLOCKED** pending your explicit approval.
> No files have been modified or created in the workspace yet.

### Project Complexity & Development Estimates

| Metric | Detail |
|---|---|
| **Estimated Screens** | 6 (Auth, Dashboard, Track, Stats, History, Profile) |
| **Estimated React Components** | 38 components |
| **Estimated REST APIs** | 27 endpoints |
| **Estimated Database Tables** | 8 PostgreSQL tables |
| **Estimated Development Effort** | ~42 person-days |
| **Technical Complexity Score** | **6/10 (Moderate)** |

*Complexity rationale:* While the client-server CRUD operations are standard (score: 4/10), the application requires high-fidelity sensor data processing in the browser (DeviceMotion accelerometer peak analysis and low-pass filtering, Geolocation accuracy checks and Haversine geodesic integrations) and real-time cycling power estimation using physical drag/aerodynamics coefficients. This raises the score to 6/10.

---

### Risk Assessment & Mitigation Matrix

| Risk | Probability | Impact | Mitigation Strategy |
|---|---|---|---|
| **R1: iOS Sensor Permissions** | High | High | Explicitly handle the `DeviceMotionEvent.requestPermission()` API on user gesture before invoking the tracking stream. Provide clear guides in French and English inside the UI if permission is blocked. |
| **R2: GPS Noise & Battery Drain** | High | Medium | Store downsampled data (only when distance delta > 10m or every 5 seconds) to reduce network load and DB size. Implement browser-level location caching to sleep GPS when the user is idle. |
| **R3: DB Bottleneck on Timeseries** | Medium | Medium | Implement indexing on `(session_id, recorded_at)` and split timeseries tables (power samples, GPS points) from metadata. Plan for future automated partition pruning if size grows excessively. |
| **R4: Legacy Data Migration** | Medium | Low | Provide an import tool in the user Profile settings that reads the existing browser `localStorage` history structure, validates it, and posts it to `/api/sessions/import` to ensure no user data is lost. |
| **R5: Offline Data Sync Conflict** | Medium | Medium | Since offline synchronization has been postponed to a later phase (as per user decisions), this risk is eliminated in Sprint 1. |

---

### Recommended Migration Strategy

To minimize risk and maintain maximum visibility, we recommend a **Sprint-by-Sprint Migration Strategy**:
1. **Foundation First (Sprint 1):** Scaffolding the workspace, spinning up local containers, setting up database tables, and implementing secure credentials logic (bcrypt + JWT rotation).
2. **Core Feature Translation:** Lift the core sensor modules (Geolocation + DeviceMotion) and calorie/power computation engines into pure TypeScript helper modules, verifying them with Jest unit tests before integrating UI elements.
3. **UI Replacement:** Render individual pages (Dashboard, Stats) using the modern tech stack (Zustand, React Query, Recharts) and link them to the API.
4. **Data Sync Transition:** Replace original LocalStorage calls with API endpoints. Implement a legacy importer to seed DB records from user localStorage back-up.

---

### User Decisions & Scope Alignment

During the Validation Gate, the following decisions were aligned:
* **Sprint Scope:** Execute **Sprint-by-Sprint** starting with Sprint 1 (Foundation).
* **Offline Sync:** **Postponed** to a later phase.
* **GPS Granularity:** **Downsampled** (every 5 seconds or distance > 10 meters).
* **Charts:** Use **Recharts** library for maintainable, accessible visualizations.
* **Language:** Build with **English UI + i18n support** (French bundle included).
* **Social Features:** **None** in Phase 1 (stay purely personal tracking).

