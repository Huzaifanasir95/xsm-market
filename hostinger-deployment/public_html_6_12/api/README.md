# PHP Backend Deployment Guide for Hostinger

## Overview
This PHP backend is a complete conversion of your Node.js backend, providing 100% identical API responses and functionality. It's specifically designed to work on Hostinger shared hosting.

## Files Structure
```
php-backend/
├── index.php              # Main entry point and router
├── .htaccess              # URL rewriting and security headers
├── .env.example           # Environment variables template
├── config/
│   ├── database.php       # Database connection
│   ├── env.php           # Environment loader
│   └── cors.php          # CORS configuration
├── controllers/
│   ├── AuthController.php
│   ├── UserController.php
│   ├── AdController.php
│   ├── ChatController.php
│   └── AdminController.php
├── models/
│   ├── User.php
│   ├── Ad.php
│   ├── Chat.php
│   ├── Message.php
│   └── ChatParticipant.php
├── middleware/
│   └── auth.php
├── utils/
│   ├── response.php
│   ├── jwt.php
│   ├── validation.php
│   └── email.php
└── routes/
    ├── contact.php
    ├── social-media.php
    └── debug.php
```

## Deployment Steps

### 1. Upload Files to Hostinger
1. Upload all files from `php-backend/` to your Hostinger public_html directory
2. If you want the API at a subdomain (api.xsmmarket.com), upload to a subdirectory like `public_html/api/`

### 2. Database Setup
1. Create a MySQL database in your Hostinger control panel
2. Import your existing database schema or create tables manually
3. Note down the database credentials (host, name, user, password)

### 3. Environment Configuration
1. Copy `.env.example` to `.env`
2. Update the database credentials in `.env`:
   ```
   DB_HOST=your_hostinger_db_host
   DB_NAME=your_database_name
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   ```
3. Generate secure JWT secrets:
   ```
   JWT_SECRET=your-super-secret-jwt-key-64-characters-long
   JWT_REFRESH_SECRET=your-refresh-secret-key-64-characters-long
   ```
4. Configure email settings for notifications

### 4. File Permissions
Set appropriate permissions:
- Directories: 755
- PHP files: 644
- .htaccess: 644
- .env: 600 (most restrictive)

### 5. SSL Certificate
- Enable SSL/HTTPS in your Hostinger control panel
- Update CORS origins in `config/cors.php` to include your domain

### 6. Testing
1. Test the health endpoint: `https://yourdomain.com/api/health`
2. Test authentication: Register a new user
3. Test database connection: Use debug endpoints (disable in production)

## API Endpoints

The PHP backend provides identical endpoints to your Node.js version:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/check-username` - Check username availability
- `GET /api/user/{id}` - Get user by ID

### Ads
- `GET /api/ads` - Get all ads with filters
- `POST /api/ads` - Create new ad
- `GET /api/ads/{id}` - Get ad by ID
- `PUT /api/ads/{id}` - Update ad
- `DELETE /api/ads/{id}` - Delete ad
- `PUT /api/ads/{id}/mark-sold` - Mark as sold
- `GET /api/ads/my-ads` - Get user's ads
- `GET /api/ads/search` - Search ads

### Chat System
- `GET /api/chat` - Get user chats
- `POST /api/chat` - Create/get chat
- `GET /api/chat/{id}/messages` - Get chat messages
- `POST /api/chat/{id}/messages` - Send message
- `PUT /api/chat/{id}/read` - Mark messages as read
- `POST /api/chat/ad-inquiry` - Create ad inquiry chat

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/ads` - Get all ads
- `PUT /api/admin/users/{id}/ban` - Ban user
- `PUT /api/admin/users/{id}/unban` - Unban user
- `DELETE /api/admin/ads/{id}/delete` - Delete ad

### Other
- `POST /api/contact` - Contact form
- `POST /api/social-media/extract` - Extract social media data
- `POST /api/social-media/analyze` - Analyze social media
- `GET /api/health` - Health check

## Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - Bcrypt password encryption
3. **Input Validation** - All inputs are sanitized
4. **CORS Protection** - Proper CORS headers
5. **SQL Injection Prevention** - Prepared statements
6. **XSS Protection** - Output escaping
7. **Rate Limiting** - Can be added via .htaccess
8. **HTTPS Enforcement** - SSL/TLS encryption

## Performance Optimizations

1. **Database Connection Pooling** - Reused connections
2. **Query Optimization** - Efficient database queries
3. **JSON Response Caching** - Minimal data transfer
4. **Gzip Compression** - Enabled via .htaccess
5. **Browser Caching** - Static resource caching

## Error Handling

- All errors are logged for debugging
- Consistent JSON error responses
- Development vs production error levels
- Custom error pages for HTTP errors

## Monitoring & Logging

- Error logging to PHP error log
- Custom application logging
- Database query logging (development)
- Performance monitoring capabilities

## Maintenance

1. **Regular Backups** - Database and files
2. **Log Rotation** - Prevent log file bloat
3. **Security Updates** - Keep PHP and dependencies updated
4. **Performance Monitoring** - Track response times
5. **Database Optimization** - Regular cleanup and optimization

## Production Checklist

- [ ] Update .env with production values
- [ ] Set PHP_ENV=production
- [ ] Disable debug routes
- [ ] Enable error logging
- [ ] Configure SSL/HTTPS
- [ ] Set up database backups
- [ ] Configure email settings
- [ ] Test all endpoints
- [ ] Monitor error logs
- [ ] Set up domain/subdomain

## Support

For issues or questions:
1. Check error logs in your Hostinger control panel
2. Use the debug endpoints (development only)
3. Verify database connectivity
4. Check file permissions
5. Ensure .env file is properly configured

The PHP backend provides 100% compatibility with your existing frontend and maintains all the functionality of your Node.js backend while being optimized for Hostinger shared hosting.
