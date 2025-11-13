# PowerShell Script to Deploy Elora to Server
# This script helps you deploy from Windows to Linux server

$sshKey = "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem"
$serverIp = "54.179.120.126"
$username = "ubuntu"
$server = "${username}@${serverIp}"
$repoUrl = "https://github.com/Coding4DevelopersByShenthuri/Vocario.git"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Elora Deployment Helper" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server: $serverIp" -ForegroundColor Yellow
Write-Host "Repository: $repoUrl" -ForegroundColor Yellow
Write-Host ""

# Check if SSH key exists
if (-not (Test-Path $sshKey)) {
    Write-Host "ERROR: SSH key not found: $sshKey" -ForegroundColor Red
    Write-Host "Please check the path to your SSH key file." -ForegroundColor Yellow
    exit 1
}

Write-Host "SSH key found: $sshKey" -ForegroundColor Green
Write-Host ""

# Test connection
Write-Host "Testing SSH connection..." -ForegroundColor Cyan
$testResult = & ssh -i $sshKey $server "echo 'Connection successful!' && hostname" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connection successful!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Deployment Steps" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Automatic Deployment (Recommended)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This will:" -ForegroundColor Cyan
    Write-Host "  1. Clone your repository to ~/Elora on server" -ForegroundColor White
    Write-Host "  2. Run the deployment script" -ForegroundColor White
    Write-Host "  3. Show deployment status" -ForegroundColor White
    Write-Host ""
    
    $autoDeploy = Read-Host "Do you want to deploy automatically? (y/n)"
    
    if ($autoDeploy -eq "y" -or $autoDeploy -eq "Y") {
        Write-Host ""
        Write-Host "Starting automatic deployment..." -ForegroundColor Cyan
        Write-Host ""
        
        # Deployment commands
        $deployCommands = @"
cd ~
if [ -d Elora ]; then
    echo "Elora directory exists. Updating..."
    cd Elora
    git pull
else
    echo "Cloning repository..."
    git clone $repoUrl Elora
    cd Elora
fi

echo ""
echo "Running deployment script..."
~/deploy-elora.sh

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Create superuser: docker compose exec backend python manage.py createsuperuser"
echo "  2. Check status: docker compose ps"
echo "  3. View logs: docker compose logs -f"
echo "  4. Access: http://54.179.120.126"
echo ""
"@
        
        Write-Host "Deploying to server..." -ForegroundColor Yellow
        $deployCommands | & ssh -i $sshKey $server "bash"
        
    } else {
        Write-Host ""
        Write-Host "Option 2: Manual Deployment" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Connect to server and run these commands:" -ForegroundColor Cyan
        Write-Host "  cd ~" -ForegroundColor Green
        Write-Host "  git clone $repoUrl Elora" -ForegroundColor Green
        Write-Host "  cd Elora" -ForegroundColor Green
        Write-Host "  ~/deploy-elora.sh" -ForegroundColor Green
        Write-Host ""
        
        $connect = Read-Host "Do you want to connect to the server now? (y/n)"
        if ($connect -eq "y" -or $connect -eq "Y") {
            Write-Host "Connecting to server..." -ForegroundColor Green
            Write-Host "After connecting, run the commands above." -ForegroundColor Yellow
            & ssh -i $sshKey $server
        }
    }
} else {
    Write-Host "❌ Connection failed!" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. SSH key file exists: $sshKey" -ForegroundColor White
    Write-Host "  2. Server is running and accessible" -ForegroundColor White
    Write-Host "  3. Firewall allows SSH (port 22)" -ForegroundColor White
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan

