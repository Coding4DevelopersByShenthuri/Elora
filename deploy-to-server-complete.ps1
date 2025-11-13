# Complete Deployment Script for Elora
# Server: 54.179.120.126
# Username: ubuntu

$sshKey = "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem"
$serverIp = "54.179.120.126"
$username = "ubuntu"
$serverUser = "${username}@${serverIp}"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Elora Complete Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Server: $serverIp" -ForegroundColor Yellow
Write-Host "Username: $username" -ForegroundColor Yellow
Write-Host ""

# Step 1: Install Docker on Server
Write-Host "Step 1: Installing Docker on server..." -ForegroundColor Cyan
$installDocker = @"
#!/bin/bash
set -e

echo "Updating package list..."
sudo apt-get update

echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

echo "Installing Docker Compose plugin..."
sudo apt-get install -y docker-compose-plugin

echo "Adding user to docker group..."
sudo usermod -aG docker ubuntu

echo "Verifying Docker installation..."
docker --version
docker compose version

echo "Docker installation complete!"
"@

$installDocker | & ssh -i $sshKey $serverUser "bash"
Write-Host "Docker installation completed!" -ForegroundColor Green
Write-Host ""

# Step 2: Prepare code for transfer
Write-Host "Step 2: Preparing code for transfer..." -ForegroundColor Cyan

# Check if Git is available
$hasGit = Get-Command git -ErrorAction SilentlyContinue
if ($hasGit) {
    Write-Host "Git is available. You can clone your repository on the server." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To deploy via Git:" -ForegroundColor Cyan
    Write-Host "  1. Push your code to Git repository" -ForegroundColor White
    Write-Host "  2. On server, run: git clone <your-repo-url> Elora" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Git not found. Preparing to copy files via SCP..." -ForegroundColor Yellow
}

# Step 3: Create deployment script on server
Write-Host "Step 3: Creating deployment script on server..." -ForegroundColor Cyan

$deployScript = @"
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
    cat > .env << 'ENVFILE'
# Django Settings
SECRET_KEY=django-insecure-CHANGE-THIS-GENERATE-NEW-KEY
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
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=
ENVFILE
    echo ".env file created!"
    echo ""
    echo "IMPORTANT: Update SECRET_KEY in .env file!"
    echo "Generate new key: python3 -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\""
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
docker-compose down || true

echo "Building and starting containers..."
docker-compose up -d --build

echo "Waiting for services to start..."
sleep 15

echo "Running migrations..."
docker-compose exec -T backend python manage.py migrate || echo "Migration may have failed, check logs"

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
echo "Next steps:"
echo "  1. Check logs: docker-compose logs -f"
echo "  2. Create superuser: docker-compose exec backend python manage.py createsuperuser"
echo "  3. Update SECRET_KEY in .env file"
echo ""
"@

$deployScript | & ssh -i $sshKey $serverUser "cat > ~/deploy-elora.sh && chmod +x ~/deploy-elora.sh"
Write-Host "Deployment script created on server!" -ForegroundColor Green
Write-Host ""

# Step 4: Instructions
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Transfer your code to the server:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Option A: Using Git (Recommended)" -ForegroundColor Green
Write-Host "   Connect to server:" -ForegroundColor White
Write-Host "     ssh -i `"$sshKey`" $serverUser" -ForegroundColor Cyan
Write-Host ""
Write-Host "   On server, run:" -ForegroundColor White
Write-Host "     cd ~" -ForegroundColor Cyan
Write-Host "     git clone <your-repo-url> Elora" -ForegroundColor Cyan
Write-Host "     cd Elora" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Option B: Using SCP (if no Git)" -ForegroundColor Green
Write-Host "   From your local machine:" -ForegroundColor White
Write-Host "     # Create tar archive (exclude large files)" -ForegroundColor Cyan
Write-Host "     tar --exclude='node_modules' --exclude='venv' --exclude='.git' --exclude='dist' -czf elora.tar.gz ." -ForegroundColor Cyan
Write-Host ""
Write-Host "     # Copy to server" -ForegroundColor Cyan
Write-Host "     scp -i `"$sshKey`" elora.tar.gz ${serverUser}:~/" -ForegroundColor Cyan
Write-Host ""
Write-Host "   On server:" -ForegroundColor White
Write-Host "     mkdir -p ~/Elora" -ForegroundColor Cyan
Write-Host "     tar -xzf elora.tar.gz -C ~/Elora" -ForegroundColor Cyan
Write-Host "     cd ~/Elora" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Run deployment script:" -ForegroundColor Yellow
Write-Host "   ~/deploy-elora.sh" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. After deployment:" -ForegroundColor Yellow
Write-Host "   - Update SECRET_KEY in .env file" -ForegroundColor White
Write-Host "   - Create superuser: docker-compose exec backend python manage.py createsuperuser" -ForegroundColor White
Write-Host "   - Check logs: docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to connect now
$connect = Read-Host "Do you want to connect to the server now? (y/n)"
if ($connect -eq "y" -or $connect -eq "Y") {
    Write-Host "Connecting to server..." -ForegroundColor Green
    Write-Host "After connecting, run: ~/deploy-elora.sh" -ForegroundColor Yellow
    & ssh -i $sshKey $serverUser
}

