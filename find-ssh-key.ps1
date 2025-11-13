# Script to help find SSH key files

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Finding SSH Key Files" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Common locations for SSH keys
$searchPaths = @(
    "$env:USERPROFILE\.ssh",
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\Documents"
)

Write-Host "Searching for SSH key files (.pem, .ppk, .key)..." -ForegroundColor Yellow
Write-Host ""

$foundKeys = @()

foreach ($path in $searchPaths) {
    if (Test-Path $path) {
        Write-Host "Searching in: $path" -ForegroundColor Gray
        $keys = Get-ChildItem -Path $path -Include *.pem,*.ppk,*.key -Recurse -ErrorAction SilentlyContinue
        if ($keys) {
            foreach ($key in $keys) {
                $foundKeys += $key
                Write-Host "  Found: $($key.FullName)" -ForegroundColor Green
            }
        }
    }
}

Write-Host ""
if ($foundKeys.Count -eq 0) {
    Write-Host "No SSH key files found in common locations." -ForegroundColor Red
    Write-Host ""
    Write-Host "You may need to:" -ForegroundColor Yellow
    Write-Host "1. Download the key file from your cloud provider (AWS, DigitalOcean, etc.)" -ForegroundColor White
    Write-Host "2. Check your email for the key file" -ForegroundColor White
    Write-Host "3. Contact your server administrator for the key file" -ForegroundColor White
    Write-Host "4. Or enable password authentication on the server" -ForegroundColor White
} else {
    Write-Host "Found $($foundKeys.Count) SSH key file(s):" -ForegroundColor Green
    Write-Host ""
    foreach ($key in $foundKeys) {
        Write-Host "  $($key.FullName)" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "To connect to the server, use:" -ForegroundColor Yellow
    Write-Host "  ssh -i `"$($foundKeys[0].FullName)`" ubuntu@54.179.120.126" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan

