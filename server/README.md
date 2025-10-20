# Elora - Server

Django REST API backend for Elora application.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
```

2. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser (optional):
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

## Project Structure

```
server/
├── api/                  # Main API application
│   ├── migrations/      # Database migrations
│   ├── models.py        # Data models
│   ├── serializers.py   # API serializers
│   ├── views.py         # API views
│   └── urls.py          # API routes
├── crud/                # Project configuration
│   ├── settings.py      # Django settings
│   ├── urls.py          # Main URL configuration
│   ├── wsgi.py          # WSGI config
│   └── asgi.py          # ASGI config
├── logs/                # Application logs
│   └── debug.log        # Debug log file
├── data/                # Application data
│   └── db.sqlite3       # SQLite database
├── venv/                # Virtual environment
├── manage.py            # Django management script
└── requirements.txt     # Python dependencies
```

## API Endpoints

- `/api/` - Main API routes
- `/admin/` - Django admin interface

## Configuration

- **Database**: SQLite (for development)
- **CORS**: Configured for local frontend development
- **JWT**: Token-based authentication
- **Debug Mode**: Enabled for development

## Notes

- Debug log is stored in `logs/debug.log`
- Database file is in `data/db.sqlite3`
- For production, update `settings.py` with proper configuration
- Use environment variables for sensitive data in production

