# Script to Transfer Code to Server
# Server: 54.179.120.126
# Username: ubuntu

$sshKey = "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem"
$serverIp = "54.179.120.126"
$username = "ubuntu"
$server = "${username}@${serverIp}"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Transfer Code to Server" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is available
$hasGit = Get-Command git -ErrorAction SilentlyContinue

if ($hasGit) {
    Write-Host "Git is available!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Option 1: Using Git (Recommended)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Make sure your code is pushed to Git repository:" -ForegroundColor Cyan
    Write-Host "   git add ." -ForegroundColor White
    Write-Host "   git commit -m 'Production deployment'" -ForegroundColor White
    Write-Host "   git push" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Connect to server and clone:" -ForegroundColor Cyan
    Write-Host "   ssh -i `"$sshKey`" $server" -ForegroundColor Green
    Write-Host "   cd ~" -ForegroundColor Green
    Write-Host "   git clone <your-repo-url> Elora" -ForegroundColor Green
    Write-Host "   cd Elora" -ForegroundColor Green
    Write-Host "   ~/deploy-elora.sh" -ForegroundColor Green
    Write-Host ""
    
    $useGit = Read-Host "Do you want to push to Git now? (y/n)"
    if ($useGit -eq "y" -or $useGit -eq "Y") {
        Write-Host "Checking git status..." -ForegroundColor Cyan
        git status
        Write-Host ""
        $push = Read-Host "Do you want to commit and push? (y/n)"
        if ($push -eq "y" -or $push -eq "Y") {
            git add .
            $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
            if ([string]::IsNullOrWhiteSpace($commitMsg)) {
                $commitMsg = "Production deployment"
            }
            git commit -m $commitMsg
            git push
            Write-Host "Code pushed to Git!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Now connect to server and clone:" -ForegroundColor Yellow
            Write-Host "  ssh -i `"$sshKey`" $server" -ForegroundColor Green
            Write-Host "  cd ~" -ForegroundColor Green
            Write-Host "  git clone <your-repo-url> Elora" -ForegroundColor Green
            Write-Host "  cd Elora" -ForegroundColor Green
            Write-Host "  ~/deploy-elora.sh" -ForegroundColor Green
        }
    }
} else {
    Write-Host "Git not found. Using SCP to copy files..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Option 2: Using SCP (Copy Files Directly)" -ForegroundColor Yellow
Write-Host ""

$useSCP = Read-Host "Do you want to copy files via SCP now? (y/n)"
if ($useSCP -eq "y" -or $useSCP -eq "Y") {
    Write-Host "Creating archive (excluding large files)..." -ForegroundColor Cyan
    
    # Check if tar is available (Windows 10+ has it)
    $hasTar = Get-Command tar -ErrorAction SilentlyContinue
    
    if ($hasTar) {
        # Create archive excluding large files
        Write-Host "Creating elora.tar.gz..." -ForegroundColor Cyan
        tar --exclude='node_modules' --exclude='venv' --exclude='.git' --exclude='dist' --exclude='*.log' --exclude='.docker' -czf elora.tar.gz . 2>&1 | Out-Null
        
        if (Test-Path elora.tar.gz) {
            Write-Host "Archive created successfully!" -ForegroundColor Green
            $fileSize = (Get-Item elora.tar.gz).Length / 1MB
            Write-Host "File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Copying to server..." -ForegroundColor Cyan
            
            # Copy to server
            scp -i $sshKey elora.tar.gz "${server}:~/"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Files copied successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Now on the server, run:" -ForegroundColor Yellow
                Write-Host "  ssh -i `"$sshKey`" $server" -ForegroundColor Green
                Write-Host "  mkdir -p ~/Elora" -ForegroundColor Green
                Write-Host "  cd ~/Elora" -ForegroundColor Green
                Write-Host "  tar -xzf ~/elora.tar.gz" -ForegroundColor Green
                Write-Host "  ~/deploy-elora.sh" -ForegroundColor Green
                
                # Ask if user wants to connect now
                $connect = Read-Host "`nDo you want to connect to server and extract files now? (y/n)"
                if ($connect -eq "y" -or $connect -eq "Y") {
                    Write-Host "Connecting to server..." -ForegroundColor Green
                    $extractCommands = @"
mkdir -p ~/Elora
cd ~/Elora
tar -xzf ~/elora.tar.gz
ls -la
echo ""
echo "Files extracted! Now run: ~/deploy-elora.sh"
"@
                    $extractCommands | & ssh -i $sshKey $server "bash"
                }
            } else {
                Write-Host "Failed to copy files. Please check your connection." -ForegroundColor Red
            }
        } else {
            Write-Host "Failed to create archive." -ForegroundColor Red
        }
    } else {
        Write-Host "tar command not found. Please install it or use Git instead." -ForegroundColor Red
        Write-Host "You can install tar on Windows or use WSL." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Connect to server:" -ForegroundColor Yellow
Write-Host "   ssh -i `"$sshKey`" $server" -ForegroundColor Green
Write-Host ""
Write-Host "2. Make sure code is in ~/Elora directory" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Run deployment script:" -ForegroundColor Yellow
Write-Host "   cd ~/Elora" -ForegroundColor Green
Write-Host "   ~/deploy-elora.sh" -ForegroundColor Green
Write-Host ""
Write-Host "4. After deployment, access your site at:" -ForegroundColor Yellow
Write-Host "   http://54.179.120.126" -ForegroundColor Green
Write-Host "   http://54.179.120.126:8000/api" -ForegroundColor Green
Write-Host ""
Write-Host "See DEPLOY_NOW.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""

