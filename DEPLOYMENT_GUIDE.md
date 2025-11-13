# Complete Deployment Guide for 54.179.120.126

## Server Information
- **Username:** ubuntu
- **IP Address:** 54.179.120.126
- **SSH Port:** 22

## Prerequisites

You need one of the following to connect:
1. **SSH Key File (.pem)** - Usually provided by your cloud provider (AWS, DigitalOcean, etc.)
2. **Password Authentication** - If enabled on the server
3. **Generate New SSH Key** - If you have password access

## Step 1: Connect to Server

### Option A: Using SSH Key File (.pem)

If you have a `.pem` key file from your cloud provider:

```powershell
# Replace 'path/to/key.pem' with your actual key file path
ssh -i "path/to/your-key.pem" ubuntu@54.179.120.126

# Example (if key is in Downloads):
ssh -i "C:\Users\shent\Downloads\my-server-key.pem" ubuntu@54.179.120.126

# Example (if key is in .ssh folder):
ssh -i "C:\Users\shent\.ssh\server-key.pem" ubuntu@54.179.120.126
```

### Option B: Using Password (if enabled)

```powershell
ssh ubuntu@54.179.120.126
# Enter your password when prompted
```

### Option C: Generate SSH Key

If you need to generate a new key:

```powershell
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# Press Enter to accept default location
# Enter a passphrase (optional)

# Copy public key to server (if password auth works)
type ~/.ssh/id_rsa.pub | ssh ubuntu@54.179.120.126 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## Step 2: Prepare Your Code

### From Your Local Machine

Make sure your code is ready:

```powershell
# Check git status
git status

# Commit and push changes
git add .
git commit -m "Production deployment"
git push
```

**Note:** If you don't have Git, you can copy files using SCP (see Step 3).

## Step 3: Deploy to Server

### Once Connected to Server (via SSH):

#### 3.1 Install Docker

```bash
# Update package list
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Add ubuntu user to docker group (to run without sudo)
sudo usermod -aG docker ubuntu
newgrp docker

# Verify installation
docker --version
docker compose version
```

#### 3.2 Clone Your Code

**Option A: Using Git**
```bash
cd ~
git clone <your-repository-url> Elora
cd Elora
```

**Option B: Copy Files via SCP (from local machine)**

From your Windows machine (PowerShell):
```powershell
# Create a tar archive (excluding node_modules, venv, etc.)
tar --exclude='node_modules' --exclude='venv' --exclude='.git' --exclude='dist' -czf elora.tar.gz .

# Copy to server (replace with your key path)
scp -i "path/to/your-key.pem" elora.tar.gz ubuntu@54.179.120.126:~/

# Then on server, extract:
# ssh to server first, then:
tar -xzf elora.tar.gz -C ~/Elora
cd ~/Elora
```

#### 3.3 Create .env File

```bash
cd ~/Elora
nano .env
```

Paste this (update with your values):
```env
# Django Settings
SECRET_KEY=<generate-strong-key-here>
DEBUG=False
ALLOWED_HOSTS=54.179.120.126,localhost,127.0.0.1,0.0.0.0,elora-backend

# Database Configuration
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
CORS_ALLOWED_ORIGINS=http://54.179.120.126

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

**Generate SECRET_KEY:**
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### 3.4 Configure Firewall

```bash
# Allow HTTP (port 80) and API (port 8000)
sudo ufw allow 80/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 22/tcp  # SSH (if not already allowed)
sudo ufw reload

# Check status
sudo ufw status
```

#### 3.5 Deploy Application

```bash
cd ~/Elora

# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser (first time only)
docker-compose exec backend python manage.py createsuperuser

# View logs
docker-compose logs -f
```

#### 3.6 Verify Deployment

```bash
# Check services are running
docker-compose ps

# Test locally on server
curl http://localhost:8000/api/health
curl http://localhost
```

## Step 4: Access Your Application

Once deployed, access your application at:

- **Frontend:** http://54.179.120.126
- **Backend API:** http://54.179.120.126:8000/api
- **Admin Panel:** http://54.179.120.126:8000/admin

## Troubleshooting

### Can't Connect via SSH

**Permission Denied (publickey):**
- You need an SSH key file (.pem)
- Check if you have the key file from your cloud provider
- Verify the key file permissions: `chmod 400 your-key.pem` (on Linux/Mac)
- Try using the full path to the key file

**Connection Timeout:**
- Check if server is running
- Verify firewall allows SSH (port 22)
- Check security group rules (if using AWS/cloud provider)

### Can't Access Website

**Port 80 Not Accessible:**
- Check firewall: `sudo ufw status`
- Check if port is listening: `sudo netstat -tlnp | grep 80`
- Check Docker logs: `docker-compose logs frontend`
- Verify security group allows port 80 (if using cloud provider)

**Port 80 Already in Use:**
```bash
# Check what's using port 80
sudo lsof -i :80
# Stop the service (e.g., Apache or Nginx)
sudo systemctl stop apache2
# or
sudo systemctl stop nginx
```

### Database Issues

```bash
# Check database logs
docker-compose logs db

# Verify database is running
docker-compose ps db

# Check database connection
docker-compose exec backend python manage.py dbshell
```

### Application Errors

```bash
# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend

# Restart services
docker-compose restart
```

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access backend shell
docker-compose exec backend python manage.py shell

# Access database
docker-compose exec db mysql -u elora_user -p elora_db
```

## Update Application

When you make changes:

```bash
# On local machine
git add .
git commit -m "Your changes"
git push

# On server
cd ~/Elora
git pull
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
```

## Security Checklist

- [ ] SECRET_KEY is strong and unique
- [ ] DEBUG=False in production
- [ ] Strong database passwords
- [ ] Firewall configured (ports 80, 8000, 22)
- [ ] SSH key authentication (recommended)
- [ ] Regular backups configured
- [ ] SSL/HTTPS configured (recommended for production)

