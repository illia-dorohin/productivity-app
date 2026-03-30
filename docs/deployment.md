# Deployment

## Architecture

```
┌──────────────┐     push to "prod"     ┌──────────────────┐
│    GitHub     │ ────────────────────▶  │  GitHub Actions   │
│  repository   │                        │  (build & push)   │
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
                              │   Production Server  │◀───────┘
                              │                      │  SSH deploy
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
| Local dev | `main` | Local MongoDB (Docker) | Development, testing |
| Production | `prod` | MongoDB Atlas | Live application |

No staging/test environments — local dev and prod only.

## CI/CD Pipeline

Pushing to the `prod` branch triggers the full pipeline automatically via GitHub Actions.

### Pipeline Steps

1. **Build** — Docker images for backend and frontend are built in parallel (matrix strategy)
2. **Push** — Images are pushed to Docker Hub with two tags: `latest` and the commit SHA
3. **Deploy** — The workflow SSHs into the production server, pulls new images, and restarts containers

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
# Login
docker login

# Build and push backend
docker build -t <username>/productivity-backend:latest --target production ./backend
docker push <username>/productivity-backend:latest

# Build and push frontend
docker build -t <username>/productivity-frontend:latest --target production ./frontend
docker push <username>/productivity-frontend:latest
```

## GitHub Secrets

Configure these in GitHub repository settings (Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token ([create here](https://hub.docker.com/settings/security)) |
| `DEPLOY_HOST` | Production server IP or hostname |
| `DEPLOY_USER` | SSH username on the server |
| `DEPLOY_SSH_KEY` | Private SSH key for server access |

## Production Server Setup

### First-Time Setup

1. Install Docker and Docker Compose on the server
2. Create the app directory and environment file:

```bash
mkdir -p ~/productivity-app
cd ~/productivity-app

# Create .env with production values
cat > .env << 'EOF'
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
JWT_SECRET=your-jwt-secret-32-chars-minimum
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/productivity?retryWrites=true&w=majority
FRONTEND_URL=https://your-domain.com
PORT=3000
DOCKERHUB_USERNAME=your-dockerhub-username
EOF
```

3. Copy `docker-compose.prod.yml` to the server (the CI/CD pipeline does this automatically on deploy)

4. Start services:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### SSH Key Setup

Generate a deploy key and add it to the server:

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/deploy_key

# Copy the public key to the server
ssh-copy-id -i ~/.ssh/deploy_key.pub user@your-server

# Add the PRIVATE key content as DEPLOY_SSH_KEY in GitHub Secrets
cat ~/.ssh/deploy_key
```

## MongoDB Atlas Setup

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster (Free Tier M0, AWS EU Frankfurt/Ireland)
3. Create a database user with read/write access
4. Add `0.0.0.0/0` to the IP Access List (required for external access)
5. Get the connection string and use it as `MONGODB_URI`

## Production Compose

The `docker-compose.prod.yml` file pulls pre-built images from Docker Hub instead of building locally. It uses the `DOCKERHUB_USERNAME` environment variable to resolve image names.

Features:
- `no-new-privileges` security option
- `restart: unless-stopped` policy
- Health checks on both services
- Frontend waits for backend to be healthy before starting

## Rollback

To roll back to a previous version, use the commit SHA tag:

```bash
# On the production server
cd ~/productivity-app

# Set the specific version
export IMAGE_TAG=abc123def456

# Update compose to use specific tag and restart
DOCKERHUB_USERNAME=$DOCKERHUB_USERNAME \
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Or edit `docker-compose.prod.yml` to pin a specific image tag instead of `latest`.

## Environment Variables Checklist

| Variable | Required | Where to Set |
|----------|----------|--------------|
| `GOOGLE_CLIENT_ID` | Yes | Server `.env` |
| `GOOGLE_CLIENT_SECRET` | Yes | Server `.env` |
| `GOOGLE_CALLBACK_URL` | Yes | Server `.env` |
| `JWT_SECRET` | Yes | Server `.env` |
| `MONGODB_URI` | Yes | Server `.env` |
| `FRONTEND_URL` | Yes | Server `.env` |
| `PORT` | Yes | Server `.env` |
| `DOCKERHUB_USERNAME` | Yes | Server `.env` + GitHub Secrets |

## Health Checks

Both containers include health checks:
- **Backend**: `wget http://localhost:3000/api/auth/me` (returns 401 if running)
- **Frontend**: `wget http://localhost:80/` (returns 200 if nginx is up)

## Troubleshooting

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check container logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Shell into running container
docker compose -f docker-compose.prod.yml exec backend sh

# Restart a specific service
docker compose -f docker-compose.prod.yml restart backend

# Full restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Clean up old images
docker image prune -f
```
