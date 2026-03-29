# Productivity App

Personal daily productivity tracker with self-assessment ratings, hierarchical metric groups, reports, task management, and notes.

## Features

- **Daily Ratings** — rate yourself 1-5 across customizable categories
- **Hierarchical Metrics** — categories grouped into weighted groups (Productivity, Brain Rot, Health, Mental Health, Relationships)
- **Weekly & Monthly Reports** — aggregated scores with trend charts, radar charts, and heatmap calendar
- **Task Manager** — flexible tasks with statuses, priorities, deadlines, and tags
- **Notes** — simple notes with dates and tags
- **Admin Panel** — manage metric hierarchy, weights, and categories
- **Google Auth** — sign in with Google
- **Responsive** — mobile-first design with liquid glass UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21 |
| Backend | NestJS |
| Database | MongoDB (Atlas) |
| Auth | Google OAuth 2.0 + JWT |
| Deploy | Docker + Railway |

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose

### Local Development

```bash
# Clone the repo
git clone <repo-url>
cd productivity-app

# Start all services (frontend + backend + MongoDB)
docker compose up

# Or run individually:
cd backend && npm install && npm run start:dev
cd frontend && npm install && ng serve
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=
MONGODB_URI=
```

## Project Structure

```
productivity-app/
├── frontend/          # Angular 21 SPA
├── backend/           # NestJS API
├── docs/              # Project documentation
├── ai-context/        # AI agent context (not runtime)
├── docker-compose.yml
└── README.md
```

See [docs/](./docs/) for detailed documentation.

## Documentation

- [Setup Guide](./docs/setup.md)
- [API Reference](./docs/api.md)
- [Architecture](./docs/architecture.md)
- [Deployment](./docs/deployment.md)

## License

Private project.
