# API Reference

Base URL: `/api`

All endpoints except auth return responses in the format:

```json
{
  "data": { ... },
  "message": "optional error message"
}
```

Authentication: `Authorization: Bearer <jwt>` header (required for all endpoints except auth).

---

## Auth

### `GET /api/auth/google`

Redirects to Google OAuth 2.0 consent screen. No body or params needed.

### `GET /api/auth/google/callback`

OAuth callback. Google redirects here after user consents. Backend creates/updates the user, generates a JWT, and redirects to:

```
{FRONTEND_URL}/auth/callback?token={jwt}
```

### `GET /api/auth/me`

Returns the current authenticated user's profile.

**Response:**

```json
{
  "data": {
    "_id": "665a1b...",
    "googleId": "1234567890",
    "email": "user@gmail.com",
    "name": "John Doe",
    "avatar": "https://lh3.googleusercontent.com/..."
  }
}
```

---

## Metrics

### `GET /api/metrics`

Returns the full metrics tree for the current user (only active metrics).

**Response:**

```json
{
  "data": [
    {
      "_id": "665a...",
      "name": "Productivity",
      "slug": "productivity",
      "type": "group",
      "weight": 1,
      "order": 0,
      "isActive": true,
      "children": [
        {
          "_id": "665b...",
          "name": "Work",
          "slug": "work",
          "type": "rating",
          "weight": 1,
          "order": 0,
          "isActive": true,
          "children": []
        }
      ]
    }
  ]
}
```

### `POST /api/metrics`

Creates a new metric or group.

**Body:**

```json
{
  "name": "Exercise",
  "slug": "exercise",
  "type": "rating",
  "parentId": "665a...",
  "weight": 1,
  "order": 2,
  "description": "Optional hint text"
}
```

Required: `name`, `slug`, `type`. Optional: `parentId`, `weight`, `order`, `description`.

### `PATCH /api/metrics/:id`

Updates a metric's properties (name, weight, parent, order, isActive).

**Body** (all fields optional):

```json
{
  "name": "New Name",
  "weight": 2,
  "parentId": "665a...",
  "order": 3,
  "isActive": false
}
```

### `DELETE /api/metrics/:id`

Soft-deletes a metric (sets `isActive: false`). Historical data is preserved.

### `POST /api/metrics/reorder`

Batch update order and parent for multiple metrics.

**Body:**

```json
{
  "items": [
    { "id": "665a...", "order": 0, "parentId": null },
    { "id": "665b...", "order": 1, "parentId": "665a..." }
  ]
}
```

### `POST /api/metrics/seed`

Creates the default metrics hierarchy for a new user. If metrics already exist, returns the current tree without changes.

---

## Ratings

### `GET /api/ratings/:date`

Get ratings for a specific date. Date format: `YYYY-MM-DD`.

**Response:**

```json
{
  "data": {
    "_id": "665c...",
    "date": "2026-03-29",
    "scores": [
      { "metricId": "665a...", "value": 4 },
      { "metricId": "665b...", "value": 3 }
    ]
  }
}
```

Returns `{ "data": null }` if no ratings exist for that date.

### `GET /api/ratings?from=YYYY-MM-DD&to=YYYY-MM-DD`

Get ratings for a date range (inclusive).

**Response:**

```json
{
  "data": [
    { "_id": "...", "date": "2026-03-28", "scores": [...] },
    { "_id": "...", "date": "2026-03-29", "scores": [...] }
  ]
}
```

### `PUT /api/ratings/:date`

Create or update ratings for a date. Replaces all scores for that day.

**Body:**

```json
{
  "scores": [
    { "metricId": "665a...", "value": 4 },
    { "metricId": "665b...", "value": 5 }
  ]
}
```

Each `value` must be between 1 and 5. Only leaf-level metrics (type `rating`) should be included.

---

## Reports

### `GET /api/reports/weekly?date=YYYY-MM-DD`

Weekly report for the week containing the given date (Monday–Sunday).

**Response:**

```json
{
  "data": {
    "overall": 3.8,
    "groups": [
      { "metricId": "665a...", "name": "Productivity", "slug": "productivity", "average": 4.2, "count": 5 }
    ],
    "metrics": [
      { "metricId": "665b...", "name": "Work", "slug": "work", "average": 4.0, "count": 5 }
    ],
    "daysWithData": 5,
    "totalDays": 7
  }
}
```

### `GET /api/reports/monthly?month=3&year=2026`

Monthly report. Same response shape as weekly.

### `GET /api/reports/trend?from=YYYY-MM-DD&to=YYYY-MM-DD`

Daily trend data for the given range.

**Response:**

```json
{
  "data": [
    {
      "date": "2026-03-28",
      "overall": 3.6,
      "groups": {
        "productivity": 4.0,
        "brain-rot": 3.0,
        "health": null
      }
    }
  ]
}
```

`null` means no data for that group on that day.

---

## Tasks

### `GET /api/tasks`

List all tasks. Supports optional query filters:
- `?status=done` — filter by status (`not_started`, `in_progress`, `done`)
- `?priority=high` — filter by priority (`high`, `medium`, `low`)
- `?tag=work` — filter by tag

### `POST /api/tasks`

**Body:**

```json
{
  "title": "Buy groceries",
  "description": "Optional description",
  "status": "not_started",
  "priority": "medium",
  "deadline": "2026-04-01",
  "tags": ["personal"]
}
```

Required: `title`. All other fields are optional.

### `PATCH /api/tasks/:id`

Update any task fields. Same shape as create body, all fields optional.

### `DELETE /api/tasks/:id`

Permanently deletes a task.

### `POST /api/tasks/reorder`

**Body:**

```json
{
  "items": [
    { "id": "665d...", "order": 0 },
    { "id": "665e...", "order": 1 }
  ]
}
```

---

## Notes

### `GET /api/notes`

List all notes. Supports optional query filters:
- `?from=YYYY-MM-DD&to=YYYY-MM-DD` — date range
- `?tag=ideas` — filter by tag

### `POST /api/notes`

**Body:**

```json
{
  "text": "Had a productive day today",
  "date": "2026-03-29",
  "tags": ["reflection"]
}
```

Required: `text`, `date`. Optional: `tags`.

### `PATCH /api/notes/:id`

Update note fields. All fields optional.

### `DELETE /api/notes/:id`

Permanently deletes a note.

---

## Error Responses

All errors follow the same format:

```json
{
  "data": null,
  "message": "Error description"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error (invalid input) |
| 401 | Not authenticated (missing or invalid JWT) |
| 403 | Forbidden |
| 404 | Resource not found |
| 500 | Internal server error |
