# Next Steps After Committing

## ✅ What You've Done
- ✅ Code committed to Git
- ✅ Code pushed to repository
- ✅ Repository: https://github.com/Coding4DevelopersByShenthuri/Vocario.git

## 🚀 Next Steps: Deploy to Server

### Step 1: Connect to Your Server

From your Windows PowerShell, run:

```powershell
ssh -i "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem" ubuntu@54.179.120.126
```

**You'll be connected to the Linux server!**

### Step 2: On the Server - Clone Your Code

Once connected to the server (you'll see a Linux prompt), run:

```bash
cd ~
git clone https://github.com/Coding4DevelopersByShenthuri/Vocario.git Elora
cd Elora
```

### Step 3: Run Deployment Script

On the server, run the deployment script:

```bash
~/deploy-elora.sh
```

This will:
- Create `.env` file with generated passwords
- Configure firewall (ports 80, 8000)
- Build and start Docker containers
- Run database migrations
- Show deployment status

### Step 4: Create Superuser

After deployment, create a superuser for the admin panel:

```bash
docker compose exec backend python manage.py createsuperuser
```

Follow the prompts to create your admin user.

### Step 5: Access Your Application

After deployment completes, access your application at:

- **Frontend:** http://54.179.120.126
- **Backend API:** http://54.179.120.126:8000/api
- **Admin Panel:** http://54.179.120.126:8000/admin

## 📋 Quick Command Reference

### From Windows (PowerShell):
```powershell
# Connect to server
ssh -i "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem" ubuntu@54.179.120.126
```

### On Server (Linux Bash):
```bash
# Clone code
cd ~
git clone https://github.com/Coding4DevelopersByShenthuri/Vocario.git Elora
cd Elora

# Deploy
~/deploy-elora.sh

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
# Check services are running
docker compose ps

# Test locally on server
curl http://localhost:8000/api/health
curl http://localhost
```

### From Your Windows Machine:
```powershell
# Test API
curl http://54.179.120.126:8000/api/health

# Open in browser
Start-Process "http://54.179.120.126"
```

## 🛠️ Troubleshooting

### Can't Connect to Server
- Check if server is running
- Verify SSH key file exists
- Check firewall allows SSH (port 22)

### Deployment Script Fails
```bash
# Check logs
docker compose logs -f

# Check if Docker is installed
docker --version
docker compose version

# Check if code was cloned correctly
ls -la ~/Elora
```

### Can't Access Website
```bash
# Check firewall
sudo ufw status

# Check if ports are listening
sudo netstat -tlnp | grep -E '80|8000'

# Check Docker logs
docker compose logs frontend
docker compose logs backend
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

## 📝 Common Commands After Deployment

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

# Access backend shell
docker compose exec backend python manage.py shell

# Access database
docker compose exec db mysql -u elora_user -p elora_db
```

## 🔄 Update Application Later

When you make changes:

**On Windows:**
```powershell
git add .
git commit -m "Your changes"
git push
```

**On Server:**
```bash
cd ~/Elora
git pull
docker compose up -d --build
docker compose exec backend python manage.py migrate
```

## ✅ Checklist

- [ ] Connected to server via SSH
- [ ] Cloned repository to ~/Elora
- [ ] Ran deployment script (~/deploy-elora.sh)
- [ ] Created superuser
- [ ] Verified services are running (docker compose ps)
- [ ] Tested API (curl http://localhost:8000/api/health)
- [ ] Accessed website (http://54.179.120.126)

