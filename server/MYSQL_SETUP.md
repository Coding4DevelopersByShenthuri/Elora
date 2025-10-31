# MySQL Setup for Elora

## Your Configuration
- **Database Name**: `elora`
- **User**: `root`
- **Password**: (none)
- **Host**: `localhost`
- **Port**: `3306`

## Quick Start (Windows)

### Option 1: Using the Setup Script
1. Open PowerShell in the `server` folder
2. Run the setup script:
```powershell
.\setup_mysql.bat
```

### Option 2: Manual Setup
Open PowerShell and run:
```powershell
$env:DATABASE_NAME="elora"
$env:DATABASE_USER="root"
$env:DATABASE_PASSWORD=""
$env:DATABASE_HOST="localhost"
$env:DATABASE_PORT="3306"
```

Then navigate to the `server` folder and run:
```powershell
python manage.py migrate
python manage.py runserver
```

## Quick Start (Linux/Mac)

### Option 1: Using the Setup Script
```bash
chmod +x setup_mysql.sh
./setup_mysql.sh
```

### Option 2: Manual Setup
```bash
export DATABASE_NAME=elora
export DATABASE_USER=root
export DATABASE_PASSWORD=
export DATABASE_HOST=localhost
export DATABASE_PORT=3306

python manage.py migrate
python manage.py runserver
```

## Create the Database

Before running migrations, make sure the MySQL database exists:

```bash
# Connect to MySQL
mysql -u root

# Create the database
CREATE DATABASE IF NOT EXISTS elora;

# Exit MySQL
exit;
```

Or in one command:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS elora;"
```

## Verify MySQL is Running

**Windows**:
```powershell
# Check if MySQL service is running
Get-Service -Name MySQL*
```

**Linux/Mac**:
```bash
# Check if MySQL is running
systemctl status mysql
# or
brew services list | grep mysql
```

## Running the Server

Once environment variables are set:

```bash
cd server

# Create database tables
python manage.py migrate

# Start the server
python manage.py runserver
```

The server will automatically use MySQL when these environment variables are set.

## Switching Back to SQLite

To switch back to SQLite for development:
```bash
# Windows PowerShell
$env:DATABASE_NAME=""
$env:DATABASE_USER=""

# Linux/Mac
unset DATABASE_NAME
unset DATABASE_USER
```

Then restart the server.

## Installation Requirements

If you get MySQL connection errors, install the MySQL client:

**Windows**:
```bash
pip install mysqlclient==2.2.0
```

**Linux**:
```bash
# Install MySQL development headers
sudo apt-get install python3-dev libmysqlclient-dev

# Install Python package
pip install mysqlclient
```

**Mac**:
```bash
# Install MySQL development headers
brew install mysql pkg-config

# Install Python package
pip install mysql-connector-python==8.3.0
```

## Troubleshooting

### Error: "Can't connect to MySQL server"
1. Make sure MySQL is running
2. Check that MySQL is listening on port 3306
3. Verify the host is `localhost` or `127.0.0.1`

### Error: "Access denied for user 'root'@'localhost'"
- Try using password: `root` or your MySQL root password
- Or create a new MySQL user with full privileges

### Error: "No module named '_mysql'"
Install the MySQL Python package:
```bash
pip install mysqlclient  # or pip install mysql-connector-python
```

## Permanent Setup (Optional)

To make these settings permanent:

**Windows**:
1. Open System Properties → Environment Variables
2. Add new variables:
   - `DATABASE_NAME` = `elora`
   - `DATABASE_USER` = `root`
   - `DATABASE_PASSWORD` = (leave empty)

**Linux/Mac**:
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export DATABASE_NAME=elora
export DATABASE_USER=root
export DATABASE_PASSWORD=
export DATABASE_HOST=localhost
export DATABASE_PORT=3306
```

Then reload:
```bash
source ~/.bashrc
```

