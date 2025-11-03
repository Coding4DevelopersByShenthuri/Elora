# How to Start the Backend Server

## Quick Start

The "Server not reachable" error means the Django backend server is not running. Follow these steps:

### 1. Start the Django Backend Server

Open a **new terminal window** and run:

```bash
cd server
python manage.py runserver
```

You should see output like:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### 2. Keep the Server Running

**IMPORTANT**: Keep this terminal window open. The server must be running while you use the admin portal.

### 3. Start the Frontend (if not already running)

In another terminal window:

```bash
cd client
npm run dev
```

### 4. Access Admin Portal

Once both servers are running:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Admin Login: http://localhost:5173/admin/login

## Troubleshooting

### Port 8000 Already in Use

If you get an error that port 8000 is already in use:

```bash
# Option 1: Use a different port
python manage.py runserver 8001

# Option 2: Kill the process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Then start the server again
python manage.py runserver
```

### Cannot Connect to Server

1. **Check if server is running**: Open http://localhost:8000/api/health in your browser
   - Should return: `{"status":"healthy","message":"Elora API is running"}`
   
2. **Check CORS settings**: Make sure `server/crud/settings.py` has:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:5173",
       ...
   ]
   ```

3. **Check firewall**: Make sure Windows Firewall isn't blocking port 8000

### Database Issues

If you get database errors:

```bash
cd server
python manage.py migrate
python manage.py runserver
```

## Quick Commands Reference

```bash
# Start backend server
cd server
python manage.py runserver

# Start frontend (in another terminal)
cd client
npm run dev

# Create superuser (if needed)
cd server
python create_superuser.py
```

## Verification

To verify everything is working:

1. ✅ Backend running: Visit http://localhost:8000/api/health
2. ✅ Frontend running: Visit http://localhost:5173
3. ✅ Admin login: Visit http://localhost:5173/admin/login
4. ✅ Login with your superuser credentials

If all checks pass, you should be able to login to the admin portal!

