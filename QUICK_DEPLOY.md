# Quick Deploy to 54.179.120.126

## What You Need
- SSH access to the server
- Docker installed on the server
- Your code pushed to Git (or ability to copy files via SCP)

## Deployment Steps

### 1. From Your Local Machine - Push Code to Git
```powershell
git add .
git commit -m "Production deployment ready"
git push
```

### 2. SSH to Your Server
```powershell
ssh user@54.179.120.126
```

### 3. On the Server - Install Docker (if not installed)
```bash
# For Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose-plugin

# Add user to docker group (optional)
sudo usermod -aG docker $USER
newgrp docker
```

### 4. Clone Your Code
```bash
cd ~
git clone <your-repo-url> Elora
cd Elora
```

### 5. Create .env File
```bash
nano .env
```

Paste this (update with your values):
```env
SECRET_KEY=<generate-strong-key-here>
DEBUG=False
ALLOWED_HOSTS=54.179.120.126,localhost,127.0.0.1,0.0.0.0,elora-backend

DATABASE_NAME=elora_db
DATABASE_USER=elora_user
DATABASE_PASSWORD=<strong-password>
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_ROOT_PASSWORD=<strong-root-password>

FRONTEND_URL=http://54.179.120.126
VITE_API_URL=http://54.179.120.126:8000/api

CORS_ALLOWED_ORIGINS=http://54.179.120.126
```

Generate SECRET_KEY:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 6. Configure Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 8000/tcp
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### 7. Deploy
```bash
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### 8. Verify
```bash
# Check services
docker-compose ps

# Test locally on server
curl http://localhost:8000/api/health
curl http://localhost
```

### 9. Access Your Site
- Frontend: http://54.179.120.126
- API: http://54.179.120.126:8000/api
- Admin: http://54.179.120.126:8000/admin

## Troubleshooting

### Can't SSH to Server
- Check if server is running
- Verify firewall allows SSH (port 22)
- Check your SSH key/credentials

### Can't Access Website
- Check firewall rules: `sudo ufw status`
- Check if ports are listening: `sudo netstat -tlnp | grep -E '80|8000'`
- Check Docker logs: `docker-compose logs -f`

### Port 80 Already in Use
- Stop other web server: `sudo systemctl stop apache2` or `sudo systemctl stop nginx`
- Or change port in docker-compose.yml to 8080

### Database Issues
- Check logs: `docker-compose logs db`
- Verify .env file has correct database credentials
- Make sure database service is running: `docker-compose ps db`

