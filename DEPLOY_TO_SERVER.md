# Deploy Elora to Production Server (54.179.120.126)

## Current Situation
You're currently running the application **locally** on your Windows machine. To access it at `http://54.179.120.126`, you need to deploy it to that server.

## Prerequisites
1. SSH access to the server at `54.179.120.126`
2. Docker and Docker Compose installed on the server
3. Git (to clone/push code) OR SCP (to copy files)

## Step 1: Prepare Your Code

Make sure all your changes are committed:
```bash
git add .
git commit -m "Docker setup for production"
git push  # Push to your repository
```

## Step 2: Connect to Your Server

```bash
ssh user@54.179.120.126
# Replace 'user' with your actual SSH username
```

## Step 3: Install Docker on Server (if not installed)

### For Ubuntu/Debian:
```bash
# Update packages
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### For CentOS/RHEL:
```bash
sudo yum install docker docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
```

## Step 4: Clone/Copy Your Code

### Option A: Using Git (if code is in repository)
```bash
cd ~
git clone <your-repository-url> Elora
cd Elora
```

### Option B: Using SCP (from your local machine)
From your Windows machine:
```powershell
scp -r . user@54.179.120.126:~/Elora
```

Then on the server:
```bash
cd ~/Elora
```

## Step 5: Create Production .env File

On the server, create `.env` file with production values:

```bash
nano .env
```

Use this template:
```env
# Django Settings
SECRET_KEY=<generate-strong-secret-key>
DEBUG=False
ALLOWED_HOSTS=54.179.120.126,localhost,127.0.0.1,0.0.0.0,elora-backend

# Database Configuration - Using Docker MySQL
DATABASE_NAME=elora_db
DATABASE_USER=elora_user
DATABASE_PASSWORD=<generate-strong-password>
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_ROOT_PASSWORD=<generate-strong-root-password>

# Frontend Configuration
FRONTEND_URL=http://54.179.120.126
VITE_API_URL=http://54.179.120.126:8000/api

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://54.179.120.126,http://localhost:8080

# Email Configuration (if using email)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

**Generate SECRET_KEY on server:**
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## Step 6: Configure Firewall

Allow ports 80 (HTTP) and 8000 (API):

### For Ubuntu/Debian (UFW):
```bash
sudo ufw allow 80/tcp
sudo ufw allow 8000/tcp
sudo ufw reload
```

### For CentOS/RHEL (firewalld):
```bash
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### For iptables:
```bash
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
sudo iptables-save
```

## Step 7: Build and Start Services

On the server:
```bash
cd ~/Elora

# Stop any existing containers
docker-compose down

# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 8: Run Migrations

```bash
docker-compose exec backend python manage.py migrate

# Create superuser (first time only)
docker-compose exec backend python manage.py createsuperuser
```

## Step 9: Verify Deployment

1. **Check services:**
   ```bash
   docker-compose ps
   # All should show "Up" and "healthy"
   ```

2. **Test locally on server:**
   ```bash
   curl http://localhost:8000/api/health
   curl http://localhost
   ```

3. **Test from your local machine:**
   ```bash
   curl http://54.179.120.126:8000/api/health
   curl http://54.179.120.126
   ```

## Step 10: Access Your Application

- **Frontend:** http://54.179.120.126
- **Backend API:** http://54.179.120.126:8000/api
- **Admin Panel:** http://54.179.120.126:8000/admin

## Troubleshooting

### Can't Access from Browser

1. **Check if services are running:**
   ```bash
   docker-compose ps
   ```

2. **Check firewall:**
   ```bash
   sudo ufw status  # Ubuntu/Debian
   sudo firewall-cmd --list-ports  # CentOS/RHEL
   ```

3. **Check if ports are listening:**
   ```bash
   sudo netstat -tlnp | grep -E '80|8000'
   # or
   sudo ss -tlnp | grep -E '80|8000'
   ```

4. **Check server logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

### Port 80 Already in Use

If port 80 is already used by another service (like Apache/Nginx):
```bash
# Option 1: Stop the other service
sudo systemctl stop apache2  # or nginx

# Option 2: Change frontend port in docker-compose.yml
ports:
  - "8080:80"  # Then access via http://54.179.120.126:8080
```

### Database Connection Issues

Check database logs:
```bash
docker-compose logs db
```

Verify database credentials in `.env` file match docker-compose.yml

### SSL/HTTPS Setup (Optional but Recommended)

For production, set up SSL/HTTPS using:
- Nginx reverse proxy with Let's Encrypt
- Cloudflare
- AWS Application Load Balancer

## Update Application

When you make changes:
```bash
# On your local machine
git add .
git commit -m "Your changes"
git push

# On server
cd ~/Elora
git pull
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
```

## Monitoring

Check logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Quick Reference Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access database
docker-compose exec db mysql -u elora_user -p elora_db

# Rebuild after code changes
docker-compose up -d --build
```

