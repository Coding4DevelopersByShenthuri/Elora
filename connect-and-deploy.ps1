# PowerShell Script to Connect and Deploy to Server
# Server: 54.179.120.126
# Username: ubuntu

$sshKey = "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem"
$serverIp = "54.179.120.126"
$username = "ubuntu"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Elora Server Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server: $serverIp" -ForegroundColor Yellow
Write-Host "Username: $username" -ForegroundColor Yellow
Write-Host "SSH Key: $sshKey" -ForegroundColor Yellow
Write-Host ""

# Test connection
Write-Host "Testing SSH connection..." -ForegroundColor Cyan
$testConnection = & ssh -i $sshKey "${username}@${serverIp}" "echo 'Connection successful!' && hostname" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Connection successful!" -ForegroundColor Green
    Write-Host ""
    
    # Create deployment script
    $deployScript = @"
#!/bin/bash
set -e

echo "========================================="
echo "Deploying Elora Application"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo apt-get install -y docker-compose-plugin
    sudo usermod -aG docker ubuntu
    newgrp docker
else
    echo "Docker is already installed"
fi

# Check if code exists
if [ ! -d ~/Elora ]; then
    echo "Code directory not found. Please clone your repository:"
    echo "  cd ~"
    echo "  git clone <your-repo-url> Elora"
    echo "  cd Elora"
    exit 1
fi

cd ~/Elora

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'ENVFILE'
# Django Settings
SECRET_KEY=django-insecure-CHANGE-THIS-IN-PRODUCTION
DEBUG=False
ALLOWED_HOSTS=54.179.120.126,localhost,127.0.0.1,0.0.0.0,elora-backend

# Database Configuration
DATABASE_NAME=elora_db
DATABASE_USER=elora_user
DATABASE_PASSWORD=elora_password_$(openssl rand -hex 16)
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_ROOT_PASSWORD=root_password_$(openssl rand -hex 16)

# Frontend Configuration
FRONTEND_URL=http://54.179.120.126
VITE_API_URL=http://54.179.120.126:8000/api

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://54.179.120.126

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
ENVFILE
    echo ".env file created. Please edit it with your production values."
fi

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 80/tcp || true
sudo ufw allow 8000/tcp || true
sudo ufw allow 22/tcp || true
sudo ufw --force enable || true

# Deploy
echo "Deploying application..."
docker-compose down || true
docker-compose up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Run migrations
echo "Running migrations..."
docker-compose exec -T backend python manage.py migrate || true

# Check status
echo ""
echo "========================================="
echo "Deployment Status"
echo "========================================="
docker-compose ps

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
echo "To create superuser:"
echo "  docker-compose exec backend python manage.py createsuperuser"
echo ""
"@

    # Save deployment script to server
    Write-Host "Creating deployment script on server..." -ForegroundColor Cyan
    $deployScript | & ssh -i $sshKey "${username}@${serverIp}" "cat > ~/deploy-elora.sh && chmod +x ~/deploy-elora.sh"
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Next Steps" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Connect to server:" -ForegroundColor Yellow
    Write-Host "   ssh -i `"$sshKey`" ${username}@${serverIp}" -ForegroundColor Green
    Write-Host ""
    Write-Host "2. Clone your code (if not already cloned):" -ForegroundColor Yellow
    Write-Host "   cd ~" -ForegroundColor Green
    Write-Host "   git clone <your-repo-url> Elora" -ForegroundColor Green
    Write-Host "   cd Elora" -ForegroundColor Green
    Write-Host ""
    Write-Host "3. Run deployment script:" -ForegroundColor Yellow
    Write-Host "   ~/deploy-elora.sh" -ForegroundColor Green
    Write-Host ""
    Write-Host "OR manually deploy:" -ForegroundColor Yellow
    Write-Host "   See DEPLOYMENT_GUIDE.md for detailed steps" -ForegroundColor Green
    Write-Host ""
    
    # Ask if user wants to connect now
    $connect = Read-Host "Do you want to connect to the server now? (y/n)"
    if ($connect -eq "y" -or $connect -eq "Y") {
        Write-Host "Connecting to server..." -ForegroundColor Green
        & ssh -i $sshKey "${username}@${serverIp}"
    }
} else {
    Write-Host "Connection failed!" -ForegroundColor Red
    Write-Host $testConnection -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. SSH key file exists: $sshKey" -ForegroundColor White
    Write-Host "2. Key file permissions are correct" -ForegroundColor White
    Write-Host "3. Server is running and accessible" -ForegroundColor White
    Write-Host "4. Try the other key file: 'My First AWS Launch.pem'" -ForegroundColor White
}

