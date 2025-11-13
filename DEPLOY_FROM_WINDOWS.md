# Deploy from Windows to Server

## Important: Two-Step Process

The deployment script (`~/deploy-elora.sh`) is a **bash script** that runs on the **Linux server**, not on Windows!

## Step 1: From Your Windows Machine (Local)

### 1.1 Commit and Push Code

```powershell
# Make sure you're in the project directory
cd C:\Users\shent\OneDrive\Desktop\Elora

# Commit changes
git add .
git commit -m "Production deployment with Docker"

# Push to repository
git push
```

## Step 2: Connect to Server (Linux)

### 2.1 SSH to Server

```powershell
# From Windows PowerShell
ssh -i "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem" ubuntu@54.179.120.126
```

**After connecting, you'll be in a Linux bash shell on the server!**

## Step 3: On Server (Linux) - Deploy

### 3.1 Clone Your Code

```bash
# On the server (Linux bash)
cd ~
git clone https://github.com/Coding4DevelopersByShenthuri/Vocario.git Elora
cd Elora
```

### 3.2 Run Deployment Script

```bash
# On the server (Linux bash)
~/deploy-elora.sh
```

**This script runs on Linux, not Windows!**

## Quick Reference

### From Windows (PowerShell):
```powershell
# 1. Commit and push
git add .
git commit -m "Production deployment"
git push

# 2. Connect to server
ssh -i "C:\Users\shent\Downloads\id_2025_11_01_intern_3.pem" ubuntu@54.179.120.126
```

### On Server (Linux Bash):
```bash
# 1. Clone code
cd ~
git clone https://github.com/Coding4DevelopersByShenthuri/Vocario.git Elora
cd Elora

# 2. Deploy
~/deploy-elora.sh

# 3. Create superuser
docker compose exec backend python manage.py createsuperuser
```

## Why the Error?

You tried to run `~/deploy-elora.sh` in PowerShell on Windows. This script is:
- A **bash script** (`.sh` file)
- Designed to run on **Linux**
- Needs to be executed on the **server**, not your local Windows machine

## Solution

1. **Commit and push from Windows** (PowerShell)
2. **SSH to server** (PowerShell command connects you to Linux)
3. **Run script on server** (Linux bash shell)

## Alternative: Automated Deployment Script

If you want to automate this from Windows, you can use:

```powershell
# Run from Windows PowerShell
.\transfer-code-to-server.ps1
```

This script will:
1. Help you commit and push code
2. Help you copy files to server
3. Connect you to the server

