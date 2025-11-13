# Setup Local MySQL for Docker (No Password)

## Current Status
✅ `.env` file created with local MySQL configuration
✅ Database `elora_db` created in local MySQL
⚠️ Backend is waiting for database connection

## Issue
The backend container cannot connect to your local MySQL. This is likely because:
1. MySQL is only listening on `127.0.0.1` (localhost) and not accepting external connections
2. `host.docker.internal` might not resolve correctly on your system

## Solution Options

### Option 1: Configure MySQL to Accept Docker Connections (Recommended)

1. **Edit MySQL Configuration** (`my.ini` on Windows, usually in `C:\ProgramData\MySQL\MySQL Server X.X\`):

   Find the `[mysqld]` section and add/modify:
   ```ini
   [mysqld]
   bind-address = 0.0.0.0
   ```

2. **Restart MySQL Service**:
   ```powershell
   # Stop MySQL
   net stop MySQL80
   # Start MySQL
   net start MySQL80
   ```
   (Replace `MySQL80` with your MySQL service name)

3. **Grant Permissions** (if needed):
   ```sql
   -- Connect to MySQL
   mysql -u root
   
   -- Grant access from Docker
   GRANT ALL PRIVILEGES ON elora_db.* TO 'root'@'%' IDENTIFIED BY '';
   FLUSH PRIVILEGES;
   ```

### Option 2: Use Your Machine's IP Address

1. **Find your IP address**:
   ```powershell
   ipconfig | Select-String "IPv4"
   ```

2. **Update `.env` file**:
   ```env
   DATABASE_HOST=192.168.1.XXX  # Replace with your actual IP
   ```

3. **Restart backend**:
   ```bash
   docker-compose restart backend
   ```

### Option 3: Use Docker MySQL (Easier)

If local MySQL setup is too complex, use Docker MySQL instead:

1. **Update `.env` file**:
   ```env
   DATABASE_HOST=db
   DATABASE_USER=elora_user
   DATABASE_PASSWORD=elora_password
   ```

2. **Update `docker-compose.yml`**:
   Uncomment the `depends_on` section for backend:
   ```yaml
   depends_on:
     db:
       condition: service_healthy
   ```

3. **Start Docker MySQL**:
   ```bash
   docker-compose up -d db
   docker-compose restart backend
   ```

## Verify Connection

After applying one of the solutions above, verify:

1. **Check backend logs**:
   ```bash
   docker-compose logs backend | Select-String -Pattern "Database is ready|Using MySQL"
   ```

2. **Test database connection**:
   ```bash
   docker-compose exec backend python manage.py dbshell
   # Then in the MySQL prompt:
   SELECT DATABASE();
   # Should return: elora_db
   ```

3. **Check API health**:
   ```bash
   curl http://localhost:8000/api/health
   ```

## Quick Fix: Use Docker MySQL

The easiest solution is to use Docker MySQL with default passwords:

```bash
# 1. Update .env
DATABASE_HOST=db
DATABASE_USER=elora_user
DATABASE_PASSWORD=elora_password

# 2. Uncomment depends_on in docker-compose.yml

# 3. Start services
docker-compose up -d db
docker-compose restart backend

# 4. Run migrations
docker-compose exec backend python manage.py migrate
```

## Troubleshooting

### Connection Timeout
- Check if MySQL is running: `net start | Select-String MySQL`
- Check MySQL port: `netstat -an | Select-String 3306`
- Verify firewall allows connections on port 3306

### Access Denied
- Check user permissions in MySQL
- Verify database exists: `mysql -u root -e "SHOW DATABASES;"`

### Host Not Found
- Try using `172.17.0.1` instead of `host.docker.internal`
- Or use your actual machine IP address

