# PowerShell script to create .env file for local MySQL (no password)

$envContent = @"
# Django Settings
SECRET_KEY=django-insecure-wo(!w-s!_(hlg6grj0d04ey^ef*h`$4o2r*_v*&a33kn4`$v@d01
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,elora-backend,54.179.120.126

# Database Configuration - Using LOCAL MySQL (no password)
DATABASE_NAME=elora_db
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_HOST=host.docker.internal
DATABASE_PORT=3306

# Frontend Configuration
FRONTEND_URL=http://localhost:8080
VITE_API_URL=http://localhost:8000/api

# CORS Configuration (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000,http://localhost:5173,http://54.179.120.126

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Create the database in your local MySQL:"
Write-Host "   mysql -u root -e 'CREATE DATABASE elora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'"
Write-Host ""
Write-Host "2. Restart the backend:"
Write-Host "   docker-compose restart backend"
Write-Host ""
Write-Host "3. Run migrations:"
Write-Host "   docker-compose exec backend python manage.py migrate"

