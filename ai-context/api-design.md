# API Design

Base URL: `/api`

All endpoints (except auth) require JWT Bearer token.

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Redirect to Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback, returns JWT |
| GET | `/api/auth/me` | Get current user profile |

## Metrics (Rating Categories)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics` | Get full metrics tree for current user |
| POST | `/api/metrics` | Create a new metric/group |
| PATCH | `/api/metrics/:id` | Update metric (name, weight, parent, order) |
| DELETE | `/api/metrics/:id` | Soft-delete (set isActive: false) |
| POST | `/api/metrics/reorder` | Batch update order/parent |
| POST | `/api/metrics/seed` | Create default metrics set for new user |

## Ratings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ratings/:date` | Get ratings for a specific date (YYYY-MM-DD) |
| PUT | `/api/ratings/:date` | Create or update ratings for a date |
| GET | `/api/ratings?from=&to=` | Get ratings for a date range |

## Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/weekly?date=` | Weekly report (week containing the date) |
| GET | `/api/reports/monthly?month=&year=` | Monthly report |
| GET | `/api/reports/trend?from=&to=&group=` | Trend data for charts |

## Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks (supports ?status=&priority=&tag=) |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/reorder` | Batch update order |

## Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | List notes (supports ?from=&to=&tag=) |
| POST | `/api/notes` | Create note |
| PATCH | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

## Response Format

All responses follow:
```json
{
  "data": { ... },
  "message": "string (optional, for errors)"
}
```

## Error Codes
- 400 — Validation error
- 401 — Not authenticated
- 403 — Forbidden
- 404 — Not found
- 500 — Server error
