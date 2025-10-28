#!/bin/bash

# Setup MySQL database configuration for Elora
# This will configure Django to use MySQL instead of SQLite

echo "============================================"
echo "Elora MySQL Database Setup"
echo "============================================"
echo ""

# Set MySQL environment variables
export DATABASE_NAME=elora
export DATABASE_USER=root
export DATABASE_PASSWORD=
export DATABASE_HOST=localhost
export DATABASE_PORT=3306

echo "Database configured:"
echo "  Name: $DATABASE_NAME"
echo "  User: $DATABASE_USER"
echo "  Password: (none)"
echo "  Host: $DATABASE_HOST"
echo "  Port: $DATABASE_PORT"
echo ""

echo "Environment variables set for this session."
echo ""

echo "To start using MySQL:"
echo "  1. Make sure MySQL is running"
echo "  2. Create the database if it doesn't exist:"
echo "     mysql -u root -e 'CREATE DATABASE IF NOT EXISTS elora;'"
echo "  3. Run migrations:"
echo "     python manage.py migrate"
echo "  4. Start the server:"
echo "     python manage.py runserver"
echo ""

read -p "Press enter to continue..."

