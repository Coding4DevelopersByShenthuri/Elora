# Setup for Local MySQL Database (No Password)

If you want to use your local MySQL database instead of the Docker MySQL container, follow these steps:

## Step 1: Create .env File

Create a `.env` file in the project root with the following content:

```env
# Django Settings
SECRET_KEY=django-insecure-wo(!w-s!_(hlg6grj0d04ey^ef*h$4o2r*_v*&a33kn4$v@d01
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
```

## Step 2: Create Database in Local MySQL

Connect to your local MySQL and create the database:

```sql
CREATE DATABASE elora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or using MySQL command line:
```bash
mysql -u root -e "CREATE DATABASE elora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Step 3: Stop Docker MySQL (Optional)

If you're using local MySQL, you can stop the Docker MySQL container:

```bash
docker-compose stop db
```

Or comment out the `db` service in `docker-compose.yml`.

## Step 4: Restart Backend

```bash
docker-compose restart backend
```

## Step 5: Run Migrations

```bash
docker-compose exec backend python manage.py migrate
```

## Troubleshooting

### Connection Refused
If you get connection refused errors:
- Make sure your local MySQL is running
- Check that MySQL allows connections from Docker containers
- On Windows, `host.docker.internal` should work automatically
- On Linux/Mac, you might need to use `172.17.0.1` or your host IP

### Access Denied
If you get access denied:
- Verify the MySQL user (usually `root`) has no password
- Check that the user has permissions to access the database:
  ```sql
  GRANT ALL PRIVILEGES ON elora_db.* TO 'root'@'%';
  FLUSH PRIVILEGES;
  ```

### Port Already in Use
If port 3306 is already in use by your local MySQL, the Docker MySQL won't start - which is fine if you're using local MySQL.

## Switch Back to Docker MySQL

If you want to use Docker MySQL instead:
1. Update `.env`:
   ```env
   DATABASE_HOST=db
   DATABASE_USER=elora_user
   DATABASE_PASSWORD=elora_password
   ```
2. Uncomment `depends_on` in `docker-compose.yml`
3. Start the database service:
   ```bash
   docker-compose up -d db
   docker-compose restart backend
   ```

