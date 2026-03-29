# Deployment

## Architecture

Production deployment uses:
- **Railway** — hosting for backend and frontend Docker containers
- **MongoDB Atlas** — managed database (Free Tier M0, 512MB)

```
┌──────────────────────────────────────────┐
│                Railway                    │
│                                          │
│  ┌──────────┐       ┌──────────────┐     │
│  │ Frontend │──────▶│   Backend    │     │
│  │  nginx   │ /api/ │   NestJS     │     │
│  │  :80     │       │   :3000      │     │
│  └──────────┘       └──────┬───────┘     │
│                            │             │
└────────────────────────────┼─────────────┘
                             │
                    ┌────────▼────────┐
                    │  MongoDB Atlas  │
                    │  AWS EU         │
                    └─────────────────┘
```

## MongoDB Atlas Setup

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster (Free Tier M0, AWS EU Frankfurt/Ireland)
3. Create a database user with read/write access
4. Add `0.0.0.0/0` to the IP Access List (required for Railway)
5. Get the connection string — looks like:
   ```
   mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/productivity?retryWrites=true&w=majority
   ```
6. Use this as the `MONGODB_URI` environment variable

## Docker Builds

### Backend

```bash
# Build production image
docker build -t productivity-backend --target production ./backend

# Run
docker run -p 3000:3000 --env-file .env productivity-backend
```

The backend Dockerfile uses multi-stage builds:
1. `deps` — installs npm dependencies
2. `dev` — development image with source code
3. `build` — compiles TypeScript, prunes dev dependencies
4. `production` — minimal image with only compiled code and production deps

### Frontend

```bash
# Build production image
docker build -t productivity-frontend --target production ./frontend

# Run
docker run -p 80:80 productivity-frontend
```

The frontend Dockerfile:
1. `deps` — installs npm dependencies
2. `build` — runs `ng build --configuration production`
3. `production` — nginx serves the static build, proxies `/api/` to backend

### Production Compose

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

This starts both services with:
- `no-new-privileges` security option
- `restart: unless-stopped` policy
- No mounted volumes (fully self-contained)

## Railway Deployment

### Initial Setup

1. Create a project at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway auto-detects Dockerfiles in `backend/` and `frontend/`

### Backend Service

1. Set root directory to `backend`
2. Add environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL` (use your Railway backend URL)
   - `JWT_SECRET`
   - `MONGODB_URI` (Atlas connection string)
   - `FRONTEND_URL` (your Railway frontend URL)
   - `PORT=3000`
3. Railway builds and deploys automatically on push

### Frontend Service

1. Set root directory to `frontend`
2. No environment variables needed (baked into build)
3. Update `environment.production.ts` if the API is on a different domain:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend.railway.app/api',
   };
   ```
   If frontend nginx proxies to backend (same domain), keep `apiUrl: '/api'`.

### Custom Domain (Optional)

1. In Railway service settings, go to "Networking"
2. Add your custom domain
3. Railway provides a CNAME record to add to your DNS

## Environment Variables Checklist

| Variable | Backend | Frontend | Where to Set |
|----------|---------|----------|--------------|
| `GOOGLE_CLIENT_ID` | ✅ | — | Railway / `.env` |
| `GOOGLE_CLIENT_SECRET` | ✅ | — | Railway / `.env` |
| `GOOGLE_CALLBACK_URL` | ✅ | — | Railway / `.env` |
| `JWT_SECRET` | ✅ | — | Railway / `.env` |
| `MONGODB_URI` | ✅ | — | Railway / `.env` |
| `FRONTEND_URL` | ✅ | — | Railway / `.env` |
| `PORT` | ✅ | — | Railway / `.env` |

## Health Checks

Both Dockerfiles include `HEALTHCHECK` instructions:
- **Backend**: `wget http://localhost:3000/api/auth/me` (returns 401 if running)
- **Frontend**: `wget http://localhost:80/` (returns 200 if nginx is up)

## Troubleshooting

```bash
# Check container logs
docker compose -f docker-compose.prod.yml logs -f backend

# Shell into running container
docker compose -f docker-compose.prod.yml exec backend sh

# Rebuild after code changes
docker compose -f docker-compose.prod.yml up --build -d

# Reset everything
docker compose -f docker-compose.prod.yml down -v
```
