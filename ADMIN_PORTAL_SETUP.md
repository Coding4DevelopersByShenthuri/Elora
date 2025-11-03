# Admin Portal Setup Guide

## Overview
The Admin Portal for Elora provides comprehensive management tools for administrators to oversee the platform, manage users, view analytics, and configure settings.

## Features

### 🎯 Admin Dashboard
- **Overview Statistics**: Total users, active users, new registrations
- **User Growth Charts**: Monthly user growth visualization
- **Recent Activity**: Real-time activity feed
- **Platform Health**: System status and metrics

### 👥 User Management
- **User List**: Searchable and filterable user list
- **User Details**: View and edit user information
- **Role Management**: Assign staff/superuser roles
- **User Statistics**: View user progress and activity

### 📊 Analytics
- **Time Series Data**: Track registrations, completions, and sessions over time
- **Lesson Distribution**: Visualize lesson types and content types
- **Top Lessons**: Most popular lessons by completion
- **Custom Date Ranges**: Filter analytics by 7, 30, 90, or 180 days

### ⚙️ Settings
- **Analytics Integration**: Configure Google Analytics and Microsoft Clarity
- **Security Settings**: Email verification, 2FA, session management
- **General Settings**: Platform configuration and preferences

## Setup Instructions

### 1. Create a Superuser

#### Option A: Using Python Script (Recommended)
```bash
cd server
python create_superuser.py
```

Follow the prompts to enter:
- Username
- Email
- Password (minimum 8 characters)
- First Name (optional)
- Last Name (optional)

#### Option B: Using Django Admin
```bash
cd server
python manage.py createsuperuser
```

#### Option C: Using Django Shell
```bash
cd server
python manage.py shell
```

Then run:
```python
from django.contrib.auth.models import User
from api.models import UserProfile

user = User.objects.create_user(
    username='admin',
    email='admin@example.com',
    password='your_password',
    is_staff=True,
    is_superuser=True
)
UserProfile.objects.create(user=user)
```

### 2. Access Admin Portal

1. Start the development server:
   ```bash
   # Backend (Terminal 1)
   cd server
   python manage.py runserver
   
   # Frontend (Terminal 2)
   cd client
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/admin/login`

3. Login with your superuser credentials

### 3. Configure Analytics (Optional)

#### Google Analytics
1. Get your Google Analytics 4 Measurement ID (format: G-XXXXXXXXXX)
2. Add to `.env` file:
   ```
   VITE_GA_ID=G-XXXXXXXXXX
   ```
3. Restart the frontend server

#### Microsoft Clarity
1. Get your Clarity Project ID from [Microsoft Clarity](https://clarity.microsoft.com)
2. Add to `.env` file:
   ```
   VITE_CLARITY_ID=your_clarity_project_id
   ```
3. Restart the frontend server

## API Endpoints

All admin endpoints require authentication and admin privileges:

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - List users (with pagination and filters)
- `GET /api/admin/users/<id>` - Get user details
- `PUT /api/admin/users/<id>` - Update user
- `DELETE /api/admin/users/<id>` - Deactivate user
- `POST /api/admin/users/create-superuser` - Create superuser
- `GET /api/admin/analytics?days=30` - Get analytics data

## Security

- All admin routes require `is_staff` or `is_superuser` permissions
- Admin login checks for staff/superuser status before granting access
- JWT authentication is used for all API requests
- User deactivation (soft delete) preserves data integrity

## Troubleshooting

### Cannot Access Admin Portal
- Verify user has `is_staff=True` or `is_superuser=True`
- Check JWT token is valid
- Clear browser cache and localStorage

### Analytics Not Showing
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure analytics scripts are loading (check Network tab)

### API Errors
- Check backend server is running on port 8000
- Verify CORS settings allow requests from frontend
- Check server logs for detailed error messages

## Best Practices

1. **Create Multiple Admin Accounts**: Don't rely on a single admin account
2. **Use Strong Passwords**: Minimum 8 characters, mix of letters, numbers, symbols
3. **Regular Audits**: Review user activity and access logs regularly
4. **Analytics Privacy**: Configure analytics to respect user privacy
5. **Backup Regularly**: Ensure database backups are in place

## Additional Notes

- The admin portal is separate from the main application
- Admin routes start with `/admin/`
- Regular users cannot access admin routes even if they know the URLs
- All admin actions are logged (can be extended for audit trails)

## Support

For issues or questions:
- Check server logs: `server/debug.log`
- Review API responses in browser Network tab
- Verify database migrations are up to date: `python manage.py migrate`

