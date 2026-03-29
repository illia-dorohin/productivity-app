# Setup Guide

## Prerequisites

- **Node.js 22+** — [download](https://nodejs.org/)
- **Docker & Docker Compose** — [download](https://docs.docker.com/get-docker/)
- **Google OAuth credentials** — [create](https://console.cloud.google.com/apis/credentials)

## Quick Start (Docker)

The fastest way to run everything locally:

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Fill in your credentials (see Environment Variables below)
nano .env

# 3. Start all services
docker compose up
```

This starts:
- **Frontend** at `http://localhost:4200`
- **Backend** at `http://localhost:3000`
- **MongoDB** at `localhost:27017`

Source code is bind-mounted for hot reload — changes to `backend/src/` and `frontend/src/` are picked up automatically.

## Manual Setup (without Docker)

### Backend

```bash
cd backend
npm install
npm run start:dev
```

The backend requires a running MongoDB instance. Either:
- Start one via Docker: `docker run -d -p 27017:27017 mongo:7`
- Or point `MONGODB_URI` to a MongoDB Atlas cluster

### Frontend

```bash
cd frontend
npm install
npx ng serve
```

The dev server runs at `http://localhost:4200` and proxies API requests based on the `environment.ts` config.

## Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret | `GOCSPX-...` |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI (must match Google Console) | `http://localhost:3000/api/auth/google/callback` |
| `JWT_SECRET` | Secret key for signing JWT tokens | Any random string, 32+ chars |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/productivity` |
| `FRONTEND_URL` | Frontend origin (for OAuth redirect and CORS) | `http://localhost:4200` |
| `PORT` | Backend server port | `3000` |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
4. Copy the Client ID and Client Secret to your `.env`

## Useful Commands

```bash
# Rebuild containers after dependency changes
docker compose up --build

# View backend logs
docker compose logs -f backend

# Shell into a container
docker compose exec backend sh

# Stop and clean everything
docker compose down -v

# Backend type-check
cd backend && npx tsc --noEmit

# Frontend production build
cd frontend && npx ng build
```
