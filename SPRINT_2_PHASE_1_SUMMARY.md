# Sprint 2 — Phase 1: Activity Tracking Database & API

**Status:** ✅ COMPLETE (Database & NestJS Service Layer)  
**Date:** 2026-06-20  
**Tests:** 17/17 passing (11 new, 6 existing)

---

## 📋 What Was Implemented

### 1. Domain Entities (4 TypeORM Classes)

#### Activity Entity
```typescript
- id (UUID, primary key)
- userId (foreign key)
- type (enum: walking, fast_walking, running, cycling)
- startedAt, endedAt (timestamps)
- durationSeconds, distanceKm, caloriesBurned, totalSteps
- maxSpeedKmh, avgSpeedKmh, elevationGainM
- maxHeartRate, avgHeartRate (optional)
- avgPowerWatts, maxPowerWatts, avgCadenceRpm (cycling-specific)
- metadata (JSON for extensibility)
- relations: segments[], gpsPoints[]
```

**Methods:**
- `calculateCaloriesBurned(weight, type, duration)` — MET-based formula
- `calculateAvgSpeed()` — derived metric
- `estimateElevationGain()` — from GPS trace

#### ActivitySegment Entity
```typescript
- id (UUID, primary key)
- activityId (foreign key)
- segmentNumber (1-indexed for 1km splits)
- durationSeconds, distanceKm, avgSpeedKmh
- avgPowerWatts, maxPowerWatts, avgCadenceRpm
- caloriesBurned, elevationGainM
- startedAt, endedAt
```

**Methods:**
- `calculatePace()` — returns formatted mm:ss per km

#### GPSPoint Entity
```typescript
- id (UUID, primary key)
- activityId (foreign key)
- latitude, longitude (decimal 10,7)
- elevationM, speedKmh, accuracyM, bearingDegrees (optional)
- timestamp
```

**Methods:**
- `distanceTo(other)` — haversine calculation (geodesic distance)

#### Achievement Entity
```typescript
- id (UUID, primary key)
- userId (foreign key)
- badge (enum: 10 badge types)
- displayName, description, tier
- progressPercent, earnedAt (timestamp)
```

**Badge Types:**
1. First Run
2. Distance 5KM
3. Distance 10KM
4. Distance 50KM
5. Century Ride (100 miles cycling)
6. Speed Demon (15+ km/h)
7. Power Beast (400W+ cycling)
8. Streak 7 Days
9. Calories Burn 500
10. Cycling Master (1000km)

**Methods:**
- `isEarned()` — boolean check
- `getEmoji()` — display icon

---

### 2. Database Relationships

```
User (1) ──────→ (many) Activity
User (1) ──────→ (many) Achievement
Activity (1) ──→ (many) ActivitySegment
Activity (1) ──→ (many) GPSPoint
```

**Indexes:**
- `activities(userId, createdAt)`
- `activities(userId, startedAt)`
- `activity_segments(activityId, segmentNumber)`
- `gps_points(activityId, timestamp)`
- `gps_points(latitude, longitude)` — spatial queries
- `achievements(userId, earnedAt)`

---

### 3. ActivitiesService (Domain Logic Layer)

**Core Methods:**

| Method | Purpose | Formula/Logic |
|--------|---------|---|
| `startActivity()` | Initialize session | Create Activity with default metrics |
| `stopActivity()` | Finalize metrics | Save endedAt, compute final values |
| `getActivity()` | Fetch with auth | Load relations + authorize user |
| `getUserActivities()` | Paginated list | Filters: type, date range, pagination |
| `submitGPSPoints()` | Batch GPS | Max 50 points/batch (prevent queue flooding) |
| `getActivityGPSTrace()` | Complete route | Sorted by timestamp |
| `recordSegment()` | 1km splits | For cycling: track power/cadence per km |

**Physics & Calculations:**

| Calculation | Formula | Usage |
|---|---|---|
| **Cycling Power (Watts)** | `P = (Crr·m·g + 0.5·Cd·A·ρ·v²) × v` | Live wattage, power zones |
| **Power Zone (1-6)** | `% of FTP = watts / (weight × 3.5)` | Training zone classification |
| **MET Calories** | `kcal = MET × weight × hours` | Activity-type dependent |
| **Elevation Gain** | Sum of positive altitude deltas | From GPS points |
| **Distance from Steps** | `km = steps × 0.75m / 1000` | Fallback when no GPS |
| **Pace** | `min/km = 60 / speed_kmh` | Performance metric |

**Achievement Evaluation:**
- Runs automatically on activity completion
- Checks 10 conditions (totals, records, streaks)
- Awards new badges + updates progress

---

### 4. REST API Endpoints (7 endpoints)

| Method | Endpoint | Purpose | Protected |
|--------|----------|---------|-----------|
| POST | `/activities/start` | Begin session | ✅ JWT Guard |
| PATCH | `/activities/:id/stop` | End & save session | ✅ JWT Guard |
| GET | `/activities/:id` | Fetch single | ✅ JWT + Auth check |
| GET | `/activities` | List (paginated) | ✅ JWT Guard |
| POST | `/activities/:id/gps-points` | Batch GPS submit | ✅ JWT Guard |
| GET | `/activities/:id/gps-trace` | Full GPS route | ✅ JWT Guard |
| POST | `/activities/:id/segments` | Record 1km split | ✅ JWT Guard |
| GET | `/activities/achievements/list` | User's badges | ✅ JWT Guard |

**Query Parameters (Filters):**
```
GET /activities?take=20&skip=0&type=running&fromDate=2024-06-01&toDate=2024-06-30
```

---

### 5. Data Transfer Objects (DTOs)

**StartActivityDto**
- `type` (enum) — activity type
- `elevationStartM?` (optional)
- `notes?` (optional)

**StopActivityDto**
- `durationSeconds` (required)
- `distanceKm` (required)
- `caloriesBurned` (required)
- `totalSteps` (required)
- `maxSpeedKmh`, `avgSpeedKmh` (required)
- `elevationGainM?`, `maxHeartRate?`, `avgHeartRate?` (optional)
- `avgPowerWatts?`, `maxPowerWatts?`, `avgCadenceRpm?` (cycling-specific, optional)
- `metadata?` (JSON)

**BatchGPSPointsDto**
- `points[]` — array of GPS coordinates with timestamp

**GPSPointDto**
- `latitude`, `longitude` (required, validated ±90/±180)
- `elevationM?`, `speedKmh?`, `accuracyM?`, `bearingDegrees?`
- `timestamp` (ISO8601, required)

---

### 6. Module Integration

**ActivitiesModule** exports:
- ActivitiesService (service layer)
- ActivitiesController (API layer)
- 4 entities (TypeORM integration)

**AppModule** imports:
- ActivitiesModule (alongside AuthModule, UsersModule)

---

## ✅ Verification & Testing

### Test Coverage (11 new tests)

```
ActivitiesService
  ├─ startActivity
  │   └─ ✅ should create and save a new activity
  ├─ calculateCyclingPower
  │   ├─ ✅ should calculate cycling power correctly
  │   └─ ✅ should return 0 for zero speed
  ├─ getPowerZone
  │   ├─ ✅ should classify power into correct zone
  │   ├─ ✅ should classify recovery zone correctly
  │   └─ ✅ should classify anaerobic zone correctly
  └─ calculateCaloriesMET
      ├─ ✅ should calculate calories correctly for running
      ├─ ✅ should calculate calories correctly for walking
      └─ ✅ should calculate for partial hours
  └─ estimateDistanceFromSteps
      ├─ ✅ should estimate distance from steps
      └─ ✅ should return 0 for 0 steps
```

**Test Framework:** Jest + TypeORM Test Repositories  
**Mocking:** Repository mocks for isolation  
**Total Tests:** 17/17 passing ✅

### Build Verification
```bash
npm run build  # ✅ Compiles without errors
npm test       # ✅ 17 tests pass (11 new + 6 existing)
```

---

## 🎯 Key Design Decisions

### 1. **Batch GPS Submission**
- Frontend sends 50 points/batch to prevent queue overflow
- Backend validates each point (lat/lng bounds, timestamp)
- Indexed by `(activityId, timestamp)` for fast retrieval

### 2. **Auto-Achievement Evaluation**
- Triggered on activity completion (no extra API call)
- Evaluates all 10 badge conditions efficiently
- Prevents duplicates via `@Unique(['userId', 'badge'])`

### 3. **Cycling-Specific Fields**
- Optional: `avgPowerWatts`, `maxPowerWatts`, `avgCadenceRpm`
- Only populated for `type: ActivityType.CYCLING`
- Fallback to NULL for walking/running

### 4. **Metadata JSON Field**
- Extensibility: weather, temperature, notes, etc.
- Prevents schema changes for one-off fields
- Queryable via PostgreSQL `@>` operator if needed

### 5. **Haversine Distance in Entity**
- `GPSPoint.distanceTo()` — accurate geodesic distance
- Used by client for real-time distance calculation
- Accounts for Earth's curvature (radius = 6,371 km)

### 6. **MET-Based Calories**
- Activity-specific MET values (e.g., running = 9.8)
- Formula: `kcal = MET × weight_kg × duration_hours`
- More accurate than distance-based estimates

---

## 📊 Performance Characteristics

| Operation | Complexity | Optimization |
|-----------|-----------|---|
| List activities | O(n) with limit | Indexed on userId+createdAt |
| Find activity | O(1) | Primary key lookup |
| Add GPS points | O(m) | Batch insert (50 points) |
| Award achievement | O(10) | 10 checks, unique constraint |
| Calculate power | O(1) | Single formula evaluation |
| Elevation gain | O(n) | Requires full GPS trace load |

---

## 🔄 Data Flow Example

### Typical Cycling Session

```
1. User starts activity
   POST /activities/start → { type: 'cycling' }
   Returns: { id: 'act-123', startedAt: '2024-06-20T08:00:00Z', ... }

2. Every 30s, client batches GPS + metrics
   POST /activities/act-123/gps-points
   { points: [ { lat: 40.7128, lng: -74.0060, elevation: 10, timestamp: '...' }, ... ] }

3. Every 1km, record segment (cycling)
   POST /activities/act-123/segments
   { segmentNumber: 1, durationSeconds: 600, distanceKm: 1.0, avgSpeedKmh: 6.0, ... }

4. User stops activity
   PATCH /activities/act-123/stop
   { durationSeconds: 3600, distanceKm: 10.5, caloriesBurned: 520, ... }
   Returns: Activity with endedAt, final metrics, segments[], gpsPoints[]

5. System awards achievements
   Evaluates badges: [distance_5km, distance_10km, century_ride, power_beast, ...]
   Updates: Achievement records with earnedAt = now()

6. User views achievement list
   GET /activities/achievements/list
   Returns: [ { badge: 'distance_10km', earnedAt: '...', displayName: '10K Runner', emoji: '🎯' }, ... ]
```

---

## 🚀 Ready for Phase 2

**Frontend Implementation (Days 4-7):**
- React hooks: `useGpsTracker()`, `useStepCounter()`, `useCyclingPower()`
- Components: Dashboard, TrackingPage, ActivityMap, StatisticsPage
- Integration with existing auth store + API calls

**Database Migrations:**
- TypeORM `synchronize: true` in development handles entity creation
- Production: manual migrations via `npm run migration:generate`

---

## 📝 Files Created/Modified

### New Files (14)
```
backend/src/modules/activities/
├── entities/
│   ├── activity.entity.ts (110 lines)
│   ├── activity-segment.entity.ts (60 lines)
│   ├── gps-point.entity.ts (70 lines)
│   └── achievement.entity.ts (90 lines)
├── dto/
│   ├── activity.dto.ts (70 lines)
│   └── gps.dto.ts (60 lines)
├── activities.service.ts (500+ lines, domain logic)
├── activities.service.spec.ts (150+ lines, 11 tests)
├── activities.controller.ts (130+ lines, 8 endpoints)
└── activities.module.ts (25 lines)
```

### Modified Files (2)
```
backend/src/
├── app.module.ts (+1 import, +1 module in imports)
└── modules/users/entities/user.entity.ts (+2 OneToMany relations)
```

---

## 🎬 Next: Phase 2 (Frontend Implementation)

**When:** Ready to start immediately  
**Duration:** ~4-5 days  
**Deliverables:**
1. Custom React hooks for sensor APIs (GPS, accelerometer, step counting)
2. Live tracking components with real-time UI updates
3. Canvas GPS map rendering
4. Statistics & achievement dashboards
5. E2E integration tests

Would you like me to **begin Phase 2 now** with frontend implementation? 🚀
