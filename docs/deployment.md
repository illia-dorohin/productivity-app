# Deployment

## Architecture

```
┌──────────────┐     push to "prod"     ┌──────────────────┐
│    GitHub     │ ────────────────────▶  │  GitHub Actions   │
│  repository   │                        │  build & push     │
└──────────────┘                        └────────┬─────────┘
                                                 │
                                    ┌────────────┼────────────┐
                                    ▼            ▼            │
                              ┌──────────┐ ┌──────────┐       │
                              │ Docker   │ │ Docker   │       │
                              │ Hub      │ │ Hub      │       │
                              │ backend  │ │ frontend │       │
                              └────┬─────┘ └────┬─────┘       │
                                   │            │             │
                                   ▼            ▼             │
                              ┌──────────────────────┐        │
                              │      Railway         │◀───────┘
                              │                      │ railway redeploy
                              │  ┌────────┐ ┌─────┐  │
                              │  │Backend │ │Front│  │
                              │  │ :3000  │ │ :80 │  │
                              │  └────┬───┘ └─────┘  │
                              └───────┼──────────────┘
                                      │
                             ┌────────▼────────┐
                             │  MongoDB Atlas  │
                             │  AWS EU         │
                             └─────────────────┘
```

## Environments

| Environment | Branch | Database | Purpose |
|-------------|--------|----------|---------|
| Local dev | `main` | Local MongoDB (Docker) | Development |
| Production | `prod` | MongoDB Atlas | Live application |

No staging/test environments — local dev and prod only.

## CI/CD Pipeline

Pushing to the `prod` branch triggers the full pipeline automatically via GitHub Actions.

### Pipeline Steps

1. **Build** — Docker images for backend and frontend are built in parallel (matrix strategy)
2. **Push** — Images are pushed to Docker Hub with two tags: `latest` and the commit SHA
3. **Deploy** — Railway CLI redeploys both services, pulling the new `latest` images

### Workflow File

The pipeline is defined in `.github/workflows/deploy.yml`.

## Docker Hub

Images are published to Docker Hub:

- `<username>/productivity-backend:latest`
- `<username>/productivity-frontend:latest`
- `<username>/productivity-backend:<commit-sha>` (for rollback)
- `<username>/productivity-frontend:<commit-sha>` (for rollback)

### Manual Push (if needed)

```bash
docker login

docker build -t <username>/productivity-backend:latest --target production ./backend
docker push <username>/productivity-backend:latest

docker build -t <username>/productivity-frontend:latest --target production ./frontend
docker push <username>/productivity-frontend:latest
```

## GitHub Secrets

Configure these in GitHub repository settings (Settings → Secrets and variables → Actions):

| Secret | Description | Where to get |
|--------|-------------|--------------|
| `DOCKERHUB_USERNAME` | Docker Hub username | [hub.docker.com](https://hub.docker.com) |
| `DOCKERHUB_TOKEN` | Docker Hub access token | [Docker Hub Security Settings](https://hub.docker.com/settings/security) |
| `RAILWAY_TOKEN` | Railway project token | Railway Dashboard → Project → Settings → Tokens |

## Railway Setup

### Initial Setup

1. Create a project at [railway.app](https://railway.app)
2. Create two services — **backend** and **frontend**
3. For each service, set source to **Docker Image**:
   - Backend: `<dockerhub-username>/productivity-backend:latest`
   - Frontend: `<dockerhub-username>/productivity-frontend:latest`

### Backend Service

Add environment variables in Railway Dashboard (service → Variables):

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | `https://<backend-domain>/api/auth/google/callback` |
| `JWT_SECRET` | Random string, 32+ characters |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `FRONTEND_URL` | Your Railway frontend URL |
| `PORT` | `3000` |

### Frontend Service

No environment variables needed — the API URL is configured via nginx proxy.

### Railway Token

Generate a project token for CI/CD:

1. Open your project in Railway Dashboard
2. Go to **Settings → Tokens**
3. Create a new **Project Token**
4. Copy it and add as `RAILWAY_TOKEN` in GitHub Secrets

### Service Names

The GitHub Actions workflow uses `--service backend` and `--service frontend` in the `railway redeploy` commands. Make sure your Railway service names match exactly (lowercase). You can rename services in Railway Dashboard.

### Custom Domain (Optional)

1. In Railway service settings, go to **Networking**
2. Add your custom domain
3. Railway provides a CNAME record to add to your DNS

## MongoDB Atlas Setup

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster (Free Tier M0, AWS EU Frankfurt/Ireland)
3. Create a database user with read/write access
4. Add `0.0.0.0/0` to the IP Access List (required for Railway)
5. Get the connection string and use it as `MONGODB_URI`

## Local Production Testing

Use `docker-compose.prod.yml` to test the production build locally:

```bash
export DOCKERHUB_USERNAME=your-username
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## Rollback

To roll back to a previous version, update the Docker image tag in Railway:

1. Go to Railway Dashboard → Service → Settings → Source
2. Change the image tag from `latest` to the specific commit SHA
3. Railway will redeploy with the old image

Or via CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Redeploy (after changing image tag in dashboard)
railway redeploy --service backend --yes
railway redeploy --service frontend --yes
```

## Health Checks

Both Docker images include health checks:
- **Backend**: `wget http://localhost:3000/api/auth/me` (returns 401 if running)
- **Frontend**: `wget http://localhost:80/` (returns 200 if nginx is up)

## Troubleshooting

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login interactively
railway login

# Link to your project
railway link

# View logs
railway logs --service backend
railway logs --service frontend

# Redeploy manually
railway redeploy --service backend --yes
```
