#!/bin/bash
set -e

echo "Waiting for database to be ready..."
DB_HOST="${DATABASE_HOST:-db}"
DB_PORT="${DATABASE_PORT:-3306}"

# Wait for MySQL to be ready using socket connection
python << PYTHON_SCRIPT
import socket
import sys
import time

def check_db():
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(('${DB_HOST}', ${DB_PORT}))
        sock.close()
        return result == 0
    except Exception as e:
        return False

max_attempts = 30
attempt = 0
while not check_db() and attempt < max_attempts:
    print(f'Database is unavailable - sleeping (attempt {attempt + 1}/{max_attempts})')
    time.sleep(2)
    attempt += 1

if attempt >= max_attempts:
    print('ERROR: Database connection failed after maximum attempts')
    sys.exit(1)

print('Database is ready!')
PYTHON_SCRIPT

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear || true

echo "Starting server..."
exec "$@"

