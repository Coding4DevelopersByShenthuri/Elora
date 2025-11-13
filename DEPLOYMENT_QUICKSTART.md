# Quick Start Deployment Guide

## For Production Server: 54.179.120.126

### Step 1: Prepare Environment File

```bash
# Copy the example environment file
cp env.example .env

# Edit with your production values
nano .env
```

**Minimum required changes in `.env`:**
```bash
SECRET_KEY=<generate-strong-key>
DEBUG=False
ALLOWED_HOSTS=54.179.120.126,localhost,127.0.0.1,0.0.0.0,elora-backend
DATABASE_PASSWORD=<strong-password>
DATABASE_ROOT_PASSWORD=<strong-root-password>
CORS_ALLOWED_ORIGINS=http://54.179.120.126,http://localhost:8080
```

**Generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 2: Deploy

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 3: Initialize Database (First Time Only)

```bash
# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Step 4: Verify

- Frontend: http://54.179.120.126
- Backend API: http://54.179.120.126:8000/api/health
- Admin: http://54.179.120.126:8000/admin

## Troubleshooting

**Backend won't start:**
```bash
docker-compose logs backend
# Check database connection in logs
```

**Database connection issues:**
```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db
```

**Frontend can't reach backend:**
- Verify `VITE_API_URL` in `.env` is `http://54.179.120.126:8000/api`
- Rebuild frontend: `docker-compose up -d --build frontend`

## Common Commands

```bash
# Stop all services
docker-compose down

# Restart a service
docker-compose restart backend

# View logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend python manage.py migrate

# Access backend shell
docker-compose exec backend python manage.py shell
```

## Next Steps

See `DOCKER_DEPLOYMENT.md` for complete documentation.

