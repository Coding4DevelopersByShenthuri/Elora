@echo off
REM Setup MySQL database configuration for Elora
REM This will configure Django to use MySQL instead of SQLite

echo ============================================
echo Elora MySQL Database Setup
echo ============================================
echo.

REM Set MySQL environment variables
set DATABASE_NAME=elora
set DATABASE_USER=root
set DATABASE_PASSWORD=
set DATABASE_HOST=localhost
set DATABASE_PORT=3306

echo Database configured:
echo   Name: %DATABASE_NAME%
echo   User: %DATABASE_USER%
echo   Password: (none)
echo   Host: %DATABASE_HOST%
echo   Port: %DATABASE_PORT%
echo.

echo These environment variables are now set for this terminal session.
echo To make them permanent, add them to your Windows environment variables.
echo.

echo To start using MySQL:
echo   1. Make sure MySQL is running
echo   2. Create the database if it doesn't exist:
echo      mysql -u root -e "CREATE DATABASE IF NOT EXISTS elora;"
echo   3. Run migrations:
echo      python manage.py migrate
echo   4. Start the server:
echo      python manage.py runserver
echo.

pause

