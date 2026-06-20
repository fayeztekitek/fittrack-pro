# Sprint 1 — Foundation Checklist

- [x] Project Scaffolding
  - [x] Initialize frontend with Vite (React + TS + TailwindCSS)
  - [x] Initialize backend with NestJS + TypeORM + PostgreSQL
  - [x] Set up root Docker Compose configuration (PostgreSQL, Redis, backend, frontend)
  - [x] Set up GitHub Actions CI workflow (lint, test, build)
- [x] Database Schema & Migrations
  - [x] Design and implement PostgreSQL schema for Users, UserProfiles, RefreshTokens
  - [x] Run database migrations (auto-sync in NestJS development container)
- [x] Backend Authentication Module
  - [x] Implement user registration (bcrypt password hashing, profile creation)
  - [x] Implement login (credentials validation, token generation)
  - [x] Implement refresh token rotation (revoke old tokens on rotation)
  - [x] Implement logout (revoke tokens)
  - [x] Implement JWT strategy and Guard
  - [x] Implement RBAC authorization (User and Admin roles)
- [x] Frontend Authentication State & UI
  - [x] Create Zustand `authStore` to handle JWT, token refresh, and currentUser state
  - [x] Implement basic i18n structure (support English and French strings)
  - [x] Build Login & Signup pages (mobile-first, styled with TailwindCSS)
- [x] Verification & Tests
  - [x] Write backend unit tests for auth endpoints (6 tests passing)
  - [x] Write frontend unit tests for Auth pages (9 tests passing)
  - [x] Verify Docker services orchestration (5 services configured)

# Sprint 2 — Next Phase

- [x] Implement User Profile Management
  - [x] CRUD API for user profiles (GET /users/me, PATCH /users/me/profile)
  - [x] Frontend profile page with edit capabilities (BMI, sliders, gender, goal, achievements)
- [x] Workout Logging Feature
  - [x] Design database schema for workouts (Activity entity with segments, GPS, achievements)
  - [x] API endpoints to create/read workouts (8 endpoints: start, stop, list, GPS, segments, achievements)
  - [x] Frontend UI for logging workouts (TrackingPage with GPS, step counter, power, cadence, simulation)
- [x] Basic Dashboard
  - [x] Summarize recent workouts (step ring, daily KPIs, weekly summary cards)
  - [x] Visual charts for progress (weekly bar chart, SVG line chart, calories bar chart, breakdown)
- [x] Integration Tests
  - [x] Backend unit tests for StatsService (6 tests added, 23 total)
  - [x] End‑to‑end tests (Playwright configured: auth flow + navigation scenarios)
- [x] CI/CD enhancements
  - [x] Add linting for new code (lint steps added for both stacks in CI)
  - [x] Add E2E test step to CI (Playwright Chromium)
  - [ ] Deploy preview environment for PRs (not configured)

# Sprint 3 — Polish & Infrastructure

- [x] React Query Integration
  - [x] Wrap app with QueryClientProvider
  - [x] Create useActivitiesQuery hook
  - [x] Create useProfileQuery + useUpdateProfileMutation hooks
  - [x] Create useAchievementsQuery hook
  - [x] Refactor DashboardPage, StatsPage, HistoryPage, ProfilePage to use React Query
- [x] Error Boundaries
  - [x] Create ErrorBoundary component with retry logic
  - [x] Wrap page routes with ErrorBoundary
- [x] Toast Notifications
  - [x] Add toast state management to uiStore
  - [x] Create ToastContainer component
  - [x] Auto-dismiss after 4 seconds
  - [x] 4 types: success, error, info, warning

# Sprint 4 — Profile Persistence, Achievements & Activity Completion

- [x] Profile Save to Backend
  - [x] Add save button with loading state
  - [x] Wire useUpdateProfileMutation to PATCH endpoint
  - [x] Toast feedback on success/error
  - [x] "Unsaved changes" indicator when dirty
  - [x] Button disabled when no changes or saving
- [x] All 10 Badges Always Visible
  - [x] Static ALL_BADGES definitions in AchievementGrid
  - [x] Merge with backend results (earned + progress)
  - [x] Locked emoji for unearned badges
  - [x] Progress bars for in-progress badges
- [x] Post-Activity Summary Modal
  - [x] Full-screen overlay on activity stop
  - [x] Duration, Distance, Calories, Speed, Steps
  - [x] Cycling-specific: Power (avg), Cadence (RPM)
  - [x] "View in History" button navigates to /history
- [x] Cadence RPM Display (already existed in cycling metrics grid)

# Sprint 5 — PWA, Security, i18n & Audit

- [x] Progressive Web App
  - [x] Install vite-plugin-pwa with Workbox
  - [x] Service worker with 13 precached entries
  - [x] Web app manifest (manifest.webmanifest)
  - [x] SVG icons (192×192, 512×512)
  - [x] Offline page (offline.html)
  - [x] API runtime caching (NetworkFirst, 24h TTL)
  - [x] PWA meta tags in index.html
- [x] Redis Module
  - [x] Global RedisModule with ioredis client
  - [x] lazyConnect for graceful degradation
  - [x] Inject REDIS_CLIENT across the app
- [x] Throttler v6 Upgrade
  - [x] Updated API syntax (throttlers array)
  - [x] Backward-compatible (memory storage)
- [x] i18n Completion
  - [x] Track summary section (EN + FR)
  - [x] Profile section (save, saving, saved, unsaved)
  - [x] History section (empty, emptyHint, sessions)
  - [x] Common section (loading, error, retry, units)
- [x] WCAG 2.1 AA Accessibility
  - [x] Semantic HTML landmarks (header, main, footer)
  - [x] aria-label on language toggle and logout
  - [x] aria-hidden on decorative elements
  - [x] aria-live="polite" on dynamic content
- [x] Audit Logging
  - [x] AuditModule (global)
  - [x] AuditService with structured JSON output
  - [x] Auth audit: register, login, logout
  - [x] Activity audit: start, stop

# Sprint 6 — Quality, Testing & Performance

- [x] Fix broken unit tests (AuditService mocks)
  - [x] auth.service.spec.ts — add mock AuditService provider
  - [x] activities.service.spec.ts — add mock AuditService provider
  - [x] All 23 unit tests pass
- [x] E2E Test Expansion
  - [x] history.spec.ts — heading, sessions count, activity cards
  - [x] stats.spec.ts — heading, period toggle, chart sections, week/month switch
  - [x] profile.spec.ts — heading, achievements, body data, sliders, gender, step goal, save
  - [x] i18n.spec.ts — default English, switch to French, toggle back
  - [x] tracking.spec.ts — heading, start button, activity types, simulation toggle, GPS status
  - [x] Fixed existing navigation.spec.ts (button role, "Log In" vs "sign in")
  - [x] Fixed existing auth.spec.ts (button role, "Log In" vs "sign in")
- [x] Integration Tests with Testcontainers
  - [x] Backend test/integration/ directory structure
  - [x] IntegrationSetup class: PostgreSQL + Redis container lifecycle
  - [x] auth.integration-spec.ts — register / duplicate / login / wrong password / non-existent email / refresh / invalid token
  - [x] test:integration npm script with --forceExit
  - [x] All 7 integration tests pass against real PostgreSQL + Redis
- [x] k6 Performance Testing
  - [x] k6/auth.js — register + login + refresh ramp-up (50 VUs)
  - [x] k6/activities.js — start + stop activity ramp-up (20 VUs)
  - [x] k6/stats.js — all stats endpoints ramp-up (100 VUs)
- [x] GitHub Actions CI
  - [x] lint job (backend + frontend)
  - [x] build job (backend + frontend)
  - [x] unit job (Jest + Vitest)
  - [x] integration job (Testcontainers with Docker)
  - [x] e2e job (Playwright with service containers)

