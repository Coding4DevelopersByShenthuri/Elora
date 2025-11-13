# PowerShell Script to Deploy Elora to Server
# Server: 54.179.120.126
# Username: ubuntu

param(
    [string]$SshKeyPath = "",
    [string]$ServerIp = "54.179.120.126",
    [string]$Username = "ubuntu"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Elora Deployment to Server" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if SSH key is provided
if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
    Write-Host "Using SSH key: $SshKeyPath" -ForegroundColor Green
    $sshCommand = "ssh -i `"$SshKeyPath`" ${Username}@${ServerIp}"
} else {
    Write-Host "Connecting without SSH key (password authentication)" -ForegroundColor Yellow
    $sshCommand = "ssh ${Username}@${ServerIp}"
}

Write-Host ""
Write-Host "Step 1: Connect to Server" -ForegroundColor Cyan
Write-Host "Command: $sshCommand" -ForegroundColor Yellow
Write-Host ""
Write-Host "After connecting, run these commands on the server:" -ForegroundColor Cyan
Write-Host ""
Write-Host "# 1. Install Docker (if not installed)" -ForegroundColor Green
Write-Host "curl -fsSL https://get.docker.com -o get-docker.sh"
Write-Host "sudo sh get-docker.sh"
Write-Host "sudo apt-get install docker-compose-plugin"
Write-Host ""
Write-Host "# 2. Clone or upload your code" -ForegroundColor Green
Write-Host "cd ~"
Write-Host "git clone <your-repo-url> Elora"
Write-Host "cd Elora"
Write-Host ""
Write-Host "# 3. Create .env file" -ForegroundColor Green
Write-Host "nano .env"
Write-Host "# Use the template from env.example"
Write-Host ""
Write-Host "# 4. Configure firewall" -ForegroundColor Green
Write-Host "sudo ufw allow 80/tcp"
Write-Host "sudo ufw allow 8000/tcp"
Write-Host "sudo ufw reload"
Write-Host ""
Write-Host "# 5. Deploy" -ForegroundColor Green
Write-Host "docker-compose up -d --build"
Write-Host "docker-compose exec backend python manage.py migrate"
Write-Host "docker-compose exec backend python manage.py createsuperuser"
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to connect now
$connect = Read-Host "Do you want to connect to the server now? (y/n)"
if ($connect -eq "y" -or $connect -eq "Y") {
    Write-Host "Connecting to server..." -ForegroundColor Green
    Invoke-Expression $sshCommand
} else {
    Write-Host "You can connect manually using:" -ForegroundColor Yellow
    Write-Host $sshCommand -ForegroundColor Cyan
}

