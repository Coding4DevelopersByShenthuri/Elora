# Deploy Elora to Server NOW

## Server Information
- **IP:** 54.179.120.126
- **Username:** ubuntu
- **SSH Key:** C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem

## Status
✅ SSH connection working
✅ Docker installed on server
✅ Deployment script created on server

## Quick Deployment Steps

### Step 1: Transfer Your Code to Server

**Option A: Using Git (Recommended)**

1. **Push your code to Git repository** (if not already):
   ```powershell
   git add .
   git commit -m "Production deployment"
   git push
   ```

2. **Connect to server:**
   ```powershell
   ssh -i "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem" ubuntu@54.179.120.126
   ```

3. **On server, clone your repository:**
   ```bash
   cd ~
   git clone <your-repository-url> Elora
   cd Elora
   ```

**Option B: Using SCP (If no Git)**

1. **From your local machine, create archive:**
   ```powershell
   # Install tar if not available (Windows 10+ has tar built-in)
   tar --exclude='node_modules' --exclude='venv' --exclude='.git' --exclude='dist' --exclude='*.log' -czf elora.tar.gz .
   ```

2. **Copy to server:**
   ```powershell
   scp -i "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem" elora.tar.gz ubuntu@54.179.120.126:~/
   ```

3. **On server, extract:**
   ```bash
   mkdir -p ~/Elora
   cd ~/Elora
   tar -xzf ~/elora.tar.gz
   ```

### Step 2: Run Deployment Script

**On the server:**
```bash
cd ~/Elora
~/deploy-elora.sh
```

This script will:
- Create .env file with generated passwords
- Configure firewall (ports 80, 8000)
- Build and start Docker containers
- Run database migrations
- Show deployment status

### Step 3: Verify Deployment

**On the server:**
```bash
# Check services
docker compose ps

# Check logs
docker compose logs -f

# Test locally
curl http://localhost:8000/api/health
curl http://localhost
```

**From your local machine:**
```powershell
# Test from browser or PowerShell
curl http://54.179.120.126:8000/api/health
# Open browser: http://54.179.120.126
```

### Step 4: Create Superuser

**On the server:**
```bash
docker compose exec backend python manage.py createsuperuser
```

## Quick Connect Command

```powershell
ssh -i "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem" ubuntu@54.179.120.126
```

## After Deployment

Your application will be available at:
- **Frontend:** http://54.179.120.126
- **Backend API:** http://54.179.120.126:8000/api
- **Admin Panel:** http://54.179.120.126:8000/admin

## Troubleshooting

### Can't Access Website

1. **Check firewall:**
   ```bash
   sudo ufw status
   ```

2. **Check if ports are listening:**
   ```bash
   sudo netstat -tlnp | grep -E '80|8000'
   ```

3. **Check Docker logs:**
   ```bash
   docker compose logs -f
   ```

### Services Not Starting

1. **Check logs:**
   ```bash
   docker compose logs backend
   docker compose logs frontend
   docker compose logs db
   ```

2. **Restart services:**
   ```bash
   docker compose restart
   ```

### Database Issues

```bash
# Check database logs
docker compose logs db

# Verify database is running
docker compose ps db

# Run migrations manually
docker compose exec backend python manage.py migrate
```

## Common Commands

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose down

# Start services
docker compose up -d

# Rebuild after changes
docker compose up -d --build

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Access backend shell
docker compose exec backend python manage.py shell

# Access database
docker compose exec db mysql -u elora_user -p elora_db
```

## Update Application

When you make changes:

```bash
# On server
cd ~/Elora
git pull  # If using Git
docker compose up -d --build
docker compose exec backend python manage.py migrate
```

