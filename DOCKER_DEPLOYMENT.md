# Docker Deployment Guide for Elora

## Production Deployment on 54.179.120.126

This guide will help you deploy the Elora application using Docker on your production server.

## Prerequisites

- Docker and Docker Compose installed on the server
- Access to the server (SSH)
- Domain/IP configured: `54.179.120.126`

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd Elora
   ```

2. **Create environment file**:
   ```bash
   cp env.example .env
   ```

3. **Edit `.env` file** with your production values:
   ```bash
   nano .env
   ```
   
   **Critical values to update:**
   - `SECRET_KEY` - Generate a strong secret key (use `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
   - `DATABASE_PASSWORD` - Strong password for database user
   - `DATABASE_ROOT_PASSWORD` - Strong password for MySQL root
   - `DEBUG=False` - Always False in production
   - `ALLOWED_HOSTS` - Should include `54.179.120.126`
   - `CORS_ALLOWED_ORIGINS` - Should include `http://54.179.120.126`
   - Email settings (if using email functionality)

4. **Build and start services**:
   ```bash
   docker-compose up -d --build
   ```

5. **Check service status**:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

6. **Create superuser** (first time only):
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## Service URLs

- **Frontend**: http://54.179.120.126
- **Backend API**: http://54.179.120.126:8000/api
- **Django Admin**: http://54.179.120.126:8000/admin

## Architecture

```
┌─────────────────┐
│   Frontend      │  Port 80 (nginx)
│   (React/Vite)  │
└────────┬────────┘
         │
         │ API Calls
         │
┌────────▼────────┐
│   Backend       │  Port 8000 (Django)
│   (Django REST) │
└────────┬────────┘
         │
         │ Database Queries
         │
┌────────▼────────┐
│   Database      │  Port 3306 (MySQL)
│   (MySQL 8.0)   │
└─────────────────┘
```

## Environment Variables

All environment variables are loaded from `.env` file. See `env.example` for the complete list.

### Required Variables

- `SECRET_KEY` - Django secret key
- `DATABASE_NAME` - MySQL database name
- `DATABASE_USER` - MySQL user
- `DATABASE_PASSWORD` - MySQL password
- `DATABASE_ROOT_PASSWORD` - MySQL root password

### Optional Variables

- `DEBUG` - Set to `False` in production
- `EMAIL_*` - Email configuration for sending emails
- `FRONTEND_URL` - Frontend URL for email links
- `VITE_API_URL` - API URL for frontend (baked into build)

## Common Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes database)
```bash
docker-compose down -v
```

### Run migrations manually
```bash
docker-compose exec backend python manage.py migrate
```

### Create superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Access database
```bash
docker-compose exec db mysql -u elora_user -p elora_db
```

### Access backend shell
```bash
docker-compose exec backend python manage.py shell
```

## Health Checks

All services have health checks configured:
- **Database**: Checks MySQL connectivity
- **Backend**: Checks `/api/health` endpoint
- **Frontend**: Checks nginx serving

View health status:
```bash
docker-compose ps
```

## Troubleshooting

### Backend won't start
1. Check database is healthy: `docker-compose ps db`
2. Check backend logs: `docker-compose logs backend`
3. Verify environment variables: `docker-compose exec backend env | grep DATABASE`

### Frontend can't connect to backend
1. Verify `VITE_API_URL` in `.env` matches your setup
2. Check CORS settings in Django settings
3. Check backend logs for CORS errors

### Database connection errors
1. Verify database service is running: `docker-compose ps db`
2. Check database credentials in `.env`
3. Check database logs: `docker-compose logs db`

### Port conflicts
If ports 80, 8000, or 3306 are already in use:
1. Stop conflicting services
2. Or modify port mappings in `docker-compose.yml`

## Development Mode

For development with hot-reload and volume mounts:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This will:
- Mount source code as volumes (hot-reload)
- Enable DEBUG mode
- Use different ports if needed

## Production Checklist

- [ ] `SECRET_KEY` is set to a strong, unique value
- [ ] `DEBUG=False` in `.env`
- [ ] Database passwords are strong and unique
- [ ] `ALLOWED_HOSTS` includes production domain/IP
- [ ] `CORS_ALLOWED_ORIGINS` includes production frontend URL
- [ ] Email settings configured (if using email)
- [ ] Firewall allows ports 80 and 8000
- [ ] SSL/HTTPS configured (recommended for production)
- [ ] Regular backups of database volume
- [ ] Monitoring and logging configured

## Backup Database

```bash
# Backup
docker-compose exec db mysqldump -u elora_user -p elora_db > backup.sql

# Restore
docker-compose exec -T db mysql -u elora_user -p elora_db < backup.sql
```

## Update Application

1. Pull latest code: `git pull`
2. Rebuild containers: `docker-compose up -d --build`
3. Run migrations: `docker-compose exec backend python manage.py migrate`
4. Restart services: `docker-compose restart`

## Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong passwords** - Especially for database and SECRET_KEY
3. **Keep DEBUG=False** - In production
4. **Limit CORS origins** - Only allow your production domain
5. **Use HTTPS** - Configure reverse proxy (nginx/traefik) for SSL
6. **Regular updates** - Keep Docker images and dependencies updated

## Support

For issues or questions, check:
- Application logs: `docker-compose logs`
- Docker status: `docker-compose ps`
- System resources: `docker stats`

