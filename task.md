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

- [ ] Implement User Profile Management
  - [ ] CRUD API for user profiles
  - [ ] Frontend profile page with edit capabilities
- [ ] Workout Logging Feature
  - [ ] Design database schema for workouts
  - [ ] API endpoints to create/read workouts
  - [ ] Frontend UI for logging workouts
- [ ] Basic Dashboard
  - [ ] Summarize recent workouts
  - [ ] Visual charts for progress
- [ ] Integration Tests
  - [ ] End‑to‑end tests for new features
- [ ] CI/CD enhancements
  - [ ] Add linting for new code
  - [ ] Deploy preview environment for PRs

