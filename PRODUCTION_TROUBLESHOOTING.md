# Production Login & Registration Troubleshooting Guide

## Problem Summary
Users cannot create accounts or login at http://54.179.120.126/

## Root Causes & Solutions

### 1. Email Verification Required (MOST LIKELY ISSUE)

**Problem:** The system requires email verification before users can login. If email service isn't configured, users can register but cannot verify their accounts.

**Check:**
```bash
# SSH into your server
ssh ubuntu@54.179.120.126

# Check if email is configured in .env
cd /home/ubuntu/Elora/server
cat .env | grep EMAIL
```

**Required Email Settings:**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Gmail App Password, NOT regular password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

**Solution A: Configure Gmail SMTP (Recommended)**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an "App Password" for mail
4. Use that app password in `EMAIL_HOST_PASSWORD`

**Solution B: Temporarily Disable Email Verification (Quick Fix)**
If you need users to login immediately, you can manually activate accounts:

```bash
# SSH into server
cd /home/ubuntu/Elora/server
source venv/bin/activate

# Activate a user manually (replace email@example.com with actual email)
python manage.py shell
```

```python
from django.contrib.auth.models import User
user = User.objects.get(email='email@example.com')
user.is_active = True
user.save()
exit()
```

**Solution C: Use Console Email Backend (Development Only)**
For testing, you can see emails in console:
```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

---

### 2. CORS Configuration Issue

**Problem:** Frontend cannot communicate with backend API due to CORS restrictions.

**Check:**
```bash
cd /home/ubuntu/Elora/server
cat .env | grep CORS
```

**Fix:**
```env
CORS_ALLOWED_ORIGINS=http://54.179.120.126
```

**Restart services:**
```bash
sudo systemctl restart elora
sudo systemctl restart nginx
```

---

### 3. Frontend API URL Configuration

**Problem:** Frontend doesn't know where the backend API is located.

**Check:**
```bash
cd /home/ubuntu/Elora/client
cat .env.production  # or check if VITE_API_URL is set
```

**Fix:**
Create or update `.env.production` in the client directory:
```env
VITE_API_URL=http://54.179.120.126/api
VITE_API_BASE=http://54.179.120.126
```

**Rebuild frontend:**
```bash
cd /home/ubuntu/Elora/client
npm run build
sudo systemctl restart nginx
```

---

### 4. Database Connection Issues

**Problem:** Backend cannot connect to MySQL database.

**Check:**
```bash
# Test database connection
cd /home/ubuntu/Elora/server
source venv/bin/activate
python manage.py dbshell
```

**Verify .env database settings:**
```env
DATABASE_NAME=elora
DATABASE_USER=elora
DATABASE_PASSWORD=your_password_here
DATABASE_HOST=localhost
DATABASE_PORT=3306
```

**Check MySQL is running:**
```bash
sudo systemctl status mysql
```

**Check database exists:**
```bash
sudo mysql -u root -p
```
```sql
SHOW DATABASES;
USE elora;
SHOW TABLES;
```

---

### 5. Backend Service Not Running

**Problem:** Gunicorn service might not be running or crashed.

**Check status:**
```bash
sudo systemctl status elora
```

**Check logs:**
```bash
# Recent errors
sudo journalctl -u elora -n 50 --no-pager

# Real-time logs
sudo journalctl -u elora -f

# Application logs
tail -f /home/ubuntu/Elora/server/logs/error.log
tail -f /home/ubuntu/Elora/server/debug.log
```

**Restart service:**
```bash
sudo systemctl restart elora
sudo systemctl status elora
```

---

### 6. Nginx Configuration Issues

**Problem:** Nginx might not be properly routing requests.

**Check Nginx status:**
```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
```

**Check Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**Verify Nginx config:**
```bash
sudo cat /etc/nginx/sites-available/elora
```

**Restart Nginx:**
```bash
sudo systemctl restart nginx
```

---

### 7. Environment Variables Not Loaded

**Problem:** Backend might not be reading .env file correctly.

**Check .env file location:**
```bash
cd /home/ubuntu/Elora/server
ls -la .env  # Should exist
cat .env    # Check contents
```

**Verify settings are loaded:**
```bash
cd /home/ubuntu/Elora/server
source venv/bin/activate
python manage.py shell
```

```python
from django.conf import settings
print(settings.EMAIL_HOST_USER)
print(settings.DATABASE_NAME)
print(settings.CORS_ALLOWED_ORIGINS)
exit()
```

---

## Step-by-Step Diagnostic Process

### Step 1: Check Backend Health
```bash
curl http://54.179.120.126/api/health
```

Expected response: `{"status": "ok"}`

### Step 2: Test Registration Endpoint
```bash
curl -X POST http://54.179.120.126/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpassword123",
    "confirm_password": "testpassword123"
  }'
```

**Check response:**
- If 201: Registration successful, check email
- If 400: Validation error, check error message
- If 500: Server error, check logs

### Step 3: Test Login Endpoint
```bash
curl -X POST http://54.179.120.126/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Check response:**
- If 200: Login successful
- If 401 with "Please verify your email": User needs to verify email
- If 401 with "Invalid email or password": Wrong credentials

### Step 4: Check Browser Console
1. Open http://54.179.120.126 in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Try to register/login
5. Check for errors:
   - CORS errors
   - Network errors
   - API connection errors

### Step 5: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to register/login
4. Check the API request:
   - Status code
   - Response body
   - Request URL

---

## Quick Fix Checklist

Run these commands in order:

```bash
# 1. SSH into server
ssh ubuntu@54.179.120.126

# 2. Check backend service
sudo systemctl status elora

# 3. Check backend logs
sudo journalctl -u elora -n 50 --no-pager

# 4. Check email configuration
cd /home/ubuntu/Elora/server
cat .env | grep EMAIL

# 5. Test database connection
source venv/bin/activate
python manage.py check --database default

# 6. Check CORS settings
cat .env | grep CORS

# 7. Restart services
sudo systemctl restart elora
sudo systemctl restart nginx

# 8. Test API endpoint
curl http://54.179.120.126/api/health
```

---

## Common Error Messages & Solutions

### "Please verify your email before logging in"
**Solution:** User needs to click verification link in email, OR manually activate account (see Solution B above)

### "Invalid email or password"
**Possible causes:**
- Wrong credentials
- User account is inactive (not verified)
- Password hash mismatch

**Solution:** Check if user exists and is active:
```bash
python manage.py shell
```
```python
from django.contrib.auth.models import User
user = User.objects.get(email='user@example.com')
print(f"Active: {user.is_active}")
print(f"Email: {user.email}")
```

### "This email is already registered"
**Solution:** User exists but might be inactive. Check:
```bash
python manage.py shell
```
```python
from django.contrib.auth.models import User
user = User.objects.get(email='user@example.com')
user.is_active = True
user.save()
```

### CORS Error in Browser Console
**Solution:** Update CORS_ALLOWED_ORIGINS in .env and restart:
```env
CORS_ALLOWED_ORIGINS=http://54.179.120.126
```

### 502 Bad Gateway
**Solution:** Backend service is down:
```bash
sudo systemctl restart elora
sudo systemctl status elora
```

### 500 Internal Server Error
**Solution:** Check backend logs:
```bash
sudo journalctl -u elora -n 100 --no-pager
tail -f /home/ubuntu/Elora/server/debug.log
```

---

## Emergency Workaround: Manual Account Activation

If you need to activate accounts immediately without email:

```bash
cd /home/ubuntu/Elora/server
source venv/bin/activate
python manage.py shell
```

```python
from django.contrib.auth.models import User

# Activate a specific user
user = User.objects.get(email='user@example.com')
user.is_active = True
user.save()
print(f"User {user.email} activated!")

# Or activate all inactive users (USE WITH CAUTION)
# User.objects.filter(is_active=False).update(is_active=True)
```

---

## Production Environment Checklist

Ensure these are configured:

- [ ] `.env` file exists in `/home/ubuntu/Elora/server/`
- [ ] `SECRET_KEY` is set (not default)
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` includes `54.179.120.126`
- [ ] Database credentials are correct
- [ ] Email settings are configured (or email verification disabled)
- [ ] `CORS_ALLOWED_ORIGINS` includes production URL
- [ ] Frontend `.env.production` has correct `VITE_API_URL`
- [ ] Gunicorn service is running
- [ ] Nginx is running and configured correctly
- [ ] MySQL is running
- [ ] Database migrations are applied
- [ ] Static files are collected

---

## Next Steps

1. **Immediate:** Check email configuration and backend logs
2. **Short-term:** Configure email service properly
3. **Long-term:** Set up proper email service (SendGrid, AWS SES, etc.)
4. **Security:** Enable HTTPS with Let's Encrypt

---

## Getting Help

If issues persist, collect this information:

```bash
# System info
sudo systemctl status elora
sudo systemctl status nginx
sudo systemctl status mysql

# Recent logs
sudo journalctl -u elora -n 100 --no-pager > elora_logs.txt
tail -n 100 /home/ubuntu/Elora/server/debug.log > debug_log.txt

# Configuration (remove sensitive data)
cat /home/ubuntu/Elora/server/.env | grep -v PASSWORD > config.txt

# Test API
curl -v http://54.179.120.126/api/health > api_test.txt
```

Send these files for troubleshooting.

