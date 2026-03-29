# Architecture

## Overview

The app is a monorepo with two independent services and a shared database:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│   MongoDB    │
│  Angular 21  │     │   NestJS     │     │   (Atlas)    │
│  Port 4200   │     │  Port 3000   │     │  Port 27017  │
└──────────────┘     └──────────────┘     └──────────────┘
     SPA              REST API              Document DB
```

- **Frontend** serves a single-page application, communicates with backend via REST
- **Backend** handles all business logic, auth, and database access
- **MongoDB** stores all persistent data (users, metrics, ratings, tasks, notes)

In production, nginx serves the frontend build and reverse-proxies `/api/` requests to the backend.

## Backend Modules

Each module is self-contained with its own controller, service, schema(s), and DTOs:

```
backend/src/
├── auth/          # Google OAuth 2.0 + JWT session management
│   ├── strategies/   # Passport strategies (Google, JWT)
│   ├── guards/       # Auth guards (GoogleAuthGuard, JwtAuthGuard)
│   └── schemas/      # User schema
├── metrics/       # Rating category hierarchy (CRUD + tree + seeding)
├── ratings/       # Daily scores (upsert per date, date range queries)
├── reports/       # Aggregated weekly/monthly reports, trend data
├── tasks/         # Task management (CRUD + reorder)
├── notes/         # Notes (CRUD with date/tag filtering)
└── common/        # Shared decorators (@CurrentUser) and filters
```

### Module Dependencies

```
auth ──────────────────────────────────────────────
metrics ───────────────────────────────────────────
ratings ───────────────────────────────────────────
reports ──▶ metrics + ratings  (reads both for aggregation)
tasks ─────────────────────────────────────────────
notes ─────────────────────────────────────────────
```

Only `reports` depends on other business modules. All others are independent.

## Frontend Structure

```
frontend/src/app/
├── core/
│   ├── auth/       # AuthService (signal-based), interceptor, guard
│   ├── api/        # HTTP services (metrics, ratings, reports, tasks, notes)
│   └── models/     # TypeScript interfaces
├── features/       # Lazy-loaded standalone components
│   ├── auth/          # Login page, OAuth callback
│   ├── daily-rating/  # Main page: rate metrics for a day
│   ├── reports/       # Weekly/monthly aggregated reports
│   ├── tasks/         # Task manager
│   ├── notes/         # Notes
│   └── settings/      # Metrics hierarchy editor, profile
└── shared/         # Reusable UI components
```

### Key Patterns

- **Standalone components** — no NgModules, each component declares its own imports
- **Signal-based state** — `signal()`, `computed()` for reactive state instead of RxJS subjects
- **Lazy loading** — all feature routes are lazy-loaded via `loadComponent`
- **`inject()` function** — used instead of constructor injection
- **`input()` / `output()`** — signal-based component I/O

## Auth Flow

```
1. User clicks "Sign in with Google"
2. Frontend redirects to GET /api/auth/google
3. Backend redirects to Google OAuth consent screen
4. Google redirects back to GET /api/auth/google/callback
5. Backend upserts user in DB, generates JWT
6. Backend redirects to frontend: /auth/callback?token=<jwt>
7. Frontend stores JWT in localStorage
8. All subsequent API calls include Authorization: Bearer <jwt>
```

## Data Flow: Daily Ratings

```
1. Page loads → fetch metrics tree + ratings for selected date
2. User taps a rating (1-5) for a metric
3. Score map updates (signal), overall score recomputes (computed)
4. Auto-save triggers after 500ms debounce
5. PUT /api/ratings/:date with all scores
6. Backend upserts the rating document (one per user per day)
```

## Data Flow: Reports

```
1. User selects period (week / month)
2. Frontend calls GET /api/reports/weekly or /monthly
3. Backend fetches metrics tree + all ratings in range
4. For each day: computes group averages via recursive weighted mean
5. Averages group scores across all days in range
6. Returns: overall average, per-group averages, per-metric averages
```
