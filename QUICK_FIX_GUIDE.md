# Quick Fix Guide - Production Login/Registration Issues

## 🚨 Most Likely Issue: Email Verification

Your system requires email verification before users can login. If email isn't configured, users can register but **cannot login** until they verify.

### Quick Fix Options:

#### Option 1: Configure Email (Recommended - 5 minutes)

SSH into your server and edit the `.env` file:

```bash
ssh ubuntu@54.179.120.126
cd /home/ubuntu/Elora/server
nano .env
```

Add/update these lines:
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

**To get Gmail App Password:**
1. Go to https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not enabled)
3. App passwords → Generate app password
4. Use that password (not your regular Gmail password)

**Restart backend:**
```bash
sudo systemctl restart elora
```

#### Option 2: Manually Activate User (Immediate Fix - 2 minutes)

If you need to activate a specific user right now:

```bash
ssh ubuntu@54.179.120.126
cd /home/ubuntu/Elora/server
source venv/bin/activate
python manage.py shell
```

Then run:
```python
from django.contrib.auth.models import User
user = User.objects.get(email='user@example.com')  # Replace with actual email
user.is_active = True
user.save()
print(f"User {user.email} activated!")
exit()
```

---

## 🔍 Run Diagnostic Script

I've created a diagnostic script. Run it on your server:

```bash
ssh ubuntu@54.179.120.126
cd /home/ubuntu/Elora/server
bash diagnose_production.sh
```

This will check:
- ✅ Services running (Gunicorn, Nginx, MySQL)
- ✅ Email configuration
- ✅ Database connection
- ✅ CORS settings
- ✅ API health
- ✅ Recent errors

---

## 📋 Common Issues Checklist

### Issue 1: "Please verify your email before logging in"
**Cause:** Email verification required but email not sent  
**Fix:** Configure email (Option 1 above) OR manually activate user (Option 2)

### Issue 2: CORS Error in Browser
**Fix:**
```bash
cd /home/ubuntu/Elora/server
nano .env
```
Add:
```env
CORS_ALLOWED_ORIGINS=http://54.179.120.126
```
```bash
sudo systemctl restart elora
```

### Issue 3: Frontend Can't Reach Backend
**Fix:**
```bash
cd /home/ubuntu/Elora/client
nano .env.production
```
Add:
```env
VITE_API_URL=http://54.179.120.126/api
VITE_API_BASE=http://54.179.120.126
```
```bash
npm run build
sudo systemctl restart nginx
```

### Issue 4: 502 Bad Gateway
**Fix:**
```bash
sudo systemctl restart elora
sudo systemctl status elora  # Check if running
```

### Issue 5: Backend Service Crashed
**Check logs:**
```bash
sudo journalctl -u elora -n 50 --no-pager
tail -f /home/ubuntu/Elora/server/debug.log
```

---

## 🛠️ Quick Commands Reference

```bash
# Check service status
sudo systemctl status elora
sudo systemctl status nginx
sudo systemctl status mysql

# Restart services
sudo systemctl restart elora
sudo systemctl restart nginx

# View logs
sudo journalctl -u elora -f
tail -f /home/ubuntu/Elora/server/debug.log

# Test API
curl http://54.179.120.126/api/health

# Check database
cd /home/ubuntu/Elora/server
source venv/bin/activate
python manage.py dbshell
```

---

## 📖 Full Documentation

For detailed troubleshooting, see:
- **PRODUCTION_TROUBLESHOOTING.md** - Complete troubleshooting guide
- **DEPLOYMENT.md** - Full deployment instructions

---

## 🆘 Still Having Issues?

Collect this information:

```bash
# System status
sudo systemctl status elora nginx mysql > status.txt

# Recent logs
sudo journalctl -u elora -n 100 --no-pager > elora_logs.txt
tail -n 100 /home/ubuntu/Elora/server/debug.log > debug_log.txt

# API test
curl -v http://54.179.120.126/api/health > api_test.txt

# Configuration (remove passwords first!)
cat /home/ubuntu/Elora/server/.env | grep -v PASSWORD > config.txt
```

Send these files for help.

