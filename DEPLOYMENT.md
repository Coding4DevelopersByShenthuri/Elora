# Elora Deployment Guide

## Prerequisites
- Ubuntu server (54.179.120.126)
- SSH access via PuTTY (already connected)
- Domain or IP address configured

## Step-by-Step Deployment Instructions

### 1. Initial Server Setup

Once connected via PuTTY, run these commands:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required system packages
sudo apt install -y python3 python3-pip python3-venv nginx mysql-server git build-essential default-libmysqlclient-dev pkg-config nodejs npm

# Install Node.js 20.x (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
python3 --version
node --version
npm --version
mysql --version
nginx -v
```

### 2. Clone/Upload Project to Server

**Option A: Using Git (if repository is on GitHub/GitLab)**
```bash
cd /home/ubuntu
git clone <your-repository-url> Elora
cd Elora
```

**Option B: Using SCP (from your local machine)**
```bash
# From your local machine, run:
scp -i your-key.ppk -r C:\Users\shent\OneDrive\Desktop\Elora ubuntu@54.179.120.126:/home/ubuntu/
```

**Option C: Using WinSCP or FileZilla**
- Connect using the same credentials
- Upload the entire Elora folder to `/home/ubuntu/Elora`

### 3. Setup MySQL Database

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Login to MySQL
sudo mysql -u root -p

# In MySQL prompt, run:
CREATE DATABASE elora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'elora'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON elora.* TO 'elora'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Note:** Replace `your_secure_password_here` with a strong password.

### 4. Setup Backend (Django + Gunicorn)

```bash
cd /home/ubuntu/Elora/server

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file for production
nano .env
```

**Add the following to `.env` file:**
```env
SECRET_KEY=your-secret-key-here-generate-with-openssl-rand-hex-32
DEBUG=False
ALLOWED_HOSTS=54.179.120.126,localhost,127.0.0.1

BASE_URL=http://54.179.120.126
FRONTEND_URL=http://54.179.120.126

CORS_ALLOWED_ORIGINS=http://54.179.120.126

DATABASE_NAME=elora
DATABASE_USER=elora
DATABASE_PASSWORD=your_secure_password_here
DATABASE_HOST=localhost
DATABASE_PORT=3306

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

**Run migrations:**
```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser  # Create admin user
```

### 5. Setup Frontend

```bash
cd /home/ubuntu/Elora/client

# Install dependencies
npm install

# Build for production
npm run build

# The dist folder will contain the built files
```

### 6. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/elora
```

**Add the following configuration:**
```nginx
server {
    listen 80;
    server_name 54.179.120.126;

    # Frontend static files
    root /home/ubuntu/Elora/client/dist;
    index index.html;

    # SPA routing - always serve index.html for front-end routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Proxy media files (uploaded content)
    location /media/ {
        alias /home/ubuntu/Elora/server/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy static files served by Django
    location /static/ {
        alias /home/ubuntu/Elora/server/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/elora /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### 7. Create Gunicorn Systemd Service

```bash
sudo nano /etc/systemd/system/elora.service
```

**Add the following:**
```ini
[Unit]
Description=Elora Gunicorn daemon
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/Elora/server
Environment="PATH=/home/ubuntu/Elora/server/venv/bin"
ExecStart=/home/ubuntu/Elora/server/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /home/ubuntu/Elora/server/logs/access.log \
    --error-logfile /home/ubuntu/Elora/server/logs/error.log \
    crud.wsgi:application

[Install]
WantedBy=multi-user.target
```

**Create logs directory:**
```bash
mkdir -p /home/ubuntu/Elora/server/logs
```

**Start and enable the service:**
```bash
sudo systemctl daemon-reload
sudo systemctl start elora
sudo systemctl enable elora
sudo systemctl status elora  # Check status
```

### 8. Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

### 9. Set Permissions

```bash
# Set proper permissions
sudo chown -R ubuntu:www-data /home/ubuntu/Elora
sudo chmod -R 755 /home/ubuntu/Elora
sudo chmod -R 775 /home/ubuntu/Elora/server/media
```

### 10. Verify Deployment

```bash
# Check Gunicorn status
sudo systemctl status elora

# Check Nginx status
sudo systemctl status nginx

# Check Gunicorn logs
tail -f /home/ubuntu/Elora/server/logs/error.log

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### 11. Access Your Application

- Frontend: http://54.179.120.126
- API: http://54.179.120.126/api/
- Admin: http://54.179.120.126/api/admin/

## Useful Commands

### Restart Services
```bash
# Restart Gunicorn
sudo systemctl restart elora

# Restart Nginx
sudo systemctl restart nginx

# Restart both
sudo systemctl restart elora nginx
```

### View Logs
```bash
# Gunicorn logs
sudo journalctl -u elora -f
tail -f /home/ubuntu/Elora/server/logs/error.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Update Application
```bash
cd /home/ubuntu/Elora

# Pull latest changes (if using git)
git pull

# Update backend
cd server
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart elora

# Update frontend
cd ../client
npm install
npm run build
sudo systemctl restart nginx
```

## Troubleshooting

1. **502 Bad Gateway**: Check if Gunicorn is running (`sudo systemctl status elora`)
2. **Static files not loading**: Run `python manage.py collectstatic --noinput`
3. **Database connection error**: Verify MySQL is running and credentials are correct
4. **Permission denied**: Check file permissions with `ls -la`

## Security Recommendations

1. **Setup SSL/HTTPS** using Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d 54.179.120.126
```

2. **Change default MySQL root password**
3. **Use strong SECRET_KEY** in .env
4. **Keep DEBUG=False** in production
5. **Regular backups** of database and media files

