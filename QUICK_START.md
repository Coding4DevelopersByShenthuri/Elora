# Quick Start Deployment Guide

## Prerequisites
- ✅ Connected to server via PuTTY (Username: ubuntu, IP: 54.179.120.126)

## Quick Deployment Steps

### Option 1: Automated Script (Recommended)

1. **Upload project to server** (using WinSCP, FileZilla, or SCP):
   - Upload entire `Elora` folder to `/home/ubuntu/Elora`

2. **Run deployment script**:
   ```bash
   cd /home/ubuntu/Elora
   chmod +x deploy.sh
   ./deploy.sh
   ```
   The script will guide you through the setup.

### Option 2: Manual Deployment

Follow the detailed steps in `DEPLOYMENT.md`

## Essential Commands After Deployment

### Check Status
```bash
sudo systemctl status elora    # Check Gunicorn
sudo systemctl status nginx     # Check Nginx
```

### Restart Services
```bash
sudo systemctl restart elora
sudo systemctl restart nginx
```

### View Logs
```bash
# Gunicorn logs
sudo journalctl -u elora -f
tail -f /home/ubuntu/Elora/server/logs/error.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Update Application
```bash
cd /home/ubuntu/Elora/server
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart elora

cd ../client
npm run build
sudo systemctl restart nginx
```

## Access Your Application

- **Frontend**: http://54.179.120.126
- **API**: http://54.179.120.126/api/
- **Admin**: http://54.179.120.126/api/admin/

## Create Admin User

```bash
cd /home/ubuntu/Elora/server
source venv/bin/activate
python manage.py createsuperuser
```

## Troubleshooting

### 502 Bad Gateway
- Check if Gunicorn is running: `sudo systemctl status elora`
- Check logs: `sudo journalctl -u elora -n 50`

### Static files not loading
```bash
cd /home/ubuntu/Elora/server
source venv/bin/activate
python manage.py collectstatic --noinput
```

### Permission errors
```bash
sudo chown -R ubuntu:www-data /home/ubuntu/Elora
sudo chmod -R 755 /home/ubuntu/Elora
```

## Files Created

- `DEPLOYMENT.md` - Detailed deployment guide
- `deploy.sh` - Automated deployment script
- `server/gunicorn_config.py` - Gunicorn configuration
- `server/nginx_production.conf` - Nginx configuration template
- `server/systemd_elora.service` - Systemd service file template

