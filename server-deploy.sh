#!/bin/bash
set -e

echo "========================================="
echo "Elora Deployment Script"
echo "========================================="
echo ""

# Check if code directory exists
if [ ! -d ~/Elora ]; then
    echo "ERROR: Code directory ~/Elora not found!"
    echo ""
    echo "Please either:"
    echo "  1. Clone your repository:"
    echo "     cd ~"
    echo "     git clone <your-repo-url> Elora"
    echo "     cd Elora"
    echo ""
    echo "  2. Or copy files via SCP from your local machine"
    echo ""
    exit 1
fi

cd ~/Elora

echo "Creating .env file if it doesn't exist..."
if [ ! -f .env ]; then
    # Generate random passwords
    DB_PASSWORD=$(openssl rand -hex 16)
    ROOT_PASSWORD=$(openssl rand -hex 16)
    
    cat > .env << ENVFILE
# Django Settings
SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>/dev/null || echo "django-insecure-CHANGE-THIS-GENERATE-NEW-KEY")
DEBUG=False
ALLOWED_HOSTS=54.179.120.126,localhost,127.0.0.1,0.0.0.0,elora-backend

# Database Configuration
DATABASE_NAME=elora_db
DATABASE_USER=elora_user
DATABASE_PASSWORD=${DB_PASSWORD}
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_ROOT_PASSWORD=${ROOT_PASSWORD}

# Frontend Configuration
FRONTEND_URL=http://54.179.120.126
VITE_API_URL=http://54.179.120.126:8000/api

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://54.179.120.126

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=
ENVFILE
    echo ".env file created with generated passwords!"
    echo ""
fi

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 80/tcp || true
sudo ufw allow 8000/tcp || true
sudo ufw allow 22/tcp || true
sudo ufw --force enable || true
echo "Firewall configured!"

# Deploy application
echo "Deploying application..."
echo "Stopping existing containers..."
docker compose down || true

echo "Building and starting containers..."
docker compose up -d --build

echo "Waiting for services to start..."
sleep 20

echo "Running migrations..."
docker compose exec -T backend python manage.py migrate || echo "Migration may have failed, check logs"

echo ""
echo "========================================="
echo "Deployment Status"
echo "========================================="
docker compose ps

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Access your application at:"
echo "  Frontend: http://54.179.120.126"
echo "  API: http://54.179.120.126:8000/api"
echo "  Admin: http://54.179.120.126:8000/admin"
echo ""
echo "Next steps:"
echo "  1. Check logs: docker compose logs -f"
echo "  2. Create superuser: docker compose exec backend python manage.py createsuperuser"
echo "  3. Check .env file and update if needed"
echo ""

