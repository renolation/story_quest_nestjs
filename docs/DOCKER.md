# Docker Deployment Guide

Production Docker setup for Story Quest NestJS API.

## Two Running Modes

### 1. Local Development (without Docker)
```bash
# Uses .env file with localhost settings
npm run start:dev
```

Your `.env` file uses `localhost` for database connections:
```env
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
```

### 2. Server Deployment (with Docker)
```bash
# Build and deploy with production-ready image
docker-compose -f docker-compose.dev.yml up -d --build
```

## Quick Deploy

```bash
# Build and start (production build)
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Stop container
docker-compose -f docker-compose.dev.yml down
```

## Common Commands

### Start/Stop Container

```bash
# Start API container
docker-compose -f docker-compose.dev.yml up -d

# Stop API container
docker-compose -f docker-compose.dev.yml down

# Restart container
docker-compose -f docker-compose.dev.yml restart api

# Rebuild and restart
docker-compose -f docker-compose.dev.yml up -d --build
```

### View Logs

```bash
# Follow logs
docker-compose -f docker-compose.dev.yml logs -f api

# View last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 api

# Check container status
docker-compose -f docker-compose.dev.yml ps
```

### Execute Commands in Container

```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec api npm run migration:run

# Generate migration
docker-compose -f docker-compose.dev.yml exec api npm run migration:generate -- -n MigrationName

# Run tests
docker-compose -f docker-compose.dev.yml exec api npm run test

# Access container shell
docker-compose -f docker-compose.dev.yml exec api sh

# Install package
docker-compose -f docker-compose.dev.yml exec api npm install package-name
```

## Port Configuration

Change ports in `.env.docker`:

```env
# API on port 8080 instead of 3000
API_HOST_PORT=8080

# Disable debug port in production
DEBUG_HOST_PORT=9229
```

## Access API

- **API**: http://your-server-ip:3000
- **Health Check**: http://your-server-ip:3000/health
- **Debug Port**: Port 9229 (disable in production)

## Key Features

✅ **Production build**: Runs `npm run build` during image creation
✅ **Multi-stage build**: Optimized image size (~150MB vs 1GB+)
✅ **Pre-built image**: Fast startup, no build on container start
✅ **Hardcoded config**: No .env file needed for Docker
✅ **External database**: Connects to your PostgreSQL/Redis
✅ **Security**: Non-root user, minimal attack surface
✅ **Health checks**: Automatic container health monitoring

## Docker Build Process

The Dockerfile uses multi-stage build for optimization:

1. **Builder Stage**: Installs all dependencies and runs `npm run build`
2. **Production Stage**: Only includes production dependencies and built code
3. Runs as non-root user for security
4. Includes health checks

## File Structure

```
.env                    # Local development (localhost)
docker-compose.dev.yml  # Docker compose with hardcoded production config
Dockerfile              # Production Dockerfile with build step
```

## Configuration

All settings are **hardcoded in docker-compose.dev.yml**:
- Database: 103.188.82.191
- Port: 3000
- No environment file needed

To change settings, edit `docker-compose.dev.yml` directly.

## Workflow Summary

| Scenario | Command | Config | DB Host | Build |
|----------|---------|--------|---------|-------|
| **Local Dev** | `npm run start:dev` | `.env` | `localhost` | No build |
| **Server** | `docker-compose -f docker-compose.dev.yml up -d` | Hardcoded | External IP | Production build |

## Troubleshooting

### Cannot connect to database

Check your database settings in `.env.docker`:
```bash
# Test connection from container
docker-compose -f docker-compose.dev.yml exec api sh
ping <DB_HOST>
```

### Port already in use

Change port in `.env.docker`:
```env
API_HOST_PORT=8080
```

### Container won't start

View logs:
```bash
docker-compose -f docker-compose.dev.yml logs api
```

### Clean restart

```bash
docker-compose -f docker-compose.dev.yml down
docker-compose --env-file .env.docker -f docker-compose.dev.yml up -d --build
```

## Important Notes

1. **Never commit `.env.docker`** to git (add to `.gitignore`)
2. Use strong passwords in production
3. Disable debug port in production
4. Use `NODE_ENV=production` on server
5. Your external PostgreSQL/Redis must be accessible from Docker container
