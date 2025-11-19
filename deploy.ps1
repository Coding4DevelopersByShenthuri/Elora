# Elora Deployment Script for Windows PowerShell
# This script helps deploy the Elora project to AWS server

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Elora Project Deployment Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SERVER_IP = "54.179.120.126"
$SERVER_USER = "ubuntu"
$PROJECT_NAME = "elora"

Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Check if SSH is available
try {
    $sshVersion = ssh -V 2>&1
    Write-Host "✓ SSH found" -ForegroundColor Green
} catch {
    Write-Host "✗ SSH is not available. Please install OpenSSH or use Git Bash." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Creating .env file..." -ForegroundColor Yellow

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "⚠ .env file already exists. Skipping creation." -ForegroundColor Yellow
    Write-Host "Please ensure your .env file has the correct values for production." -ForegroundColor Yellow
} else {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created. Please edit it with your production values!" -ForegroundColor Green
    Write-Host "IMPORTANT: Update SECRET_KEY and other sensitive values in .env file!" -ForegroundColor Red
    Write-Host ""
    $continue = Read-Host "Press Enter after you've updated .env file to continue..."
}

Write-Host ""
Write-Host "Step 3: Building Docker images locally (optional test)..." -ForegroundColor Yellow
$buildLocal = Read-Host "Do you want to build Docker images locally first? (y/n)"
if ($buildLocal -eq "y" -or $buildLocal -eq "Y") {
    Write-Host "Building Docker images..." -ForegroundColor Cyan
    docker-compose build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Docker build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Docker images built successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 4: Preparing deployment package..." -ForegroundColor Yellow

# Create deployment archive (excluding unnecessary files)
Write-Host "Creating deployment archive..." -ForegroundColor Cyan
$archiveName = "elora-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz"

# Use tar if available (Windows 10+)
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf $archiveName --exclude='node_modules' --exclude='venv' --exclude='.git' --exclude='dist' --exclude='__pycache__' --exclude='*.pyc' --exclude='.env' .
    Write-Host "✓ Archive created: $archiveName" -ForegroundColor Green
} else {
    Write-Host "⚠ tar command not found. You'll need to manually transfer files or install tar." -ForegroundColor Yellow
    Write-Host "Alternatively, you can use Git to push and pull on the server." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 5: Deployment Instructions" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now you need to connect to your AWS server and deploy:" -ForegroundColor White
Write-Host ""
Write-Host "1. Connect to server:" -ForegroundColor Cyan
Write-Host "   ssh $SERVER_USER@$SERVER_IP" -ForegroundColor White
Write-Host ""
Write-Host "2. On the server, run these commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Update system" -ForegroundColor Gray
Write-Host "   sudo apt update && sudo apt upgrade -y" -ForegroundColor White
Write-Host ""
Write-Host "   # Install Docker and Docker Compose" -ForegroundColor Gray
Write-Host "   curl -fsSL https://get.docker.com -o get-docker.sh" -ForegroundColor White
Write-Host "   sudo sh get-docker.sh" -ForegroundColor White
Write-Host "   sudo usermod -aG docker ubuntu" -ForegroundColor White
Write-Host "   sudo apt install docker-compose-plugin -y" -ForegroundColor White
Write-Host ""
Write-Host "   # Logout and login again for docker group to take effect" -ForegroundColor Gray
Write-Host "   exit" -ForegroundColor White
Write-Host "   ssh $SERVER_USER@$SERVER_IP" -ForegroundColor White
Write-Host ""
Write-Host "   # Create project directory" -ForegroundColor Gray
Write-Host "   mkdir -p ~/$PROJECT_NAME" -ForegroundColor White
Write-Host "   cd ~/$PROJECT_NAME" -ForegroundColor White
Write-Host ""
Write-Host "3. Transfer files from your Windows machine:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # From Windows PowerShell, run:" -ForegroundColor Gray
Write-Host "   scp $archiveName $SERVER_USER@$SERVER_IP:~/$PROJECT_NAME/" -ForegroundColor White
Write-Host "   scp .env $SERVER_USER@$SERVER_IP:~/$PROJECT_NAME/" -ForegroundColor White
Write-Host ""
Write-Host "   # Or use Git (recommended):" -ForegroundColor Gray
Write-Host "   # On server: git clone <your-repo-url> $PROJECT_NAME" -ForegroundColor White
Write-Host ""
Write-Host "4. On the server, extract and deploy:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   cd ~/$PROJECT_NAME" -ForegroundColor White
Write-Host "   tar -xzf $archiveName" -ForegroundColor White
Write-Host "   # Or if using Git: git pull" -ForegroundColor White
Write-Host ""
Write-Host "   # Start services" -ForegroundColor Gray
Write-Host "   docker compose up -d --build" -ForegroundColor White
Write-Host ""
Write-Host "   # Check logs" -ForegroundColor Gray
Write-Host "   docker compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "   # Create superuser (optional)" -ForegroundColor Gray
Write-Host "   docker compose exec backend python manage.py createsuperuser" -ForegroundColor White
Write-Host ""
Write-Host "5. Configure firewall (if needed):" -ForegroundColor Cyan
Write-Host ""
Write-Host "   sudo ufw allow 80/tcp" -ForegroundColor White
Write-Host "   sudo ufw allow 22/tcp" -ForegroundColor White
Write-Host "   sudo ufw enable" -ForegroundColor White
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment instructions displayed above!" -ForegroundColor Green
Write-Host "Your application will be available at: http://$SERVER_IP" -ForegroundColor Green
Write-Host ""

