# Quick Fix for .env File

## Issues Found:
1. ❌ `EMAIL_BACKEND` is set to console
2. ❌ `EMAIL_HOST_PASSWORD` has spaces (should be one continuous string)

## Fix Commands:

### Option 1: Edit .env file directly
```bash
cd /home/ubuntu/Elora/server
nano .env
```

Then change these lines:
```env
# CHANGE THIS LINE:
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# TO THIS:
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend

# AND FIX THE PASSWORD (remove spaces):
EMAIL_HOST_PASSWORD=mbmonrswlvhszqkt
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Option 2: Use sed to fix automatically
```bash
cd /home/ubuntu/Elora/server

# Fix EMAIL_BACKEND
sed -i 's/EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend/EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend/' .env

# Fix EMAIL_HOST_PASSWORD (remove spaces)
sed -i 's/EMAIL_HOST_PASSWORD=mbmo nrsw lvhs zqkt/EMAIL_HOST_PASSWORD=mbmonrswlvhszqkt/' .env

# Verify the changes
cat .env | grep EMAIL
```

### Option 3: Remove EMAIL_BACKEND entirely (Recommended)
The system will auto-detect SMTP when credentials are present:

```bash
cd /home/ubuntu/Elora/server

# Remove the EMAIL_BACKEND line
sed -i '/EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend/d' .env

# Fix EMAIL_HOST_PASSWORD (remove spaces)
sed -i 's/EMAIL_HOST_PASSWORD=mbmo nrsw lvhs zqkt/EMAIL_HOST_PASSWORD=mbmonrswlvhszqkt/' .env

# Verify
cat .env | grep EMAIL
```

## After Fixing:

1. **Verify the changes:**
```bash
cat .env | grep EMAIL
```

Should show:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=elora.toinfo@gmail.com
EMAIL_HOST_PASSWORD=mbmonrswlvhszqkt
DEFAULT_FROM_EMAIL=elora.toinfo@gmail.com
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
```

2. **Restart the server:**
```bash
sudo systemctl restart elora
sudo systemctl status elora
```

3. **Check logs to confirm:**
```bash
tail -f /home/ubuntu/Elora/server/debug.log | grep -i email
```

You should see: `✓ Email credentials detected - using SMTP backend`

4. **Test registration:**
Register a new user and check if email is sent (not printed to console).

