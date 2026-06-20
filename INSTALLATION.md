# FitTrack Pro — Installation Guide

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | >= 20 | Required for both backend and frontend |
| Docker & Docker Compose | Latest | Required for local development with PostgreSQL and Redis |
| npm | >= 10 | Comes with Node.js |
| Git | Latest | To clone the repository |

---

## 1. Quick Start (Docker Compose — Recommended)

### 1.1 Clone & Configure

```bash
git clone https://github.com/fayeztekitek/fittrack-pro.git
cd fittrack-pro
```

### 1.2 Start All Services

```bash
docker compose up --build
```

This launches 5 containers:

| Container | Port | Purpose |
|-----------|------|---------|
| `fittrack-postgres` | 5432 | PostgreSQL 16 database |
| `fittrack-redis` | 6379 | Redis 7 cache |
| `fittrack-backend` | 3000 | NestJS API |
| `fittrack-frontend` | 80 | React PWA (served via nginx) |
| `fittrack-pgadmin` | 5050 | pgAdmin GUI |

Wait for the backend to print `FitTrack Pro backend listening on port 3000`.

### 1.3 Access the Application

| Interface | URL |
|-----------|-----|
| Frontend PWA | http://localhost |
| API (direct) | http://localhost:3000/api |
| Swagger Docs | http://localhost:3000/api/docs |
| pgAdmin | http://localhost:5050 (admin@fittrack.com / admin_password_123) |

### 1.4 Demo Account

Log in with:
- **Email:** `demo@fit.com`
- **Password:** `demo123`

---

## 2. Manual Setup (Without Docker)

### 2.1 Start Dependencies

You need PostgreSQL 16 and Redis 7 running locally.

**Using Docker for dependencies only:**

```bash
docker run -d --name fittrack-postgres -p 5432:5432 ^
  -e POSTGRES_USER=fittrack_user ^
  -e POSTGRES_PASSWORD=fittrack_password ^
  -e POSTGRES_DB=fittrack_db ^
  postgres:16-alpine

docker run -d --name fittrack-redis -p 6379:6379 redis:7-alpine
```

### 2.2 Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

The API starts on http://localhost:3000 with hot-reload enabled.

### 2.3 Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on http://localhost:5173 with hot-reload. The dev server proxies `/api` to `localhost:3000`.

---

## 3. Configuration

### 3.1 Environment Variables

Create a `.env` file at the project root (a default `.env` is already provided):

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=fittrack_user
DB_PASSWORD=fittrack_password
DB_NAME=fittrack_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (use strong secrets in production)
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=900s
JWT_REFRESH_EXPIRY=30d

# App
PORT=3000
NODE_ENV=development
```

### 3.2 Key Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend API port |
| `CORS_ORIGIN` | `*` | Comma-separated allowed origins |
| `NODE_ENV` | `development` | Enables TypeORM schema synchronization when set to `development` |

---

## 4. Running Tests

### 4.1 Backend Unit Tests

```bash
cd backend
npm test
```

Runs 23 unit tests across Auth, Activities, and Stats services.

### 4.2 Backend Integration Tests

Requires Docker (automatically starts PostgreSQL + Redis containers via Testcontainers):

```bash
cd backend
npm run test:integration
```

Runs 7 integration tests against real database and Redis.

### 4.3 Frontend E2E Tests

Requires both backend and frontend running:

```bash
cd frontend
npm run test:e2e
```

Runs Playwright tests on a simulated Pixel 5 device.

---

## 5. Building for Production

### 5.1 Backend

```bash
cd backend
npm run build  # Compiles to dist/
npm run start:prod
```

### 5.2 Frontend

```bash
cd frontend
npm run build  # Outputs to dist/ with PWA service worker + manifest
```

The frontend build produces:
- `dist/index.html` — Entry page
- `dist/assets/` — Bundled JS and CSS
- `dist/sw.js` — Service worker (Workbox)
- `dist/manifest.webmanifest` — PWA manifest
- `dist/icons/` — App icons

Serve with any static server or the included nginx configuration.

---

## 6. Architecture Overview

```
┌──────────┐     ┌──────────┐     ┌────────────┐
│  React   │────▶│  NestJS  │────▶│ PostgreSQL │
│  (PWA)   │     │   API    │     │    16      │
│ :5173/80 │     │  :3000   │     │   :5432    │
└──────────┘     └────┬─────┘     └────────────┘
                      │                 ▲
                      ▼                 │
                 ┌──────────┐     ┌─────┴──────┐
                 │   Redis  │     │   pgAdmin   │
                 │     7    │     │   :5050     │
                 └──────────┘     └────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS v4, Zustand, React Query, react-router, Recharts, Lucide icons |
| Backend | NestJS 10, TypeORM, PostgreSQL 16, Redis 7 (ioredis), JWT, bcrypt, Helmet, Throttler |
| PWA | vite-plugin-pwa, Workbox (NetworkFirst API cache, auto SW update) |
| Testing | Jest, Vitest, Playwright, Testcontainers, supertest |
| CI | GitHub Actions (lint → build → test → integration → e2e) |
