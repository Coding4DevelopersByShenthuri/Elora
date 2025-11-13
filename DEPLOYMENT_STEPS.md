# Deployment Steps for 54.179.120.126

## ✅ What's Done
- ✅ SSH connection working
- ✅ Docker installed on server
- ✅ Deployment script created on server
- ✅ Git repository configured

## 🚀 Quick Deployment

### Step 1: Commit and Push Your Changes

From your local machine (PowerShell):

```powershell
# Commit all changes
git add .
git commit -m "Production deployment with Docker"

# Push to repository
git push
```

### Step 2: Connect to Server

```powershell
ssh -i "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem" ubuntu@54.179.120.126
```

### Step 3: Clone Code on Server

On the server (after SSH connection):

```bash
cd ~
git clone https://github.com/Coding4DevelopersByShenthuri/Vocario.git Elora
cd Elora
```

### Step 4: Run Deployment Script

On the server:

```bash
~/deploy-elora.sh
```

This will:
- Create .env file with generated passwords
- Configure firewall
- Build and start Docker containers
- Run database migrations
- Show deployment status

### Step 5: Create Superuser

On the server:

```bash
docker compose exec backend python manage.py createsuperuser
```

### Step 6: Access Your Application

After deployment, access your application at:
- **Frontend:** http://54.179.120.126
- **Backend API:** http://54.179.120.126:8000/api
- **Admin Panel:** http://54.179.120.126:8000/admin

## 📋 One-Line Commands

### From Local Machine:
```powershell
# Commit and push
git add . && git commit -m "Production deployment" && git push

# Connect to server
ssh -i "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem" ubuntu@54.179.120.126
```

### On Server:
```bash
# Clone and deploy
cd ~ && git clone https://github.com/Coding4DevelopersByShenthuri/Vocario.git Elora && cd Elora && ~/deploy-elora.sh

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## 🔍 Verify Deployment

### On Server:
```bash
# Check services
docker compose ps

# Test locally
curl http://localhost:8000/api/health
curl http://localhost

# Check logs
docker compose logs -f
```

### From Local Machine:
```powershell
# Test API
curl http://54.179.120.126:8000/api/health

# Open in browser
Start-Process "http://54.179.120.126"
```

## 🛠️ Troubleshooting

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

```bash
# Check logs
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Restart services
docker compose restart
```

### Database Issues

```bash
# Check database logs
docker compose logs db

# Run migrations manually
docker compose exec backend python manage.py migrate
```

## 📝 Common Commands

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

## 🔄 Update Application

When you make changes:

```bash
# On local machine
git add .
git commit -m "Your changes"
git push

# On server
cd ~/Elora
git pull
docker compose up -d --build
docker compose exec backend python manage.py migrate
```

## 📞 Quick Reference

**SSH Connection:**
```powershell
ssh -i "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem" ubuntu@54.179.120.126
```

**Git Repository:**
```
https://github.com/Coding4DevelopersByShenthuri/Vocario.git
```

**Server IP:**
```
54.179.120.126
```

**Application URLs:**
- Frontend: http://54.179.120.126
- API: http://54.179.120.126:8000/api
- Admin: http://54.179.120.126:8000/admin

