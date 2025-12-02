#!/bin/bash

# Elora Deployment Script
# Run this script on your Ubuntu server after uploading the project

set -e  # Exit on error

echo "========================================="
echo "Elora Deployment Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Run as ubuntu user.${NC}"
   exit 1
fi

PROJECT_DIR="/home/ubuntu/Elora"
SERVER_DIR="$PROJECT_DIR/server"
CLIENT_DIR="$PROJECT_DIR/client"

echo -e "${GREEN}Step 1: Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${GREEN}Step 2: Installing required packages...${NC}"
sudo apt install -y python3 python3-pip python3-venv nginx mysql-server git build-essential default-libmysqlclient-dev pkg-config

# Install Node.js 20.x
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
    echo -e "${GREEN}Installing Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo -e "${GREEN}Step 3: Setting up MySQL database...${NC}"
echo -e "${YELLOW}Please enter MySQL root password when prompted:${NC}"
read -sp "MySQL root password: " MYSQL_ROOT_PASS
echo ""

read -p "Database name [elora]: " DB_NAME
DB_NAME=${DB_NAME:-elora}

read -p "Database user [elora]: " DB_USER
DB_USER=${DB_USER:-elora}

read -sp "Database password: " DB_PASS
echo ""

# Create database and user
sudo mysql -u root -p"$MYSQL_ROOT_PASS" <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}Step 4: Setting up Python virtual environment...${NC}"
cd "$SERVER_DIR"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}Step 5: Configuring Django environment...${NC}"
if [ ! -f "$SERVER_DIR/.env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    read -sp "Django SECRET_KEY (press Enter to generate): " SECRET_KEY
    echo ""
    
    if [ -z "$SECRET_KEY" ]; then
        SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
    fi
    
    read -p "Email host user (optional): " EMAIL_USER
    read -sp "Email host password (optional): " EMAIL_PASS
    echo ""
    
    cat > "$SERVER_DIR/.env" <<EOF
SECRET_KEY=${SECRET_KEY}
DEBUG=False
ALLOWED_HOSTS=54.179.120.126,localhost,127.0.0.1

BASE_URL=http://54.179.120.126
FRONTEND_URL=http://54.179.120.126

CORS_ALLOWED_ORIGINS=http://54.179.120.126

DATABASE_NAME=${DB_NAME}
DATABASE_USER=${DB_USER}
DATABASE_PASSWORD=${DB_PASS}
DATABASE_HOST=localhost
DATABASE_PORT=3306

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=${EMAIL_USER}
EMAIL_HOST_PASSWORD=${EMAIL_PASS}
DEFAULT_FROM_EMAIL=${EMAIL_USER}
EOF
    echo -e "${GREEN}.env file created!${NC}"
else
    echo -e "${YELLOW}.env file already exists. Skipping...${NC}"
fi

echo -e "${GREEN}Step 6: Running Django migrations...${NC}"
python manage.py migrate
python manage.py collectstatic --noinput

echo -e "${GREEN}Step 7: Building frontend...${NC}"
cd "$CLIENT_DIR"
npm install
npm run build

echo -e "${GREEN}Step 8: Creating logs directory...${NC}"
mkdir -p "$SERVER_DIR/logs"

echo -e "${GREEN}Step 9: Setting up Gunicorn service...${NC}"
sudo tee /etc/systemd/system/elora.service > /dev/null <<EOF
[Unit]
Description=Elora Gunicorn daemon
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=${SERVER_DIR}
Environment="PATH=${SERVER_DIR}/venv/bin"
ExecStart=${SERVER_DIR}/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile ${SERVER_DIR}/logs/access.log \
    --error-logfile ${SERVER_DIR}/logs/error.log \
    crud.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable elora
sudo systemctl start elora

echo -e "${GREEN}Step 10: Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/elora > /dev/null <<EOF
server {
    listen 80;
    server_name 54.179.120.126;

    root ${CLIENT_DIR}/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }

    location /media/ {
        alias ${SERVER_DIR}/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /static/ {
        alias ${SERVER_DIR}/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

sudo ln -sf /etc/nginx/sites-available/elora /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo -e "${GREEN}Step 11: Setting permissions...${NC}"
sudo chown -R ubuntu:www-data "$PROJECT_DIR"
sudo chmod -R 755 "$PROJECT_DIR"
sudo chmod -R 775 "$SERVER_DIR/media"

echo -e "${GREEN}Step 12: Configuring firewall...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Check service status:"
echo "  sudo systemctl status elora"
echo "  sudo systemctl status nginx"
echo ""
echo "View logs:"
echo "  sudo journalctl -u elora -f"
echo "  tail -f $SERVER_DIR/logs/error.log"
echo ""
echo "Access your application at: http://54.179.120.126"
echo ""
echo -e "${YELLOW}Don't forget to create a superuser:${NC}"
echo "  cd $SERVER_DIR"
echo "  source venv/bin/activate"
echo "  python manage.py createsuperuser"

