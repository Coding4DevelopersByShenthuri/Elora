# Email Verification Fix - Step by Step

## Problem
Emails are printing to console instead of being sent via SMTP, even though you have credentials configured.

## Root Cause
The `.env` file is either:
1. Not in the correct location
2. Not being read by Django
3. Has `EMAIL_BACKEND` explicitly set to console
4. Has empty or incorrectly formatted values

## Solution

### Step 1: Check if .env file exists

**On your local machine:**
```bash
cd server
ls -la .env
# or on Windows
dir .env
```

**On production server:**
```bash
cd /home/ubuntu/Elora/server
ls -la .env
cat .env | grep EMAIL
```

### Step 2: Create/Update .env file

The `.env` file must be in the `server/` directory (same level as `manage.py`).

**Location:** `server/.env`

**Content (for production):**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=elora.toinfo@gmail.com
EMAIL_HOST_PASSWORD=mbmonrswlvhszqkt
DEFAULT_FROM_EMAIL=elora.toinfo@gmail.com
FRONTEND_URL=http://54.179.120.126
```

**Important:**
- NO spaces around `=`
- NO quotes around values
- NO trailing spaces
- Each value on its own line

### Step 3: Verify Configuration

**Run the diagnostic script:**

**Locally:**
```bash
cd server
python check_email_config.py
```

**On production server:**
```bash
cd /home/ubuntu/Elora/server
source venv/bin/activate
python check_email_config.py
```

This will show you:
- If .env file exists
- What values are being read
- Which backend is active
- What needs to be fixed

### Step 4: Restart Server

**After updating .env, you MUST restart:**

**Local:**
```bash
# Stop current server (Ctrl+C)
# Then restart
python manage.py runserver
```

**Production:**
```bash
sudo systemctl restart elora
sudo systemctl status elora
```

### Step 5: Test Email Sending

**Test via Django shell:**

```bash
cd server
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate     # On Windows

python manage.py shell
```

Then:
```python
from django.core.mail import send_mail
from django.conf import settings

# Check backend
print("Email Backend:", settings.EMAIL_BACKEND)

# Test sending
send_mail(
    'Test Email',
    'This is a test email',
    settings.DEFAULT_FROM_EMAIL,
    ['your-email@gmail.com'],
    fail_silently=False
)
```

If using SMTP, you should receive the email. If using console, it will print to terminal.

## Common Issues

### Issue 1: .env file in wrong location
**Symptom:** Values show as "NOT SET" in diagnostic script

**Fix:** Move `.env` to `server/.env` (same directory as `manage.py`)

### Issue 2: EMAIL_BACKEND explicitly set to console
**Symptom:** Diagnostic shows console backend even with credentials

**Fix:** Remove `EMAIL_BACKEND` line from `.env` OR change it to:
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
```

### Issue 3: Empty values in .env
**Symptom:** Values exist but are empty strings

**Fix:** Check for:
- Spaces around `=`
- Empty lines
- Comments on same line (use `#` on separate line)

### Issue 4: Server not restarted
**Symptom:** Changes to .env not taking effect

**Fix:** Restart Django server after changing .env

## Verification Checklist

- [ ] `.env` file exists in `server/` directory
- [ ] `.env` contains `EMAIL_HOST_USER=elora.toinfo@gmail.com`
- [ ] `.env` contains `EMAIL_HOST_PASSWORD=mbmonrswlvhszqkt` (no spaces)
- [ ] `.env` contains `DEFAULT_FROM_EMAIL=elora.toinfo@gmail.com`
- [ ] `.env` does NOT have `EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend`
- [ ] Server has been restarted after updating .env
- [ ] Diagnostic script shows SMTP backend
- [ ] Test email sends successfully

## Quick Fix Command

**On production server, run:**
```bash
cd /home/ubuntu/Elora/server

# Check current .env
cat .env | grep EMAIL

# If EMAIL_BACKEND is set to console, remove it or change it
nano .env
# Remove line: EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
# OR change to: EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend

# Verify credentials are set
grep -E "EMAIL_HOST_USER|EMAIL_HOST_PASSWORD|DEFAULT_FROM_EMAIL" .env

# Restart server
sudo systemctl restart elora

# Check logs
tail -f debug.log | grep -i email
```

## Expected Behavior

**After fix:**
- Registration → Email sent via SMTP (not printed to console)
- User receives email in inbox
- Verification link works
- User can login after verification

**If still printing to console:**
- Check diagnostic script output
- Verify .env file location
- Check for explicit EMAIL_BACKEND=console
- Restart server

